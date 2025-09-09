// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC, EventListenerOrFn} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP,  AP} from './ts-refs/do-toggle/types' */;

const targetPart = String.raw `^(?<targetPart>.*)`;
const targetPartOnEventType = String.raw `${targetPart} on (?<localEventType>.*)`;

/**
 * @type {Array<[string, string]>}
 */
const dssArrayKeys = [['targetPart', 'remoteSpecifiers']];

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
                        dssArrayKeys,
                    },
                    {
                        regExp: targetPart,
                        defaultVals: {},
                        dssArrayKeys,
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