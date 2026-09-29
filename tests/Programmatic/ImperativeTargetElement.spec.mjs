import { test, expect } from '@playwright/test';

test('Programmatic>ImperativeTargetElement', async ({ page }) => {
    await page.goto('./tests/Programmatic/ImperativeTargetElement.html');
    await page.waitForTimeout(2500);
    const target = page.locator('#target');
    await expect(target, await target.getAttribute('data-checks') ?? '').toHaveAttribute('mark', 'good');
});
