import { test, expect } from '@playwright/test';

// Needs gc() exposed, which forces its own worker -- hence a separate file.
test.use({ launchOptions: { args: ['--js-flags=--expose-gc'] } });

test('Programmatic>ImperativeTargetElement: target is held only weakly', async ({ page }) => {
    await page.goto('./tests/Programmatic/ImperativeTargetElementGC.html');
    await page.waitForTimeout(2500);
    // Remove the kitchen light from the DOM and drop the page's own references to it.
    // The test's own WeakRef lets it observe collection without keeping the element alive.
    await page.evaluate(() => {
        const kitchenLight = document.querySelector('#kitchen');
        globalThis.__kitchenRef = new WeakRef(kitchenLight);
        kitchenLight.remove();
    });
    // WeakRef targets survive until the current job ends, so collect across several turns.
    const collected = await page.evaluate(async () => {
        const ref = globalThis.__kitchenRef;
        for(let i = 0; i < 20 && ref.deref() !== undefined; i++){
            await new Promise(r => setTimeout(r, 50));
            globalThis.gc();
        }
        return ref.deref() === undefined;
    });
    expect(collected, 'kitchen light was garbage collected, so do-toggle held no strong reference').toBe(true);
    // Clicking afterwards is a harmless no-op for the collected target; the others still toggle.
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => document.querySelector('#button').click());
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.querySelector('#porch').isOn), 'the other (live) target still toggles').toBe(true);
});
