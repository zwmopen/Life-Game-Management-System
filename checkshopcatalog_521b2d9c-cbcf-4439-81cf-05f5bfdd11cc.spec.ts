
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CheckShopCatalog_2026-01-22', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000/Life-Game-Management-System/', { waitUntil: 'networkidle' });

    // Click element
    await page.click('text=补给黑市（奖励）');

    // Click element
    await page.click('text=补给黑市（奖励）');
});