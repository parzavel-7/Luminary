import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fetch the flat file tree of a GitHub repo (up to 1 level of recursion).
 * Returns only source-relevant files (HTML, JSX, TSX, Vue, Svelte templates).
 */
async function getRepoFileTree(
  repoFullName: string,
  sha: string,
  headers: Record<string, string>
): Promise<{ path: string; sha: string }[]> {
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/git/trees/${sha}?recursive=1`,
    { headers }
  );
  const data: any = await res.json();
  if (!res.ok) throw new Error(`GitHub Tree API Error: ${data.message}`);

  const targetExtensions = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte'];
  return (data.tree || []).filter(
    (f: any) =>
      f.type === 'blob' &&
      targetExtensions.some((ext) => f.path.toLowerCase().endsWith(ext))
  );
}

/**
 * Fetch the raw content of a file blob from GitHub.
 */
async function getFileContent(
  repoFullName: string,
  filePath: string,
  headers: Record<string, string>
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
    { headers }
  );
  if (!res.ok) return null;
  const data: any = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

/**
 * Attempt to patch a file's content by replacing the violating HTML snippet
 * with the AI-generated fix. Returns null if the snippet isn't found.
 */
function applyInlineFix(
  fileContent: string,
  originalSnippet: string,
  fixedSnippet: string
): string | null {
  // Normalize whitespace slightly for matching tolerance
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
  const normalizedOriginal = normalize(originalSnippet);

  // Try exact match first
  if (fileContent.includes(originalSnippet)) {
    return fileContent.replace(originalSnippet, fixedSnippet);
  }

  // Try line-by-line soft match (handles indentation differences)
  const lines = fileContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line !== undefined) {
      if (normalize(line).includes(normalizedOriginal.slice(0, 60))) {
        lines[i] = line.replace(line.trim(), fixedSnippet.trim());
        return lines.join('\n');
      }
    }
  }

  return null; // snippet not found in this file
}

/**
 * Service to handle GitHub operations using stored user tokens.
 * Phase 12: Creates PRs with actual inline source file diffs.
 */
export async function createFixPR(userId: string, repoFullName: string, violation: any) {
  try {
    // 1. Fetch the GitHub integration for the user
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'github')
      .single();

    if (error || !integration) {
      throw new Error('GitHub integration not found for this user.');
    }

    const token = integration.config.access_token;
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // 2. Get the default branch and latest commit SHA
    const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
    const repoData: any = await repoRes.json();
    if (!repoRes.ok) throw new Error(`GitHub Repo API Error: ${repoData.message}`);
    const defaultBranch = repoData.default_branch;

    const refRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/ref/heads/${defaultBranch}`,
      { headers }
    );
    const refData: any = await refRes.json();
    const latestSha = refData.object.sha;

    // 3. Create a fix branch
    const branchName = `luminary-fix-${violation.id.toLowerCase()}-${Math.floor(
      Math.random() * 9999
    )}`;
    const branchRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/refs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: latestSha }),
      }
    );
    if (!branchRes.ok) {
      const err: any = await branchRes.json();
      throw new Error(`Failed to create branch: ${err.message}`);
    }

    // 4. Walk the file tree and attempt an inline fix
    const originalSnippet: string = violation.nodes?.[0]?.html || '';
    const fixedSnippet: string = violation.ai_fix || '';

    let patchedFilePath: string | null = null;
    let patchedContent: string | null = null;
    let patchedFileSha: string | null = null;

    if (originalSnippet && fixedSnippet) {
      const fileTree = await getRepoFileTree(repoFullName, latestSha, headers);
      console.log(
        `[GitHub] Walking ${fileTree.length} source files for snippet match...`
      );

      for (const file of fileTree) {
        const fileData = await getFileContent(repoFullName, file.path, headers);
        if (!fileData) continue;

        const patched = applyInlineFix(fileData.content, originalSnippet, fixedSnippet);
        if (patched) {
          patchedFilePath = file.path;
          patchedContent = patched;
          patchedFileSha = fileData.sha;
          console.log(`[GitHub] Inline match found in: ${file.path}`);
          break;
        }
      }
    }

    // 5a. Commit the inline diff if a match was found
    if (patchedFilePath && patchedContent) {
      await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${patchedFilePath}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `[Luminary] Fix ${violation.id}: ${violation.help}`,
            content: Buffer.from(patchedContent).toString('base64'),
            sha: patchedFileSha,
            branch: branchName,
          }),
        }
      );
    } else {
      // 5b. Fallback: commit a descriptive remediation guide if no inline match
      console.log('[GitHub] No inline match found — falling back to LUMINARY_FIX.md');
      const fallbackContent = `# Luminary Accessibility Remediation
## Violation: ${violation.help} (${violation.id})

**Description:** ${violation.description}
**Impact:** ${violation.impact?.toUpperCase() || 'UNKNOWN'}

### Original HTML:
\`\`\`html
${originalSnippet || 'See full report for details'}
\`\`\`

### Proposed Code Fix:
\`\`\`html
${fixedSnippet || 'See full report for details'}
\`\`\`

### Explanation:
${violation.ai_explanation || 'Apply the proposed fix above to resolve the WCAG violation.'}

---
*This remediation was automatically generated by [Luminary](https://luminary-audit.com) AI.*
`;
      await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/LUMINARY_FIX.md`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `[Luminary] Accessibility fix guide for ${violation.id}`,
            content: Buffer.from(fallbackContent).toString('base64'),
            branch: branchName,
          }),
        }
      );
    }

    // 6. Open the Pull Request
    const prBody = patchedFilePath
      ? `## ♿ Luminary Accessibility Fix

Luminary detected a **${violation.impact?.toUpperCase() || 'HIGH'}** severity WCAG violation and applied an inline code fix.

| Field | Details |
|-------|---------|
| **Rule** | \`${violation.id}\` |
| **Description** | ${violation.description} |
| **File Patched** | \`${patchedFilePath}\` |

### What Changed
The violating HTML element was located and replaced with an accessible alternative.

---
*Auto-generated by [Luminary](https://luminary-audit.com)*`
      : `## ♿ Luminary Accessibility Remediation Guide

Luminary could not locate the exact snippet in source files, so a remediation guide has been added as \`LUMINARY_FIX.md\`.

| Field | Details |
|-------|---------|
| **Rule** | \`${violation.id}\` |
| **Impact** | ${violation.impact?.toUpperCase() || 'UNKNOWN'} |

---
*Auto-generated by [Luminary](https://luminary-audit.com)*`;

    const prRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `[Luminary] ♿ ${violation.help}`,
          head: branchName,
          base: defaultBranch,
          body: prBody,
        }),
      }
    );

    const prData: any = await prRes.json();
    if (!prRes.ok) throw new Error(`Failed to create PR: ${prData.message}`);

    return {
      success: true,
      url: prData.html_url,
      inlinePatch: !!patchedFilePath,
      patchedFile: patchedFilePath,
    };
  } catch (error: any) {
    console.error('GitHub PR Service Error:', error);
    return { success: false, error: error.message };
  }
}
