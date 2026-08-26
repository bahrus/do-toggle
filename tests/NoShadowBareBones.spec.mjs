import { test, expect } from '@playwright/test';
test('NoShadowBareBones', async ({ page }) => {
    await page.goto('./tests/NoShadowBareBones.html');
    // wait for 3 seconds
    await page.waitForTimeout(3000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
