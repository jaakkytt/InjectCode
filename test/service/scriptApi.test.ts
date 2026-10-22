import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { AccordionItemData, ItemsDataState } from '../../src/types'
import { buildInjectionPayload, ChromeScriptAPI, selectItemsForUrl } from '../../src/service/scriptApi'

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

        const ids = selectItemsForUrl(scripts, 'https://github.com/foo').map(i => i.id).sort()

        expect(ids).toEqual(['exact', 'wildcard'])
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

    it('scope "global": injects into every tab matching any container pattern', async () => {
        tabsQuery.mockResolvedValue([
            { id: 1, url: 'https://github.com/foo' },
            { id: 2, url: 'https://example.com/foo' },
        ])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'css', content: 'body{}' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global')

        expect(tabsQuery).toHaveBeenCalledWith({})
        expect(execute).toHaveBeenCalledTimes(1)
        expect(insertCSS).toHaveBeenCalledTimes(1)

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ target: { tabId: 1 }, js: [{ code: 'own();' }] }),
        )
        expect(insertCSS).toHaveBeenCalledWith(
            expect.objectContaining({ target: { tabId: 1 }, css: 'body{}' }),
        )
    })

    it('scope "global": injects Shared scripts once per tab even when it matches multiple patterns', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://github.com/foo' }])

        const scripts: ItemsDataState = {
            'https://*.github.com/*': [makeItem({ id: 'wildcard', type: 'js', content: 'wildcard();' })],
            'https://github.com/*': [makeItem({ id: 'exact', type: 'js', content: 'exact();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global')

        expect(execute).toHaveBeenCalledTimes(1)

        const [{ js }] = execute.mock.calls[0]
        const codes = js.map((entry: { code: string }) => entry.code)

        expect(codes[0]).toEqual('shared();')
        expect(codes.sort()).toEqual(['exact();', 'shared();', 'wildcard();'].sort())
    })

    it('scope "global": runs Shared before the matching script in a single-tab injection', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://github.com/foo' }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global')

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ js: [{ code: 'shared();' }, { code: 'own();' }] }),
        )
    })

    it('scope "global": does nothing when no tab matches any container', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://example.com/foo' }])

        const scripts: ItemsDataState = { 'https://github.com/*': [] }

        await new ChromeScriptAPI().run(scripts, [], 'global')

        expect(tabsQuery).toHaveBeenCalledWith({})
        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('scope "current": only injects items whose container pattern matches the active tab url', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
            'https://example.com/*': [makeItem({ type: 'js', content: 'example();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'current')

        expect(execute).toHaveBeenCalledTimes(1)
        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ target: { tabId: 7 }, js: [{ code: 'github();' }] }),
        )
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

    it('scope "current": runs Shared before the matching script', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'current')

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ js: [{ code: 'shared();' }, { code: 'own();' }] }),
        )
    })

    it('scope "current": does not run Shared scripts alone when the active tab matches no container', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://example.com/foo', active: true }])

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        const shared = [makeItem({ type: 'css', content: 'body{}' })]

        await new ChromeScriptAPI().run(scripts, shared, 'current')

        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('a throwing tab does not block the others, and gets logged with its id/url', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        const permissionError = new Error(
            'Cannot access contents of the page. '
            + 'Extension manifest must request permission to access the respective host.',
        )

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

function makeItem(overrides: Partial<AccordionItemData>): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? '',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}
