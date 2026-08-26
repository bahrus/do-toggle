import { test, expect } from '@playwright/test';
test('Example1c', async ({ page }) => {
    await page.goto('./tests/Example1c.html');
    // wait for 3 seconds
    await page.waitForTimeout(3000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
