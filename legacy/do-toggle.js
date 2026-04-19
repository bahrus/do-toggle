// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved, rejected } from 'be-enhanced/cc.js';
import { dispatchEvent as de } from 'trans-render/positractions/dispatchEvent.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AP, BAP, ObservingParameters} from './ts-refs/do-toggle/types' */
/** @import {Specifier} from './ts-refs/trans-render/dss/types' */

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class DoToggle extends BE {
    de = de;

    /**
     * @type {BEConfig<BAP, Actions & IEnhancement, any>}
     */
    static config = {
        propInfo: {
            ...propInfo,
            parsedStatements: {},
            rawStatements: {},
        },
        positractions: [
            resolved, rejected
        ],
        compacts:{
            when_parsedStatements_changes_call_hydrate: 0,
        }
    }

    /**
     * 
     * @param {BAP & BEAllProps} self 
     */
    async hydrate(self){
        const { parsedStatements, enhancedElement } = self;
        const { nudge } = await import('mount-observer/refid/nudge.js');
        /** @type Set<string> */
        const alreadyAdded = new Set();
        for (const parsedStatement of parsedStatements) {
            let { localEventType } = parsedStatement;
            if (localEventType === undefined) {
                const { stdEvt } = await import('trans-render/asmr/stdEvt.js');
                localEventType = stdEvt(enhancedElement);
            }
            if(alreadyAdded.has(localEventType)) continue;
            enhancedElement.addEventListener(localEventType, this);
            alreadyAdded.add(localEventType);
        }
        nudge(enhancedElement);
        return /** @type {PAP} */({
            resolved: true,
        });
    }
    /** @type {Map<Specifier, WeakRef<EventTarget>>} */
    #cache = new Map();
    async handleEvent(){
        const self = /** @type {BAP & BEAllProps} */ (/** @type {any} */ (this));
        const { parsedStatements, enhancedElement } = self;
        const { find } = await import('trans-render/dss/find.js');
        for (const parsedStatement of parsedStatements) {
            const {remoteSpecifier} = parsedStatement;
            let remoteTarget = this.#cache.get(remoteSpecifier)?.deref();
            if (remoteTarget === undefined) {
                const remoteTargetTest = await find(enhancedElement, remoteSpecifier);
                if (!remoteTargetTest)
                    throw 404;
                remoteTarget = remoteTargetTest;
                this.#cache.set(remoteSpecifier, new WeakRef(remoteTarget));
            }
            let {prop} = remoteSpecifier;
            if(prop === undefined){
                prop = (await import('trans-render/asmr/asmr.js')).ASMR.getValueProp(enhancedElement);
                if(prop === undefined) throw 404;
                remoteSpecifier.prop = prop;
            }
            remoteTarget[prop] = !remoteTarget[prop];
        }
    }
}

await DoToggle.bootUp();
export {DoToggle}