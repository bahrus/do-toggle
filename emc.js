// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC, EventListenerOrFn} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP,  AP} from './ts-refs/do-toggle/types' */;

const targetPart = String.raw `^(?<targetPart>.*)`;
const targetPartOnEventType = String.raw `${targetPart} on (?<localEventType>.*)`;

/**
 * @type {Array<[string, string]>}
 */
const dssKeys = [['targetPart', 'remoteSpecifier']];

/**
 * @type {Partial<EMC<any, AP>>}
 */
export const emc = {
    base: 'do-toggle',
    map: {
        '0.0':{
            instanceOf: 'Object$entences',
            objValMapsTo: '.',
            regExpExts: {
                parsedStatements: [
                    {
                        regExp: targetPartOnEventType,
                        defaultVals: {},
                        dssKeys,
                    },
                    {
                        regExp: targetPart,
                        defaultVals: {},
                        dssKeys,
                    }
                ]
            }
        }
    },
    enhPropKey: 'doToggle',
    importEnh: async () => {
        const { DoToggle } = await import('./do-toggle.js');
        return DoToggle;
    }
}

const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);