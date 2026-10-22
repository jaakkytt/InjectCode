import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AccordionItemData, ItemsDataState } from '../../src/types'
import { SHARED_CODE } from '../../src/constants'
import { disableFilePatternScripts } from '../../src/service/filePatternScripts'

describe('disableFilePatternScripts', () => {
    let fileAccess: boolean

    beforeEach(() => {
        fileAccess = false
        vi.stubGlobal('chrome', { extension: { isAllowedFileSchemeAccess: () => Promise.resolve(fileAccess) } })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('disables active and always-on scripts under file patterns', async () => {
        const scripts: ItemsDataState = {
            'file:///home/*': [makeItem({ id: 'a', runMode: 'active' }), makeItem({ id: 'b', runMode: 'always' })],
        }

        const { scripts: result, disabled } = await disableFilePatternScripts(scripts)

        expect(result['file:///home/*'].map(item => item.runMode)).toEqual(['disabled', 'disabled'])
        expect(disabled).toBe(2)
    })

    it('leaves other patterns and shared scripts untouched', async () => {
        const shared = [makeItem({ id: 's', runMode: 'always' })]
        const web = [makeItem({ id: 'w', runMode: 'active' })]
        const wildcard = [makeItem({ id: 'x', runMode: 'always' })]

        const scripts: ItemsDataState = {
            [SHARED_CODE]: shared,
            'https://example.com/*': web,
            '*://example.com/*': wildcard,
            'file:///home/*': [makeItem({ id: 'f', runMode: 'active' })],
        }

        const { scripts: result, disabled } = await disableFilePatternScripts(scripts)

        expect(disabled).toBe(1)
        expect(result[SHARED_CODE]).toBe(shared)
        expect(result['https://example.com/*']).toBe(web)
        expect(result['*://example.com/*']).toBe(wildcard)
    })

    it('does not count scripts that were already disabled', async () => {
        const scripts: ItemsDataState = {
            'file:///home/*': [makeItem({ id: 'a', runMode: 'disabled' }), makeItem({ id: 'b', runMode: 'always' })],
        }

        expect((await disableFilePatternScripts(scripts)).disabled).toBe(1)
    })

    it('does not mutate the input', async () => {
        const scripts: ItemsDataState = { 'file:///home/*': [makeItem({ runMode: 'active' })] }

        await disableFilePatternScripts(scripts)

        expect(scripts['file:///home/*'][0].runMode).toBe('active')
    })

    it('leaves everything untouched when file access is on', async () => {
        fileAccess = true
        const scripts: ItemsDataState = { 'file:///home/*': [makeItem({ runMode: 'always' })] }

        expect(await disableFilePatternScripts(scripts)).toEqual({ scripts, disabled: 0 })
    })
})

function makeItem(overrides: Partial<AccordionItemData> = {}): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? 'run()',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}
