# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [be-bound](../../be-bound) and [be-calculating](../../be-calculating/) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust do-toggle.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, including step 6 (README wording).
do-toggle has the same shape as do-inc and do-invoke, so I applied the same
approach, including your do-inc follow-up that the programmatic property
should accept a string or an object as well as an array.

### Programmatic-friendly property: `toggles`

`hydrate` used to read the attribute's `StatementsResult`
(`parsedStatements`) directly, and pushed a synthesized statement into it
for the bare-attribute case. Now:

- There is a new property, `toggles`, and it is the only thing `hydrate`
  reads.
- A compact, `when_parsedStatements_changes_call_onParsedStatementsChange`,
  copies each parsed statement's `value` into it. It still throws 400 when
  `success` is false.
- A `toRules()` helper normalizes `toggles`, which accepts:
  - **a host property name**: `'isHappy'`;
  - **a flat object**: `{prop, targetElementId, localEventType}`. With
    `targetElementId` it becomes
    `{targetSpecifier: {targetElementId, targetProp: prop}}`; without it,
    `{hostProp: prop}`. The parsed shape (`hostProp` / `targetSpecifier`) is
    passed through unchanged;
  - **an array of either**, mixed freely;
  - **an empty array**: one rule whose property comes from the `name`
    attribute, else it's inferred, the same as a bare attribute. Only a rule
    naming neither a property nor a target gets the `name` fallback. So
    `{targetElementId: 'x'}` still infers the peer's property, like `⏻=#x`.
- `hydrate` uses
  `ifKeyIn: ['toggles', 'initialized'], ifAllOf: ['toggles', 'enhancedElement', 'initialized']`.
- `hydrate` owns an `AbortController`, so reassigning `toggles` replaces the
  previous listeners instead of stacking them.

### Addendum steps

1. **`init()` awaits `roundabout(...)` and then sets `self.initialized = true`.**
   The `await` was missing.
2. **`ctx.emc || ctx.config`.**
3. **`def.js`** exports `defDoToggle(ref)`. `package.json` has no `exports`
   map and no `files` field, so no change was needed there. I didn't add an
   `exports` map.
4. **Reserved names.** There are no collisions.
5. **Tests.** See below.
6. **README.** Added a "Programmatic attachment (no attribute)" section after
   "Syntax Summary". It has the editorial intro (the "less clunky" point
   mentions the `?.`-not-`.` gotcha the README already warns about),
   registration, the accepted forms, a table mapping each "Syntax Summary"
   line to its object, and both patterns.

### Types were out of date

`types/do-toggle/types.d.ts` described `TogglingParameters` as
`{prop, targetSpecifier: {prop, targetElementId}}`, but the parser and the
code use `hostProp` and `targetSpecifier.targetProp`. I rewrote it to match
the code, and added:

- `toggles` (in `EndUserProps`, which was empty);
- the `Toggles`, `Toggle` and `FlatTogglingParameters` types;
- `initialized` and `onParsedStatementsChange`.

**These edits are in the `types` git submodule and need to be committed and
pushed separately.**

### Demos and tests

Each demo has a `<mood-stone itemscope>` host with `isHappy` and a peer
`<light-switch id=myLight>` with `isOn`:

- `demo/Programmatic/DeclarativeInSequence.html`: `'isHappy'` via `enh.set`.
- `demo/Programmatic/DeclarativeOutOfSequence.html`: `[]` on
  `<button name=isHappy>`, set before `defDoToggle`.
- `demo/Programmatic/Imperative.html`: `enh.get()` with
  `[{prop: 'isOn', targetElementId: 'myLight'}, 'isHappy']`. Both toggle on
  one click.
- `demo/Programmatic/ImperativeReassign.html`: `'isHappy'`, then reassigned
  to the light switch. One click must turn the light on *without* toggling
  `isHappy`.
- `tests/Programmatic/*` mirror these.

All 11 Playwright tests pass. That's the 7 existing ones, which cover every
attribute demo, plus the 4 new ones. Checks that the new tests catch real
problems:

- With the original `do-toggle.js` / `emc.json`, all 4 fail.
- With only the `abort()` call disabled, `ImperativeReassign` fails.

`emc.json` / `⏻.json` were regenerated with `npm run build`.

