# Human Asks:

Example1d.html works!  Don't do anything, please just express your thoughts, I found that using the legacy architecture, I started to see patterns like lines 130 - 136 and lines 81 - 86 appear multiple times across multiple enhancements like these (do-inc, do-toggle, do-set).  I would like to get your ideas on:



1.  Which package would you use to define that common logic?

2.  What would you call it?  How would you implement it?

---

# Kiro Answers

Great question! Let me look at those specific lines to understand the patterns you're seeing:

Perfect! I can see the patterns clearly now. Here are my thoughts:

## Common Patterns Identified

**Lines 81-86 (Event Type Inference):**
```javascript
if (localEventType === undefined) {
    const tagName = enhancedElement.tagName.toLowerCase();
    if(tagName === 'input' || tagName === 'textarea' || tagName === 'select'){
        localEventType = 'input';
    } else {
        localEventType = 'click';
    }
}
```

**Lines 130-136 (Property Inference):**
```javascript
if(!propertyName){
    const tagName = target.tagName.toLowerCase();
    if(tagName === 'input'){
        const inputType = target.getAttribute('type');
        propertyName = (inputType === 'checkbox' || inputType === 'radio') ? 'checked' : 'value';
    } else {
        propertyName = 'textContent';
    }
}
```

## My Recommendations

### 1. Which Package?

I would create these utilities in **`roundabout-lib`** because:
- It's already a shared utility library for the modern architecture
- These patterns are about element interaction conventions, which fits roundabout's role
- It's already a dependency for all converted enhancements
- Alternative: Could go in `mount-observer` but that feels more infrastructure-focused

### 2. What to Call It?

I'd create a module called **`element-conventions.js`** or **`element-defaults.js`** in roundabout-lib with two exported functions:

```javascript
// roundabout-lib/element-conventions.js

/**
 * Infer the most appropriate event type for an element
 * @param {Element} element 
 * @returns {string} Event type like 'click', 'input', 'change'
 */
export function inferEventType(element) {
    const tagName = element.tagName.toLowerCase();
    if(tagName === 'input' || tagName === 'textarea' || tagName === 'select'){
        return 'input';
    }
    if(tagName === 'form'){
        return 'submit';
    }
    return 'click';
}

/**
 * Infer the most appropriate property to interact with on an element
 * @param {Element} element 
 * @returns {string} Property name like 'checked', 'value', 'textContent'
 */
export function inferProperty(element) {
    const tagName = element.tagName.toLowerCase();
    
    if(tagName === 'input'){
        const inputType = element.getAttribute('type');
        if(inputType === 'checkbox' || inputType === 'radio'){
            return 'checked';
        }
        return 'value';
    }
    
    if(tagName === 'textarea' || tagName === 'select'){
        return 'value';
    }
    
    // Check for itemprop as a hint
    const itemprop = element.getAttribute('itemprop');
    if(itemprop){
        return itemprop;
    }
    
    return 'textContent';
}
```

### 3. How to Implement?

**Phase 1: Add to roundabout-lib**
- Create the module with comprehensive element type coverage
- Add TypeScript definitions
- Include unit tests for various element types
- Document the conventions being followed

**Phase 2: Refactor existing enhancements**
- Update do-toggle, do-inc, do-invoke to import and use these utilities
- Remove duplicated logic
- Verify all tests still pass

**Phase 3: Extend as needed**
- Add more sophisticated inference (e.g., contenteditable, custom elements)
- Consider configuration options for custom conventions
- Maybe add `inferTargetElement(enhancedElement, selector)` for the selector resolution pattern

### Additional Thoughts

**Other common patterns I noticed:**
1. **Selector resolution** (lines 119-123): Finding elements relative to itemscope/shadow root
2. **Name attribute inference**: When attribute is empty, read from `name` attribute
3. **Statement iteration pattern**: The loop through parsed statements with event listener setup

These could also be extracted into utilities like:
- `resolveTarget(enhancedElement, selector)` - Find element using selector with itemscope/shadow awareness
- `inferFromAttribute(element, attributeName)` - Generic attribute-based inference
- `attachStatementHandlers(enhancedElement, statements, handler)` - Generic statement processing

**Benefits:**
- DRY principle - one place to update conventions
- Consistency across all enhancements
- Easier to extend (e.g., add support for new input types)
- Better testing - test once, use everywhere
- Clearer enhancement code - focuses on unique logic, not boilerplate

**Naming alternatives:**
- `element-inference.js` - emphasizes the inference aspect
- `dom-conventions.js` - broader scope
- `element-helpers.js` - more generic
- `interaction-defaults.js` - emphasizes user interaction

I lean toward **`element-conventions.js`** because it clearly communicates "these are the conventions we follow for different element types."

What do you think? Does this align with your vision?