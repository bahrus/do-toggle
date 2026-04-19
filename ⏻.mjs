import myJSON from './emc.json' with {type: 'json'};

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps} from './types/do-toggle/types' */

/**
 * @type {EMC<any, AllProps> }
 */
const emc = {
    enhConfig: {
        ...myJSON.enhConfig,
        enhKey: '⏻',
        withAttrs: {
            ...myJSON.enhConfig.withAttrs,
            base: '⏻'
        }
    }
}

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
