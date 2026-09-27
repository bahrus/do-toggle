// @ts-check
/** @import {Actions, PAP, AllProps, AP, TogglingParameters, Toggles} from './types/do-toggle/types' */;
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
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc || ctx.config);
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
        await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
        self.initialized = true;
    }

    /**
     * Transfers the attribute-parsed `parsedStatements` into `toggles` --
     * the property `hydrate` actually reads.  Programmatic callers skip
     * `parsedStatements` entirely and assign `toggles` directly.
     * Invoked via the `when_parsedStatements_changes_call_onParsedStatementsChange`
     * compact, never called directly.
     * @param {AP} self
     * @returns {PAP}
     */
    onParsedStatementsChange(self){
        const {parsedStatements} = self;
        if(parsedStatements === undefined) return {};
        const {success, statements} = parsedStatements;
        if(!success) throw 400;
        /** @type {Array<TogglingParameters>} */
        const toggles = [];
        for(const statement of statements){
            if(statement.value !== undefined) toggles.push(statement.value);
        }
        return {toggles};
    }

    /** @type {AbortController | undefined} */
    #ac;

    /**
     * @param {AP & Actions} self
     */
    async hydrate(self){
        const { toggles, enhancedElement } = self;
        const { nudge } = await import('assign-gingerly/handlers/nudge.js');
        // Re-hydrating (toggles reassigned) replaces the listeners from the
        // previous pass rather than stacking on them.
        this.#ac?.abort();
        const {signal} = this.#ac = new AbortController();
        for (const value of toRules(toggles, enhancedElement)) {
            let { localEventType } = value;
            if (localEventType === undefined) {
                localEventType = (await infer(enhancedElement)).eventType;
            }
            enhancedElement.addEventListener(localEventType, e => {
                self.handleEvent(self, e, value);
            }, {signal});
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
            const target = /** @type {any} */ (await ((await import('assign-gingerly/inferencer/upSearch.js')).upSearch(enhancedElement, targetElementId)));
            if(targetProp){
                target[targetProp] = !target[targetProp];
            }else{
                const inference = await infer(target);
                inference.value = !inference.value;
            }
        }else{
            // Simple case: toggle hostProp on the nearest ancestor with itemscope
            const target = /** @type {any} */ (await ((await import('assign-gingerly/inferencer/upSearch.js')).upSearch(enhancedElement, undefined)));
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
 * Normalize `toggles` into an array of rules in the parsed shape
 * ({hostProp} or {targetSpecifier: {targetElementId, targetProp}}).
 * Programmatic callers may pass a host property name, a single rule -- flat
 * ({prop, targetElementId, localEventType}) or as parsed from the attribute --
 * or an array mixing these.  A rule naming neither a property nor a target
 * (e.g. from an empty array) takes the property from the name attribute,
 * falling back to inferring it.
 * @param {Toggles} toggles
 * @param {Element} enhancedElement
 * @returns {Array<TogglingParameters>}
 */
function toRules(toggles, enhancedElement){
    const arr = Array.isArray(toggles) ? toggles : [toggles];
    const items = arr.length === 0 ? [{}] : arr;
    return items.map(item => {
        /** @type {any} */
        const t = typeof item === 'string' ? {prop: item} : item;
        const {prop, targetElementId, localEventType, hostProp, targetSpecifier} = t;
        if(targetSpecifier !== undefined || hostProp !== undefined) return t; // already the parsed shape
        if(targetElementId !== undefined){
            return {localEventType, targetSpecifier: {targetElementId, targetProp: prop}};
        }
        return {localEventType, hostProp: prop ?? enhancedElement.getAttribute('name')};
    });
}

/**
 *
 * @param {Element & ElementEnhancementGateway} from
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('assign-gingerly/inferencer/inferencer.js')).registryItem)));}

export {DoToggle}
