//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-toggle/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'targetPartOnEventType',
        pattern: String.raw `^(?<remoteSpecifier.targetPart>.*) on (?<localEventType>.*)`,
        description: 'Target selector with explicit event type',
        dssKeys: [['remoteSpecifier.targetPart', 'remoteSpecifier']]
    },
    {
        name: 'targetPart',
        pattern: String.raw `^(?<remoteSpecifier.targetPart>.*)`,
        description: 'Target selector with default event',
        dssKeys: [['remoteSpecifier.targetPart', 'remoteSpecifier']]
    }
];

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'DoToggle',
        spawn: 'do-toggle/do-toggle.js',
        withAttrs: {
            base: 'do-toggle',
            _base: {
                mapsTo: 'parsedStatements',
                parser: 'parse-pattern-statements',
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
