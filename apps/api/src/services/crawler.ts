import { chromium, Page } from 'playwright';
import { injectAxe, getViolations } from 'axe-playwright';

export async function scanUrl(url: string) {
  console.log(`Starting scan for: ${url}`);
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();

  try {
    // Exclude heavy, non-structural resource types to save bandwidth and speed up scans by up to 60%
    await page.route('**/*', (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      const requestUrl = request.url().toLowerCase();
      
      const blockedTypes = ['image', 'media', 'font'];
      const blockedExtensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
        '.mp4', '.webm', '.ogg', '.mov',
        '.woff', '.woff2', '.ttf', '.otf', '.eot'
      ];
      
      const shouldBlock = blockedTypes.includes(resourceType) || 
                          blockedExtensions.some(ext => requestUrl.endsWith(ext) || requestUrl.includes(ext + '?'));
      
      if (shouldBlock) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log(`Navigating to ${url}...`);
    // Try with domcontentloaded first, which is faster and less prone to networkidle timeouts
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Give it a few seconds for dynamic content
    await page.waitForTimeout(3000);

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

    console.log(`Audit complete. Found ${violations.length} violations.`);
    return violations;
  } catch (error: any) {
    console.error(`Detailed Error scanning URL ${url}:`, error.message);
    throw new Error(`Crawler Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}
