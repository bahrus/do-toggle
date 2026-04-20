// @ts-check
/** @import {Actions, PAP, AllProps, AP, TogglingParameters, Specifier} from './types/do-toggle/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
import emc from './emc.json' with {type: 'json'};

const {customData} = emc;

/**
 * @implements {Actions}
 */
class DoToggle {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {*} ctx 
     * @param {AllProps} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        /** @type {Actions} */
        const actions = /** @type {any} */(this);
        actions.init(this, enhancedElement, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, initVals){
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
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
        console.log({parsedStatements})
        const {success, statements} = parsedStatements;
        if(!success) throw 400;
        const { nudge } = await import('mount-observer/nudge.js');
        /** @type Set<string> */
        for (const statement of statements) {
            const {value} = statement;
            if(!value) continue;
            let { localEventType } = value;
            if (localEventType === undefined) {
                // Default to 'click' for buttons, 'input' for inputs, etc.
                const tagName = enhancedElement.tagName.toLowerCase();
                if(tagName === 'input' || tagName === 'textarea' || tagName === 'select'){
                    localEventType = 'input';
                } else {
                    localEventType = 'click';
                }
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

    /** @type {Map<string, WeakRef<Element>>} */
    #cache = new Map();

    /**
     * @param {AP} self 
     * @param {Event} e 
     * @param {TogglingParameters} parsedStatement 
     */
    async handleEvent(self, e, parsedStatement){
        const { enhancedElement } = self;
        const {remoteSpecifier} = parsedStatement;
        
        // Simple DSS implementation - find element by selector
        const cacheKey = JSON.stringify(remoteSpecifier);
        let remoteTarget = this.#cache.get(cacheKey)?.deref();
        
        if (remoteTarget === undefined) {
            const {selector} = remoteSpecifier;
            if(!selector) throw 404;
            
            // Search in closest itemscope, shadow root, or document
            const rn = /** @type {DocumentFragment & {host: unknown}} */ (enhancedElement.getRootNode());
            const searchRoot = enhancedElement.closest('[itemscope]') || rn;
            
            const found = /** @type {Element | null} */ (searchRoot.querySelector ? searchRoot.querySelector(selector) : null);
            if (!found) throw 404;
            
            remoteTarget = found;
            this.#cache.set(cacheKey, new WeakRef(remoteTarget));
        }
        
        let {prop} = remoteSpecifier;
        if(prop === undefined){
            // Default to 'checked' for checkboxes, 'value' for inputs, or first itemprop
            const tagName = remoteTarget.tagName.toLowerCase();
            if(tagName === 'input'){
                const inputType = remoteTarget.getAttribute('type');
                prop = (inputType === 'checkbox' || inputType === 'radio') ? 'checked' : 'value';
            } else {
                // Try to find itemprop attribute
                prop = remoteTarget.getAttribute('itemprop') || 'textContent';
            }
            remoteSpecifier.prop = prop;
        }
        
        /** @type {any} */
        const target = remoteTarget;
        target[prop] = !target[prop];
    }
}

export {DoToggle}
