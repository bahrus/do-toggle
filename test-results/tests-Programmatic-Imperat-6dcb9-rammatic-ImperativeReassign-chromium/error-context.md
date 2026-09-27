# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\Programmatic\ImperativeReassign.spec.mjs >> Programmatic>ImperativeReassign
- Location: tests\Programmatic\ImperativeReassign.spec.mjs:2:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('#target')
Expected: "good"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('#target') with timeout 5000ms
  - waiting for locator('#target')
    14 × locator resolved to <div id="target"></div>
       - unexpected value "null"

```

```yaml
- text: "Is happy: true 💡 ON"
- button "Toggle"
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | test('Programmatic>ImperativeReassign', async ({ page }) => {
  3 |     await page.goto('./tests/Programmatic/ImperativeReassign.html');
  4 |     await page.waitForTimeout(2500);
  5 |     const target = page.locator('#target');
> 6 |     await expect(target).toHaveAttribute('mark', 'good');
    |                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  7 | });
  8 | 
```