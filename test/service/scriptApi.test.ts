import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { AccordionItemData, ItemsDataState } from '../../src/types'
import { buildInjectionPayload, ChromeScriptAPI, selectItemsForUrl } from '../../src/service/scriptApi'

function makeItem(overrides: Partial<AccordionItemData>): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? '',
        active: overrides.active ?? true,
        type: overrides.type ?? 'js',
    }
}

describe('selectItemsForUrl', () => {
    it('returns items from containers whose pattern matches the given url', () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ id: 'github-1', content: 'a' })],
            'https://example.com/*': [makeItem({ id: 'example-1', content: 'b' })],
        }

        expect(selectItemsForUrl(scripts, 'https://github.com/foo').map(i => i.id)).toEqual(['github-1'])
    })

    it('returns items from every matching container when patterns overlap', () => {
        const scripts: ItemsDataState = {
            'https://*.github.com/*': [makeItem({ id: 'wildcard', content: 'a' })],
            'https://github.com/*': [makeItem({ id: 'exact', content: 'b' })],
        }

        expect(selectItemsForUrl(scripts, 'https://github.com/foo').map(i => i.id).sort()).toEqual(['exact', 'wildcard'])
    })

    it('returns nothing when no container pattern matches', () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ id: 'github-1' })],
        }

        expect(selectItemsForUrl(scripts, 'https://example.com/foo')).toEqual([])
    })

    it('ignores containers keyed by an invalid pattern instead of throwing', () => {
        const scripts: ItemsDataState = {
            'not-a-pattern': [makeItem({ id: 'invalid' })],
        }

        expect(selectItemsForUrl(scripts, 'https://example.com/foo')).toEqual([])
    })
})

describe('buildInjectionPayload', () => {
    it('splits js and css content and puts shared items first', () => {
        const shared = [makeItem({ id: 'shared-js', type: 'js', content: 'shared();' })]
        const items = [
            makeItem({ id: 'own-css', type: 'css', content: 'body{}' }),
            makeItem({ id: 'own-js', type: 'js', content: 'own();' }),
        ]

        const payload = buildInjectionPayload(items, shared)

        expect(payload.js).toEqual(['shared();', 'own();'])
        expect(payload.css).toEqual(['body{}'])
    })

    it('returns empty arrays when there is nothing active to inject', () => {
        expect(buildInjectionPayload([], [])).toEqual({ js: [], css: [] })
    })
})

describe('ChromeScriptAPI', () => {
    let execute: ReturnType<typeof vi.fn>
    let insertCSS: ReturnType<typeof vi.fn>
    let tabsQuery: ReturnType<typeof vi.fn>

    beforeEach(() => {
        execute = vi.fn().mockResolvedValue(undefined)
        insertCSS = vi.fn().mockResolvedValue(undefined)
        tabsQuery = vi.fn()

        vi.stubGlobal('chrome', {
            tabs: { query: tabsQuery },
            userScripts: { execute },
            scripting: { insertCSS },
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('scope "global": injects into every tab matching each container pattern', async () => {
        tabsQuery.mockResolvedValue([{ id: 1 }, { id: 2 }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }
        const shared = [makeItem({ type: 'css', content: 'body{}' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global')

        expect(tabsQuery).toHaveBeenCalledWith({ url: 'https://github.com/*' })
        expect(execute).toHaveBeenCalledTimes(2)
        expect(insertCSS).toHaveBeenCalledTimes(2)
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({ target: { tabId: 1 }, js: [{ code: 'own();' }] }))
    })

    it('scope "global": skips querying tabs for containers with nothing active to inject', async () => {
        const scripts: ItemsDataState = { 'https://github.com/*': [] }

        await new ChromeScriptAPI().run(scripts, [], 'global')

        expect(tabsQuery).not.toHaveBeenCalled()
    })

    it('scope "current": only injects items whose container pattern matches the active tab url', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
            'https://example.com/*': [makeItem({ type: 'js', content: 'example();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'current')

        expect(execute).toHaveBeenCalledTimes(1)
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({ target: { tabId: 7 }, js: [{ code: 'github();' }] }))
    })

    it('scope "current": does nothing when the active tab matches no container', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://example.com/foo', active: true }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'current')

        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('a tab that throws does not stop injection into other matching tabs, and gets logged with its id/url', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const permissionError = new Error('Cannot access contents of the page. Extension manifest must request permission to access the respective host.')

        tabsQuery.mockResolvedValue([
            { id: 1, url: 'https://blocked.example.com/' },
            { id: 2, url: 'https://allowed.example.com/' },
        ])
        execute.mockImplementation(({ target }) => (
            target.tabId === 1 ? Promise.reject(permissionError) : Promise.resolve(undefined)
        ))

        const scripts: ItemsDataState = {
            'https://*.example.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'global')

        expect(execute).toHaveBeenCalledTimes(2)
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('tab 1 (https://blocked.example.com/)'),
            permissionError,
        )

        consoleError.mockRestore()
    })
})
