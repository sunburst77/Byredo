const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Navigating to http://localhost:3000/shop/1...');
  await page.goto('http://localhost:3000/shop/1', { waitUntil: 'networkidle' });
  
  // Take initial screenshot
  console.log('Taking initial screenshot...');
  await page.screenshot({ path: 'screenshot-1-top.png', fullPage: false });
  
  // Get page height
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  console.log(`Page height: ${pageHeight}px, Viewport height: ${viewportHeight}px`);
  
  // Scroll down to see pin section
  console.log('Scrolling down to see pin section...');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-2-pin-section.png', fullPage: false });
  
  // Scroll down more to see related products
  console.log('Scrolling down to see related products...');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-3-related-products.png', fullPage: false });
  
  // Scroll to bottom to see footer
  console.log('Scrolling to bottom to see footer...');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-4-footer.png', fullPage: false });
  
  // Take full page screenshot
  console.log('Taking full page screenshot...');
  await page.screenshot({ path: 'screenshot-5-fullpage.png', fullPage: true });
  
  // Check for specific elements
  console.log('\nChecking for page elements...');
  
  const pinSectionExists = await page.locator('text=PIN').count() > 0;
  console.log(`Pin section exists: ${pinSectionExists}`);
  
  const relatedProductsExists = await page.locator('text=RELATED PRODUCTS').count() > 0;
  console.log(`Related Products section exists: ${relatedProductsExists}`);
  
  const footerExists = await page.locator('footer').count() > 0;
  console.log(`Footer exists: ${footerExists}`);
  
  // Get all visible text content to analyze structure
  const textContent = await page.evaluate(() => {
    const sections = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
      sections.push(`${h.tagName}: ${h.textContent.trim()}`);
    });
    return sections;
  });
  
  console.log('\nPage sections found:');
  textContent.forEach(section => console.log(`  - ${section}`));
  
  await browser.close();
  console.log('\nScreenshots saved successfully!');
})();
