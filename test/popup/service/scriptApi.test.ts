import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Script, ScriptsByPattern } from '../../../src/shared/types'
import { ChromeScriptAPI } from '../../../src/popup/service/scriptApi'

const TIMEOUT_MS = 5000

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
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('scope "global": injects into every tab matching any container pattern', async () => {
        tabsQuery.mockResolvedValue([
            { id: 1, url: 'https://github.com/foo' },
            { id: 2, url: 'https://example.com/foo' },
        ])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'css', content: 'body{}' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global', TIMEOUT_MS)

        expect(tabsQuery).toHaveBeenCalledWith({ discarded: false, frozen: false })
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

        const scripts: ScriptsByPattern = {
            'https://*.github.com/*': [makeItem({ id: 'wildcard', type: 'js', content: 'wildcard();' })],
            'https://github.com/*': [makeItem({ id: 'exact', type: 'js', content: 'exact();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global', TIMEOUT_MS)

        expect(execute).toHaveBeenCalledTimes(1)

        const [{ js }] = execute.mock.calls[0]
        const codes = js.map((entry: { code: string }) => entry.code)

        expect(codes[0]).toEqual('shared();')
        expect(codes.sort()).toEqual(['exact();', 'shared();', 'wildcard();'].sort())
    })

    it('scope "global": runs Shared before the matching script in a single-tab injection', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://github.com/foo' }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'global', TIMEOUT_MS)

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ js: [{ code: 'shared();' }, { code: 'own();' }] }),
        )
    })

    it('scope "global": ignores containers keyed by an invalid pattern', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://example.com/foo' }])

        const scripts: ScriptsByPattern = {
            'not-a-pattern': [makeItem({ type: 'js', content: 'invalid();' })],
            'https://example.com/*': [makeItem({ type: 'js', content: 'valid();' })],
        }

        const result = await new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)

        expect(result).toEqual({ executed: 1, failed: 0, timedOut: 0 })
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({ js: [{ code: 'valid();' }] }))
    })

    it('scope "global": skips a matching tab when its container has no scripts', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://github.com/foo' }])

        const scripts: ScriptsByPattern = { 'https://github.com/*': [] }

        const result = await new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)

        expect(result).toEqual({ executed: 0, failed: 0, timedOut: 0 })
        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('scope "global": does nothing when no tab matches any container', async () => {
        tabsQuery.mockResolvedValue([{ id: 1, url: 'https://example.com/foo' }])

        const scripts: ScriptsByPattern = { 'https://github.com/*': [] }

        await new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)

        expect(tabsQuery).toHaveBeenCalledWith({ discarded: false, frozen: false })
        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('scope "current": only injects items whose container pattern matches the active tab url', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
            'https://example.com/*': [makeItem({ type: 'js', content: 'example();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'current', TIMEOUT_MS)

        expect(execute).toHaveBeenCalledTimes(1)
        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ target: { tabId: 7 }, js: [{ code: 'github();' }] }),
        )
    })

    it('scope "current": does nothing when the active tab matches no container', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://example.com/foo', active: true }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'current', TIMEOUT_MS)

        expect(execute).not.toHaveBeenCalled()
        expect(insertCSS).not.toHaveBeenCalled()
    })

    it('scope "current": runs Shared before the matching script', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const shared = [makeItem({ type: 'js', content: 'shared();' })]

        await new ChromeScriptAPI().run(scripts, shared, 'current', TIMEOUT_MS)

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({ js: [{ code: 'shared();' }, { code: 'own();' }] }),
        )
    })

    it('scope "current": does not run Shared scripts alone when the active tab matches no container', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://example.com/foo', active: true }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        const shared = [makeItem({ type: 'css', content: 'body{}' })]

        await new ChromeScriptAPI().run(scripts, shared, 'current', TIMEOUT_MS)

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

        const scripts: ScriptsByPattern = {
            'https://*.example.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        await new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)

        expect(execute).toHaveBeenCalledTimes(2)
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('tab 1 (https://blocked.example.com/)'),
            permissionError,
        )

        consoleError.mockRestore()
    })

    it('scope "global": counts executed and failed tabs, ignoring unmatched ones', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined)

        tabsQuery.mockResolvedValue([
            { id: 1, url: 'https://ok.example.com/' },
            { id: 2, url: 'https://broken.example.com/' },
            { id: 3, url: 'https://unrelated.org/' },
        ])
        execute.mockImplementation(({ target }) => (
            target.tabId === 2 ? Promise.reject(new Error('boom')) : Promise.resolve(undefined)
        ))

        const scripts: ScriptsByPattern = {
            'https://*.example.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const result = await new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)

        expect(result).toEqual({ executed: 1, failed: 1, timedOut: 0 })
    })

    it('scope "global": a tab that never settles times out without blocking the others', async () => {
        vi.useFakeTimers()
        vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        tabsQuery.mockResolvedValue([
            { id: 1, url: 'https://frozen.example.com/' },
            { id: 2, url: 'https://awake.example.com/' },
        ])
        execute.mockImplementation(({ target }) => (
            target.tabId === 1 ? new Promise(() => undefined) : Promise.resolve(undefined)
        ))

        const scripts: ScriptsByPattern = {
            'https://*.example.com/*': [makeItem({ type: 'js', content: 'own();' })],
        }

        const pending = new ChromeScriptAPI().run(scripts, [], 'global', TIMEOUT_MS)
        await vi.advanceTimersByTimeAsync(TIMEOUT_MS)

        await expect(pending).resolves.toEqual({ executed: 1, failed: 0, timedOut: 1 })

        vi.useRealTimers()
    })

    it('scope "current": a hanging active tab times out', async () => {
        vi.useFakeTimers()
        vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://github.com/foo', active: true }])
        execute.mockReturnValue(new Promise(() => undefined))

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        const pending = new ChromeScriptAPI().run(scripts, [], 'current', TIMEOUT_MS)
        await vi.advanceTimersByTimeAsync(TIMEOUT_MS)

        await expect(pending).resolves.toEqual({ executed: 0, failed: 0, timedOut: 1 })

        vi.useRealTimers()
    })

    it('scope "current": reports nothing when the active tab matches no container', async () => {
        tabsQuery.mockResolvedValue([{ id: 7, url: 'https://example.com/foo', active: true }])

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'js', content: 'github();' })],
        }

        const result = await new ChromeScriptAPI().run(scripts, [], 'current', TIMEOUT_MS)

        expect(result).toEqual({ executed: 0, failed: 0, timedOut: 0 })
    })
})

function makeItem(overrides: Partial<Script>): Script {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? '',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}
