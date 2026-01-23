
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CheckShopCatalogButtons_2026-01-22', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000/Life-Game-Management-System/', { waitUntil: 'networkidle' });

    // Click element
    await page.click('text=补给黑市（奖励）');

    // Take screenshot
    await page.screenshot({ path: 'shop_catalog_buttons.png', { fullPage: true } });
});