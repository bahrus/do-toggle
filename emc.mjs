//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-toggle/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

const defaultVals = {
    localEventType: 'click'
};

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'idWithPropAndEvent',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.targetProp>\w+) on (?<localEventType>\w+)$`,
        description: 'Element ID with prop and explicit event type: #{{id}}?.prop on event',
        defaultVals,
    },
    {
        name: 'idWithProp',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.targetProp>\w+)$`,
        description: 'Element ID with prop, default event: #{{id}}?.prop',
        defaultVals,
    },
    {
        name: 'idOnly',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?\s]+)$`,
        description: 'Element ID only, infer property and use default event: #{{id}}',
        defaultVals,
    },
    {
        name: 'propOnEventType',
        pattern: String.raw `^(?<hostProp>.*) on (?<localEventType>.*)$`,
        description: 'Prop with explicit event type',
        defaultVals,
    },
    {
        name: 'prop',
        pattern: String.raw `^(?<hostProp>.*)$`,
        description: 'Prop with default event',
        defaultVals,
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
