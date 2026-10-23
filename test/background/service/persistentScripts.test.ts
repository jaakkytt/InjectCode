import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Script, ScriptsByPattern } from '../../../src/shared/types'
import { SHARED_CODE, USER_SCRIPT_ID } from '../../../src/shared/constants'
import {
    computeDesiredRegistrations,
    createSerializedPersistentScriptsSync,
    syncPersistentScripts,
    wrapCssAsUserScript,
} from '../../../src/background/service/persistentScripts'

describe('wrapCssAsUserScript', () => {
    it('safely escapes css content containing quotes and backslashes into a JS string literal', () => {
        const css = 'body::after { content: "it\'s \\"quoted\\""; }'
        const code = wrapCssAsUserScript(css)

        expect(code).toContain('document.createElement(\'style\')')
        expect(code).toContain(JSON.stringify(css))
        expect(() => new Function(code)).not.toThrow()
    })
})

describe('computeDesiredRegistrations', () => {
    it('registers a container that has an always-on item of its own', () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ id: 'a', runMode: 'always', type: 'js', content: 'a();' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired).toHaveLength(1)
        expect(desired[0].matches).toEqual(['https://github.com/*'])
        expect(desired[0].runAt).toBe('document_idle')
        expect(desired[0].world).toBe('USER_SCRIPT')
        expect(desired[0].worldId).toBe(USER_SCRIPT_ID)
        expect(desired[0].js).toEqual([{ code: 'a();' }])
    })

    it('omits containers with no always-on item, even if other items are active', () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ runMode: 'active' })],
        }

        expect(computeDesiredRegistrations(scripts)).toEqual([])
    })

    it('narrow read: a shared always-on item only rides along on containers that have their own always-on item', () => {
        const scripts: ScriptsByPattern = {
            [SHARED_CODE]: [makeItem({ id: 'shared-1', runMode: 'always', content: 'shared();' })],
            'https://has-always.com/*': [makeItem({ id: 'own-1', runMode: 'always', content: 'own();' })],
            'https://no-always.com/*': [
                makeItem({ id: 'other-1', runMode: 'active', content: 'inactive-for-auto();' }),
            ],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired).toHaveLength(1)
        expect(desired[0].matches).toEqual(['https://has-always.com/*'])
        expect(desired[0].js).toEqual([{ code: 'shared();' }, { code: 'own();' }])
    })

    it('never includes shared items that are not always-on, even when the container qualifies', () => {
        const scripts: ScriptsByPattern = {
            [SHARED_CODE]: [makeItem({ id: 'shared-active', runMode: 'active', content: 'shared();' })],
            'https://github.com/*': [makeItem({ id: 'own-1', runMode: 'always', content: 'own();' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired[0].js).toEqual([{ code: 'own();' }])
    })

    it('wraps css items as a style-injecting js snippet', () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ type: 'css', content: 'body{color:red}' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired[0]!.js![0]!.code).toBe(wrapCssAsUserScript('body{color:red}'))
    })

    it('skips containers keyed by an invalid match pattern', () => {
        const scripts: ScriptsByPattern = {
            'not-a-pattern': [makeItem({ runMode: 'always' })],
        }

        expect(computeDesiredRegistrations(scripts)).toEqual([])
    })

    it('produces a stable id for the same pattern and different ids for different patterns', () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ id: 'a', content: 'a();' })],
            'https://example.com/*': [makeItem({ id: 'b', content: 'b();' })],
        }

        const first = computeDesiredRegistrations(scripts)
        const second = computeDesiredRegistrations(scripts)

        const idFor = (list: typeof first, pattern: string) => list.find(r => r.matches?.[0] === pattern)?.id

        expect(idFor(first, 'https://github.com/*')).toBe(idFor(second, 'https://github.com/*'))
        expect(idFor(first, 'https://github.com/*')).not.toBe(idFor(first, 'https://example.com/*'))
    })

    it('registers every container with the given Always on timing', () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ id: 'a' })],
            'https://example.com/*': [makeItem({ id: 'b' })],
        }

        const desired = computeDesiredRegistrations(scripts, 'document_start')

        expect(desired.map(r => r.runAt)).toEqual(['document_start', 'document_start'])
    })

    it('builds short ids from safe characters only, whatever the pattern', () => {
        const scripts: ScriptsByPattern = {
            'https://*.example.com/some/very/long/path/with-🙂-and-%20/*': [makeItem()],
        }

        const [registration] = computeDesiredRegistrations(scripts)

        expect(registration.id).toMatch(/^always-[0-9a-z]{1,11}$/)
    })

    it('gives distinct ids to patterns whose 32-bit string hashes collide', () => {
        const scripts: ScriptsByPattern = {
            'https://example.com/Aa': [makeItem({ id: 'a' })],
            'https://example.com/BB': [makeItem({ id: 'b' })],
        }

        const ids = computeDesiredRegistrations(scripts).map(r => r.id)

        expect(ids).toHaveLength(2)
        expect(new Set(ids).size).toBe(2)
    })
})

describe('syncPersistentScripts', () => {
    let register: ReturnType<typeof vi.fn>
    let unregister: ReturnType<typeof vi.fn>

    beforeEach(() => {
        register = vi.fn().mockResolvedValue(undefined)
        unregister = vi.fn().mockResolvedValue(undefined)
        vi.stubGlobal('chrome', { userScripts: { register, unregister } })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('unregisters everything, then registers the desired set', async () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ runMode: 'always', content: 'a();' })],
        }

        await syncPersistentScripts(scripts)

        expect(unregister).toHaveBeenCalledWith()
        expect(register).toHaveBeenCalledWith(computeDesiredRegistrations(scripts))
    })

    it('only unregisters, without calling register, when nothing should be persistently registered', async () => {
        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ runMode: 'active' })],
        }

        await syncPersistentScripts(scripts)

        expect(unregister).toHaveBeenCalledWith()
        expect(register).not.toHaveBeenCalled()
    })

    it('logs and swallows errors instead of throwing', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        register.mockRejectedValue(new Error('Allow User Scripts is not enabled'))

        const scripts: ScriptsByPattern = {
            'https://github.com/*': [makeItem({ runMode: 'always' })],
        }

        await expect(syncPersistentScripts(scripts)).resolves.toBeUndefined()
        expect(consoleError).toHaveBeenCalled()

        consoleError.mockRestore()
    })
})

describe('createSerializedPersistentScriptsSync', () => {
    const olderSnapshot: ScriptsByPattern = {
        'https://github.com/*': [makeItem({ content: 'old();' })],
    }
    const newerSnapshot: ScriptsByPattern = {
        'https://github.com/*': [makeItem({ content: 'new();' })],
        'https://example.com/*': [makeItem({ content: 'added();' })],
    }

    let fake: ReturnType<typeof createFakeUserScripts>
    let consoleError: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        fake = createFakeUserScripts()
        vi.stubGlobal('chrome', { userScripts: fake })
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    afterEach(() => {
        consoleError.mockRestore()
        vi.unstubAllGlobals()
    })

    it('ends with the latest snapshot and no error when syncs overlap', async () => {
        const readState = vi.fn()
            .mockResolvedValueOnce({ scripts: olderSnapshot, runAt: 'document_idle' })
            .mockResolvedValue({ scripts: newerSnapshot, runAt: 'document_end' })

        const requestSync = createSerializedPersistentScriptsSync(readState)

        await Promise.all([requestSync(), requestSync()])

        expect(consoleError).not.toHaveBeenCalled()
        expect([...fake.registered.values()]).toEqual(computeDesiredRegistrations(newerSnapshot, 'document_end'))
    })

    it('coalesces a burst of requests during a sync into one follow-up', async () => {
        const readState = vi.fn().mockResolvedValue({ scripts: newerSnapshot, runAt: 'document_idle' })
        const requestSync = createSerializedPersistentScriptsSync(readState)

        await Promise.all([requestSync(), requestSync(), requestSync(), requestSync()])

        expect(readState).toHaveBeenCalledTimes(2)
    })

    it('runs a fresh sync for a request made after the previous one settled', async () => {
        const readState = vi.fn()
            .mockResolvedValueOnce({ scripts: olderSnapshot, runAt: 'document_idle' })
            .mockResolvedValue({ scripts: newerSnapshot, runAt: 'document_idle' })

        const requestSync = createSerializedPersistentScriptsSync(readState)

        await requestSync()
        await requestSync()

        expect(readState).toHaveBeenCalledTimes(2)
        expect([...fake.registered.values()]).toEqual(computeDesiredRegistrations(newerSnapshot))
    })

    it('logs a failed read and keeps serving later requests', async () => {
        const readState = vi.fn()
            .mockRejectedValueOnce(new Error('storage unavailable'))
            .mockResolvedValue({ scripts: newerSnapshot, runAt: 'document_idle' })

        const requestSync = createSerializedPersistentScriptsSync(readState)

        await expect(requestSync()).resolves.toBeUndefined()
        await requestSync()

        expect(consoleError).toHaveBeenCalledTimes(1)
        expect([...fake.registered.values()]).toEqual(computeDesiredRegistrations(newerSnapshot))
    })
})

function makeItem(overrides: Partial<Script> = {}): Script {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? '',
        runMode: overrides.runMode ?? 'always',
        type: overrides.type ?? 'js',
    }
}

function yieldToEventLoop(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
}

function createFakeUserScripts() {
    const registered = new Map<string, chrome.userScripts.RegisteredUserScript>()

    async function register(scripts: chrome.userScripts.RegisteredUserScript[]) {
        await yieldToEventLoop()

        const ids = scripts.map(script => script.id)
        const duplicate = ids.find((id, index) => registered.has(id) || ids.indexOf(id) !== index)
        if (duplicate) {
            throw new Error(`Duplicate script ID '${duplicate}'`)
        }

        scripts.forEach(script => registered.set(script.id, script))
    }

    async function unregister() {
        await yieldToEventLoop()
        registered.clear()
    }

    return { registered, register, unregister }
}
