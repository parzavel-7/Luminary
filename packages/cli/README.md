# @luminary/cli

> WCAG accessibility audit and CI/CD quality gate tool from [Luminary](https://luminary-audit.com).

## Installation

```bash
npm install -g @luminary/cli
# or use directly
npx @luminary/cli scan https://example.com
```

## Usage

```bash
luminary scan <url> [options]
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `-t, --threshold <score>` | `90` | Minimum accessibility score to pass (0–100). Exit code 1 if below. |
| `--api-url <url>` | `$LUMINARY_API_URL` or `http://localhost:8080` | Luminary API base URL |
| `--json` | `false` | Output results as raw JSON (useful for CI integrations) |

### Examples

```bash
# Basic scan with default 90% threshold
luminary scan https://example.com

# Enforce an 80% minimum score in a CI pipeline
luminary scan https://example.com --threshold 80

# Output raw JSON for custom CI integrations
luminary scan https://example.com --json

# Point to your self-hosted Luminary API
luminary scan https://example.com --api-url https://api.yourcompany.com --threshold 85
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Accessibility Audit
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - name: Run Luminary WCAG Audit
        run: npx @luminary/cli scan ${{ env.SITE_URL }} --threshold 90
        env:
          SITE_URL: https://your-preview-url.com
          LUMINARY_API_URL: https://api.luminary-audit.com
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Audit passed — score is at or above `--threshold` |
| `1` | Audit failed — score is below threshold, or an error occurred |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LUMINARY_API_URL` | Base URL of your Luminary API server |
| `LUMINARY_FRONTEND_URL` | Base URL of your Luminary dashboard (for report links) |
