//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-toggle/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'propOnEventType',
        pattern: String.raw `^(?<prop>.*) on (?<localEventType>.*)`,
        description: 'Prop with explicit event type',
    },
    {
        name: 'prop',
        pattern: String.raw `^(?<prop>.*)`,
        description: 'Prop with default event',
    }
];

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'doToggle',
        spawn: 'do-toggle/do-toggle.js',
        withAttrs: {
            base: 'do-toggle',
            _base: {
                mapsTo: 'parsedStatements',
                parser: 'parse-grouped-capture-statements',
                instanceOf: 'Array',
                parserConfig: parsePatterns
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['parsedStatements', 'enhancedElement']
            }
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
