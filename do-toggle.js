// @ts-check
/** @import {Actions, PAP, AllProps, AP, TogglingParameters, Specifier} from './types/do-toggle/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, ElementInfer} from './types/assign-gingerly/types' */;
/** @import {Infer} from './types/inferencer/types' */
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
        const {success, statements} = parsedStatements;
        if(!success) throw 400;
        const { nudge } = await import('mount-observer/nudge.js');
        
        // If no statements, try to infer from name attribute
        if(statements.length === 0){
            const name = enhancedElement.getAttribute('name');
            statements.push({
                value: {
                    prop: name,
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
     * @param {Event} e 
     * @param {TogglingParameters} parsedStatement 
     */
    async handleEvent(self, e, parsedStatement){
        const { enhancedElement } = self;
        let {prop} = parsedStatement;

        // Check if prop contains a selector pattern: [selector] or [selector]?.property
        // Using ?. (chained accessor) because simple . is used to split statements
        const selectorMatch = prop.match(/^\[(.+?)\](?:\?\.(.+))?$/);
        
        let target;
        let propertyName;
        
        if(selectorMatch){
            // Has selector: [selector] or [selector]?.property
            const selector = selectorMatch[1];
            propertyName = selectorMatch[2]; // May be undefined
            
            // Find the target element using the selector
            const rn = /** @type {DocumentFragment & {host: unknown}} */ (enhancedElement.getRootNode());
            const searchRoot = enhancedElement.closest('[itemscope]') || rn;
            target = /** @type {any} */ (searchRoot.querySelector ? searchRoot.querySelector(selector) : null);
            
            if(!target) throw 404;
        
        } else {
            // No selector - toggle property on host
            propertyName = prop;
            target = /** @type {any} */ (await (await import('assign-gingerly/getHost.js')).getHost(enhancedElement));
            if(!target) throw 404;
        }
        if(propertyName){
            target[propertyName] = !target[propertyName];
        }else{
            const inference = await infer(target);
            inference.value = !inference.value;
        }
        
    }
}

/**
 * 
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('assign-gingerly/Infer.js')).registryItem)));}

export {DoToggle}
