// @ts-check
/** @import {Actions, PAP, AllProps, AP, TogglingParameters} from './types/do-toggle/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {Infer} from './types/inferencer/types' */
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 */
class DoToggle {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        /** @type {Actions} */
        const actions = /** @type {any} */ (this);
        actions.init(this, enhancedElement, ctx, initVals);
    }

    

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * @param {AP & Actions} self 
     */
    async hydrate(self){
        const { parsedStatements, enhancedElement } = self;
        const {success, statements} = parsedStatements;
        if(!success) throw 400;
        const { nudge } = await import('mount-observer/nudge.js');
        
        // If no statements, try to infer from name attribute
        if(statements.length === 0){
            const name = enhancedElement.getAttribute('name');
            statements.push({
                value: {
                    hostProp: name,
                    localEventType: (await infer(enhancedElement)).eventType,
                }
            });
        }
        
        /** @type Set<string> */
        //const alreadyAdded = new Set();
        for (const statement of statements) {
            const {value} = statement;
            if(!value) continue;
            let { localEventType } = value;
            if (localEventType === undefined) {
                localEventType = (await infer(enhancedElement)).eventType;
            }
            enhancedElement.addEventListener(localEventType, e => {
                self.handleEvent(self, e, value);
            });
        }
        nudge(enhancedElement);
        return /** @type {PAP} */({
            resolved: true,
        });
    }

    /**
     * @param {AP & Actions} self 
     * @param {Event} _e 
     * @param {TogglingParameters} parsedStatement 
     */
    async handleEvent(self, _e, parsedStatement){
        const { enhancedElement } = self;
        const {targetSpecifier, hostProp} = parsedStatement;
        if(targetSpecifier){
            const {targetElementId, targetProp} = targetSpecifier;
            const target = /** @type {any} */ (await ((await import('inferencer/upSearch.js')).upSearch(enhancedElement, targetElementId)));
            if(targetProp){
                target[targetProp] = !target[targetProp];
            }else{
                const inference = await infer(target);
                inference.value = !inference.value;
            }
        }else{
            // Simple case: toggle hostProp on the nearest ancestor with itemscope
            const target = /** @type {any} */ (await ((await import('inferencer/upSearch.js')).upSearch(enhancedElement, undefined)));
            if(hostProp){
                target[hostProp] = !target[hostProp];
            }else{
                const inference = await infer(target);
                inference.value = !inference.value;
            }
        }
    }
}

/**
 * 
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('inferencer/inferencer.js')).registryItem)));}

export {DoToggle}
