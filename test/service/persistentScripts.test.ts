import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { AccordionItemData, ItemsDataState } from '../../src/types'
import { SHARED_CODE, USER_SCRIPT_ID } from '../../src/constants'
import {
    computeDesiredRegistrations,
    syncPersistentScripts,
    wrapCssAsUserScript,
} from '../../src/service/persistentScripts'

function makeItem(overrides: Partial<AccordionItemData> = {}): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? '',
        runMode: overrides.runMode ?? 'always',
        type: overrides.type ?? 'js',
    }
}

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
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ id: 'a', runMode: 'always', type: 'js', content: 'a();' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired).toHaveLength(1)
        expect(desired[0].matches).toEqual(['https://github.com/*'])
        expect(desired[0].world).toBe('USER_SCRIPT')
        expect(desired[0].worldId).toBe(USER_SCRIPT_ID)
        expect(desired[0].js).toEqual([{ code: 'a();' }])
    })

    it('omits containers with no always-on item, even if other items are active', () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ runMode: 'active' })],
        }

        expect(computeDesiredRegistrations(scripts)).toEqual([])
    })

    it('narrow read: a shared always-on item only rides along on containers that have their own always-on item', () => {
        const scripts: ItemsDataState = {
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
        const scripts: ItemsDataState = {
            [SHARED_CODE]: [makeItem({ id: 'shared-active', runMode: 'active', content: 'shared();' })],
            'https://github.com/*': [makeItem({ id: 'own-1', runMode: 'always', content: 'own();' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired[0].js).toEqual([{ code: 'own();' }])
    })

    it('wraps css items as a style-injecting js snippet', () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ type: 'css', content: 'body{color:red}' })],
        }

        const desired = computeDesiredRegistrations(scripts)

        expect(desired[0]!.js![0]!.code).toBe(wrapCssAsUserScript('body{color:red}'))
    })

    it('skips containers keyed by an invalid match pattern', () => {
        const scripts: ItemsDataState = {
            'not-a-pattern': [makeItem({ runMode: 'always' })],
        }

        expect(computeDesiredRegistrations(scripts)).toEqual([])
    })

    it('produces a stable id for the same pattern and different ids for different patterns', () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ id: 'a', content: 'a();' })],
            'https://example.com/*': [makeItem({ id: 'b', content: 'b();' })],
        }

        const first = computeDesiredRegistrations(scripts)
        const second = computeDesiredRegistrations(scripts)

        const idFor = (list: typeof first, pattern: string) => list.find(r => r.matches?.[0] === pattern)?.id
        expect(idFor(first, 'https://github.com/*')).toBe(idFor(second, 'https://github.com/*'))
        expect(idFor(first, 'https://github.com/*')).not.toBe(idFor(first, 'https://example.com/*'))
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
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ runMode: 'always', content: 'a();' })],
        }

        await syncPersistentScripts(scripts)

        expect(unregister).toHaveBeenCalledWith()
        expect(register).toHaveBeenCalledWith(computeDesiredRegistrations(scripts))
    })

    it('only unregisters, without calling register, when nothing should be persistently registered', async () => {
        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ runMode: 'active' })],
        }

        await syncPersistentScripts(scripts)

        expect(unregister).toHaveBeenCalledWith()
        expect(register).not.toHaveBeenCalled()
    })

    it('logs and swallows errors instead of throwing', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
        register.mockRejectedValue(new Error('Allow User Scripts is not enabled'))

        const scripts: ItemsDataState = {
            'https://github.com/*': [makeItem({ runMode: 'always' })],
        }

        await expect(syncPersistentScripts(scripts)).resolves.toBeUndefined()
        expect(consoleError).toHaveBeenCalled()

        consoleError.mockRestore()
    })
})
