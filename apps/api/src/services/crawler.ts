import { chromium, Page } from 'playwright';
import { injectAxe, getViolations } from 'axe-playwright';

export async function scanUrl(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Navigating to ${url}...`);
    // Wait until network is idle to ensure SPA is fully loaded
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Injecting axe-core...');
    await injectAxe(page);

    console.log('Running accessibility audit...');
    const violations = await getViolations(page, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      }
    });

    return violations;
  } catch (error: any) {
    console.error(`Error scanning URL ${url}:`, error);
    throw new Error(`Failed to scan URL: ${error.message}`);
  } finally {
    await browser.close();
  }
}
