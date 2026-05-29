#!/usr/bin/env node
/**
 * @luminary/cli
 * Luminary Accessibility Audit CLI — Run WCAG audits and enforce quality gates in CI/CD.
 *
 * Usage:
 *   luminary scan <url> [options]
 *   luminary scan https://example.com --threshold 90
 *   luminary scan https://example.com --api-url https://api.myapp.com --threshold 80
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('luminary')
  .description(
    'Luminary CLI — WCAG accessibility audit and CI/CD quality gate tool'
  )
  .version('0.1.0');

// ─── luminary scan <url> ─────────────────────────────────────────────────────
program
  .command('scan <url>')
  .description('Run a WCAG accessibility audit against a URL')
  .option(
    '-t, --threshold <score>',
    'Minimum accessibility score required to pass (0–100). Exit code 1 if score is below.',
    '90'
  )
  .option(
    '--api-url <url>',
    'Luminary API base URL',
    process.env.LUMINARY_API_URL || 'http://localhost:8080'
  )
  .option('--json', 'Output results as raw JSON (useful for CI integrations)', false)
  .action(async (url: string, options: { threshold: string; apiUrl: string; json: boolean }) => {
    const threshold = parseInt(options.threshold, 10);

    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      console.error(chalk.red('✖  Invalid threshold. Must be a number between 0 and 100.'));
      process.exit(1);
    }

    if (!options.json) {
      console.log('');
      console.log(chalk.bold.white('  ╔══════════════════════════════════════╗'));
      console.log(chalk.bold.white('  ║') + chalk.bold.cyan('       LUMINARY AUDIT ENGINE         ') + chalk.bold.white('║'));
      console.log(chalk.bold.white('  ╚══════════════════════════════════════╝'));
      console.log('');
      console.log(chalk.gray('  URL:       ') + chalk.white(url));
      console.log(chalk.gray('  Threshold: ') + chalk.white(`${threshold}%`));
      console.log(chalk.gray('  API:       ') + chalk.white(options.apiUrl));
      console.log('');
    }

    const spinner = options.json ? null : ora({ text: 'Crawling and running WCAG audit...', color: 'cyan' }).start();

    try {
      const response = await fetch(`${options.apiUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        // 3-minute timeout — headless scans can be slow
        signal: AbortSignal.timeout(180_000),
      });

      if (!response.ok) {
        const body: any = await response.json().catch(() => ({}));
        spinner?.fail(chalk.red('Audit request failed.'));
        console.error(chalk.red(`  API Error (${response.status}): ${body?.message || body?.error || 'Unknown error'}`));
        process.exit(1);
      }

      const data: any = await response.json();
      spinner?.succeed(chalk.green('Audit complete!'));

      const { score, counts, violations, url: auditedUrl } = data;

      if (options.json) {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('');
        // Score banner
        const scoreColor =
          score >= threshold
            ? chalk.bgGreen.black
            : chalk.bgRed.white;
        console.log(
          '  ' + scoreColor(` SCORE: ${score}% `) +
          (score >= threshold
            ? chalk.green('  ✔  Passed threshold!')
            : chalk.red(`  ✖  Below threshold of ${threshold}%`))
        );
        console.log('');

        // Violation counts
        if (counts) {
          console.log(chalk.bold('  Violation Summary'));
          console.log(chalk.red(`  ● Critical: ${counts.critical || 0}`));
          console.log(chalk.yellow(`  ● Serious:  ${counts.serious || 0}`));
          console.log(chalk.blue(`  ● Moderate: ${counts.moderate || 0}`));
          console.log(chalk.gray(`  ● Minor:    ${counts.minor || 0}`));
          console.log('');
        }

        // Top violations
        const topViolations = (violations || []).slice(0, 5);
        if (topViolations.length > 0) {
          console.log(chalk.bold('  Top Violations'));
          topViolations.forEach((v: any, i: number) => {
            const impactColor =
              v.impact === 'critical' ? chalk.red
              : v.impact === 'serious' ? chalk.yellow
              : chalk.blue;
            console.log(
              `  ${chalk.dim(`${i + 1}.`)} ${impactColor(`[${v.impact?.toUpperCase() || 'UNKNOWN'}]`)} ${chalk.white(v.help || v.id)}`
            );
          });
          if ((violations || []).length > 5) {
            console.log(chalk.gray(`  ... and ${violations.length - 5} more. Run a full report at your Luminary dashboard.`));
          }
          console.log('');
        }

        if (data.id) {
          const frontendUrl = process.env.LUMINARY_FRONTEND_URL || 'https://luminary-audit.com';
          console.log(chalk.gray(`  Full report: ${frontendUrl}/report/${data.id}`));
          console.log('');
        }
      }

      // Exit with code 1 if score is below the threshold — this fails CI builds
      if (score < threshold) {
        if (!options.json) {
          console.error(chalk.red.bold(`  ✖  Build failed: Accessibility score ${score}% is below the required ${threshold}%.`));
          console.error(chalk.yellow('     Upgrade your WCAG compliance or lower --threshold to pass this gate.'));
          console.log('');
        }
        process.exit(1);
      }

      process.exit(0);

    } catch (error: any) {
      spinner?.fail(chalk.red('Audit failed.'));
      if (error?.name === 'TimeoutError') {
        console.error(chalk.red('  ✖  Request timed out after 3 minutes. The site may be unreachable or slow.'));
      } else {
        console.error(chalk.red(`  ✖  ${error.message}`));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
