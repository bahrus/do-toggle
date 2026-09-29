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

## Bruce's Response Response

One thing I would like to touch across the board, but starting with do-toggle to start with, is when using the programmatic, specifying the target by id:

```JS
button.enh.get(emc).toggles = [
    // equivalent to ⏻="#myLight?.isOn"
    {prop: 'isOn', targetElementId: 'myLight'},
    // and the host's isHappy, too -- both toggle on each click
    'isHappy',
];
```

isn't always the most convenient approach.  We should also support:

```JS
button.enh.get(emc).toggles = [
    // equivalent to ⏻="#myLight?.isOn"
    {prop: 'isOn', targetElement: myLightElRef},
    // and the host's isHappy, too -- both toggle on each click
    'isHappy',
];
```

Should we support passing in either an element, or a weak reference to an an element?  Either way, we definitely should not store the target with anything other than a weak reference.



## Response to Bruce's Response Response

Done for do-toggle.

### Element or WeakRef? Both.

`targetElement` accepts either:

- **An element.** This is the common case, because frameworks usually hold
  element references, not `WeakRef`s. Making every caller wrap would just be
  ceremony.
- **A `WeakRef<Element>`.** This is for callers that already hold one, so they
  don't have to `deref()` it only for do-toggle to wrap it again.

`targetElement` takes precedence over `targetElementId` if both are given.

### Never stored strongly

Wrapping the element inside the listener's rule object isn't enough. The
`toggles` value itself is stored on the enhancement instance by roundabout,
so if `hydrate` only weakened its private copy, the instance would still hold
the caller's array, and through it the element. So:

- `hydrate` first calls `weakenTargetElements(toggles)`. If any flat rule's
  `targetElement` is an element, it returns a **copy** of `toggles` (same
  shape: array or single object) with each such element wrapped in a
  `WeakRef`. `hydrate` returns that as `{toggles: weakened}`. That replaces
  the stored value and re-triggers `hydrate`. The second pass finds nothing
  left to weaken and attaches the listeners. The caller's own object is
  never mutated.
- `toRules` maps `{prop, targetElement}` to
  `{targetSpecifier: {targetElement, targetProp}}`.
- `handleEvent` calls `deref()`. If the target has been collected, the toggle
  is a no-op.

The caller's *own* variables may of course still hold the element. That's
their business, and the README says so.

### Tests

- `tests/Programmatic/ImperativeTargetElement.*` has two lights:
  `targetElement: kitchen` (an element) and
  `targetElement: new WeakRef(porch)`, plus `'isHappy'`. One click must:
  - toggle all three;
  - leave a `WeakRef` (not the element) in `doToggle.toggles[0].targetElement`;
  - leave the caller's original object untouched.
- `tests/Programmatic/ImperativeTargetElementGC.*` proves the weak holding.
  It runs Chromium with `--js-flags=--expose-gc`, which needs its own worker,
  hence a separate spec file. The fixture sets up `toggles` inside a function
  scope, so the page itself keeps no reference. The test then:
  - takes its own `WeakRef` to the kitchen light;
  - removes the light from the DOM;
  - calls `gc()` across a few turns;
  - asserts the element was collected;
  - checks that a click afterwards throws nothing and the porch light still
    toggles.

  As a negative control, I temporarily kept the element strongly (skipped
  the weakening). The test then fails with "kitchen light was garbage
  collected, so do-toggle held no strong reference". With the real code it
  passes (3 of 3 full-suite runs).

All 13 Playwright tests pass. There's a new demo,
`demo/Programmatic/ImperativeTargetElement.html`. The README has a
"Targeting an element directly" subsection and a new row in the mapping
table. `FlatTogglingParameters.targetElement` is typed
`Element | WeakRef<Element>`, and `targetSpecifier.targetElement` is
`WeakRef<Element>`. That type change is in the `types` submodule.

### Rolling it out across the board

The same pattern should carry over directly to the other enhancements that
target a peer by id:

- do-inc (`targetElementId`), do-invoke (`targetElementId`), do-assign
  (`host`);
- three-peat (`src`, `target`);
- be-bound, be-observing and be-calculating (their remote specifiers /
  `forAttr`).

For the ones where the id is only resolved at event time, it's this same
small change. be-bound / be-observing / be-calculating resolve their remotes
once in `hydrate`/`seek`. There, the weak holding matters even more, because
listeners get attached *to* the remote element. Once you're happy with this
shape, I'd suggest adding it to the addendum as a step 7, so the checklist
covers it.
