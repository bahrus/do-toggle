import  'assign-gingerly/object-extension.js';

/**
 * Registers do-toggle's config with the enhancement registry, so it can be
 * attached programmatically via `enh.set.doToggle` or `enh.get(emc)`.
 * @param {Element | undefined} ref
 */
export async function defDoToggle(ref){
    const {default: emc} = await import('./emc.json', {with: {type: 'json'}});
    return await push(ref, emc);
}

async function push(ref, emc){
    const {DoToggle} = await import('./do-toggle.js');
    const {enhConfig} = emc;
    enhConfig.spawn = DoToggle;
    enhConfig.customData = emc.customData;
    const registry = ref?.customElementRegistry ?? customElements;
    const {enhancementRegistry} = registry;
    enhancementRegistry.push(enhConfig);
    return enhConfig;
}
