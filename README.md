# do-toggle (⏻)

Windows: Hold Alt, type 23FB, release Alt UnicodePlus+1.

Mac: Hold Alt ⌥, type 23FB, release Alt UnicodePlus.

Linux: Hold Ctrl+Shift+U, type 23FB, release keys Unicode Explorer.

Toggle a host or peer element property.

[![NPM version](https://badge.fury.io/js/do-toggle.png)](http://badge.fury.io/js/do-toggle)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/do-toggle?style=for-the-badge)](https://bundlephobia.com/result?p=do-toggle)

## Alternatives

[do-merge](https://github.com/bahrus/do-invoke) covers most of the same ground as [do-invoke](https://github.com/bahrus/do-invoke), [do-inc](https://github.com/bahrus/do-inc), and [do-toggle](https://github.com/bahrus/do-toggle). The key differences:

- **do-invoke**, **do-inc**, and **do-toggle** use a string DSL (no JSON required) and include inferencing logic — they can figure out the event type, target property, etc. from context, so you can often be less explicit. The intent is arguably more obvious at a glance for their specific use cases.
- **do-merge** uses JSON syntax and the full power of [assign-gingerly](https://github.com/bahrus/assign-gingerly) operators (`=!` for toggle, `+=` for increment, method calls via `?.classList?.add`, etc.). It's more general-purpose — a single enhancement that can handle toggling, incrementing, method invocation, and arbitrary property assignment in one attribute.

Choose do-merge when you need to combine multiple operations or want the full expressiveness of assign-gingerly. Choose the specialized enhancements like *do-toggle* when brevity and self-documenting intent matter more.

## Example 1a - Basic Toggle

Toggle a property on the host element (closest itemscope or shadow host):

```html
<be-hive>
    <script type=emc-parser 
            src="be-hive/parsers/parse-grouped-capture-statements.js" 
            parser-name=parse-grouped-capture-statements></script>
    <script type=emc 
            src="do-toggle/emc.json" 
            wait-for-parsers=parse-grouped-capture-statements></script>
</be-hive>
<script type=module>
class MoodStone extends HTMLElement{
    #isHappy;
    get isHappy(){
        return this.#isHappy;
    }
    set isHappy(nv){
        this.#isHappy = nv;
        this.querySelector('#display').textContent = nv ? '😊' : '😢'
    }
    connectedCallback(){
        this.isHappy = true;
    }
}
customElements.define('mood-stone', MoodStone);
</script>
...
<mood-stone itemscope>
    <div>
        Is Happy: <span id=display></span>
    </div>
    <button ⏻=isHappy>Toggle Mood</button>
</mood-stone>
```

What this does:

1. Listens for "click" events by default (or "input" for input elements)
2. Toggles the `isHappy` property on the host element (mood-stone)
3. The property value is inverted: `true` becomes `false`, `false` becomes `true`

If you are working in an environment where clashes with other packages can be easily manged, and can make use of scoped custom element registries, use the shorter emoji alternative name shown above, as opposed to the example below.  This package also demonstrates how easy it is to define your own name.

## Example 1a with canonical name (do-toggle)

```html
<mood-stone itemscope>
    <div>
        Is Happy: <span id=display></span>
    </div>
    <button do-toggle=isHappy>Toggle Mood</button>
</mood-stone>
```

## Example 1a with disabled attribute

Infer the property name from the `name` attribute:

```html
<mood-stone itemscope>
    <button disabled name=isHappy ⏻>Toggle Mood</button>
</mood-stone>
```

The `disabled` attribute is removed after hydration, and the property name is inferred from `name="isHappy"`.

## Example 1b - Specifying the event

Toggle on a different event type:

```html
<mood-stone itemscope>
    <button ⏻="isHappy on mouseover">Hover to Toggle Mood</button>
</mood-stone>
```

## Example 1c - Toggle Peer Element Property

Toggle a property on a specific element using a CSS selector:

```html
<div itemscope>
    <light-switch id=myLight></light-switch>
    <button ⏻="#myLight?.isOn">Toggle Light</button>
</div>
```

**Note:** Use `?.` (chained accessor) instead of `.` because simple periods are used to split multiple statements in the attribute value.

## Example 1d - Toggle Checkbox

When toggling an input element without specifying a property, it automatically toggles the appropriate property:
- Checkboxes/radios: toggles `checked`
- Other inputs: toggles `value`

```html
<div itemscope>
    <input type="checkbox" id=agreeCheckbox>
    <button ⏻="#agreeCheckbox">Toggle Agreement</button>
</div>
```



## Syntax Summary

```
do-toggle="propertyName"                    // Toggle host property
do-toggle="propertyName on eventType"       // Toggle on specific event
do-toggle="#targetElementId"                      // Toggle inferred property on selected element
do-toggle="#targetElementId?.propertyName"        // Toggle specific property on selected element
```

**Important:** Use `?.` (chained accessor) instead of `.` when specifying properties on selected elements, because simple periods are used to split multiple statements.

Or use the emoji shorthand `⏻` instead of `do-toggle`.

## Viewing Demos Locally

1. Install git
2. Fork/clone this repo
3. Install node.js
4. Open command window to folder where you cloned this repo
5. > git submodule add https://github.com/bahrus/types.git types
6. > git submodule update --init --recursive
7. > npm install
8. > npm run serve
9. Open http://localhost:8000/demo/ in a modern browser

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'do-toggle/do-toggle.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.sh/do-toggle';
</script>
```
