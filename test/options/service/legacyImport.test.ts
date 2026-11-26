import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Script } from '../../../src/shared/types'
import {
    LOCAL_STORAGE_LEGACY_IMPORT_FAILED,
    LOCAL_STORAGE_LEGACY_SCOPE,
    LOCAL_STORAGE_LEGACY_SCRIPTS,
    SHARED_CODE,
    STORAGE_SCRIPTS,
} from '../../../src/shared/constants'
import { importLegacyScripts, parseLegacyScripts } from '../../../src/options/service/legacyImport'
import { createFakeLocalStorage } from '../../fakes/localStorage'

const { get, set } = vi.hoisted(() => ({
    get: vi.fn(),
    set: vi.fn(),
}))

vi.mock('../../../src/shared/service/storageApi', () => ({ storage: { get, set } }))

const OLD_SCRIPTS = [{ name: 'Old', code: 'old()' }]

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
    vi.stubGlobal('localStorage', createFakeLocalStorage())
    get.mockReset().mockResolvedValue({ [SHARED_CODE]: [] })
    set.mockReset()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
    consoleError.mockRestore()
    vi.unstubAllGlobals()
})

describe('parseLegacyScripts', () => {
    it('maps 1.x items to disabled JavaScript scripts', () => {
        const raw = JSON.stringify([{ name: 'Hello', code: 'alert(1)', active: 1, hidden: 0 }])

        expect(parseLegacyScripts(raw)).toEqual([{
            id: expect.stringMatching(/^js-imported-/),
            title: 'Hello',
            secondaryText: '',
            content: 'alert(1)',
            runMode: 'disabled',
            type: 'js',
        }])
    })

    it('skips empty code and malformed items, and names untitled ones', () => {
        const raw = JSON.stringify([{ name: 'Empty', code: '  ' }, null, 'text', { name: '', code: 'a()' }])

        expect(parseLegacyScripts(raw).map(item => item.title)).toEqual(['InjectCode 1.x script 4'])
    })

    it('gives identical 1.x scripts different ids', () => {
        const raw = JSON.stringify([{ name: 'Same', code: 'a()' }, { name: 'Same', code: 'a()' }])

        const [first, second] = parseLegacyScripts(raw)

        expect(first.id).not.toBe(second.id)
    })

    it('gives the same 1.x data the same ids on every run', () => {
        const raw = JSON.stringify([{ name: 'One', code: 'a()' }, { name: 'Two', code: 'b()' }])

        expect(parseLegacyScripts(raw).map(item => item.id)).toEqual(parseLegacyScripts(raw).map(item => item.id))
    })

    it('throws on data that is not a JSON list', () => {
        expect(() => parseLegacyScripts('not json')).toThrow()
        expect(() => parseLegacyScripts('{"a":1}')).toThrow(`${LOCAL_STORAGE_LEGACY_SCRIPTS} to hold a JSON list`)
    })
})

describe('importLegacyScripts', () => {
    it('reports nothing without touching storage when there is no 1.x data', async () => {
        expect(await importLegacyScripts()).toEqual({ status: 'nothing' })
        expect(get).not.toHaveBeenCalled()
    })

    it('appends to the end of Shared and removes the 1.x data', async () => {
        const existing = makeItem({ id: 'mine', title: 'Mine' })
        get.mockResolvedValue({ [SHARED_CODE]: [existing] })
        seedLegacyScripts(OLD_SCRIPTS)

        const result = await importLegacyScripts()

        expect(result).toEqual({ status: 'imported', summary: { added: 1, overwritten: 0, skipped: 0 } })
        expect(set).toHaveBeenCalledWith(STORAGE_SCRIPTS, {
            [SHARED_CODE]: [existing, expect.objectContaining({ title: 'Old', runMode: 'disabled' })],
        })
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_SCRIPTS)).toBeNull()
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_SCOPE)).toBeNull()
    })

    it('keeps the 1.x data and marks the failure when saving fails', async () => {
        set.mockRejectedValue(new Error('quota'))
        seedLegacyScripts(OLD_SCRIPTS)

        expect(await importLegacyScripts()).toEqual({ status: 'failed' })
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_SCRIPTS)).not.toBeNull()
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_IMPORT_FAILED)).not.toBeNull()
        expect(consoleError).toHaveBeenCalledTimes(1)
    })

    it('keeps unreadable 1.x data and reports it as failed', async () => {
        localStorage.setItem(LOCAL_STORAGE_LEGACY_SCRIPTS, 'not json')

        expect(await importLegacyScripts()).toEqual({ status: 'failed' })
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_SCRIPTS)).toBe('not json')
    })

    it('does not retry after a failed import', async () => {
        seedLegacyScripts(OLD_SCRIPTS)
        localStorage.setItem(LOCAL_STORAGE_LEGACY_IMPORT_FAILED, 'true')

        expect(await importLegacyScripts()).toEqual({ status: 'failed' })
        expect(get).not.toHaveBeenCalled()
    })

    it('leaves already imported scripts alone when it runs again', async () => {
        const [imported] = parseLegacyScripts(JSON.stringify(OLD_SCRIPTS))
        const editedSinceImport = { ...imported, content: 'edited()' }
        get.mockResolvedValue({ [SHARED_CODE]: [editedSinceImport] })
        seedLegacyScripts(OLD_SCRIPTS)

        expect(await importLegacyScripts()).toEqual({ status: 'nothing' })
        expect(set).not.toHaveBeenCalled()
        expect(localStorage.getItem(LOCAL_STORAGE_LEGACY_SCRIPTS)).toBeNull()
    })
})

function seedLegacyScripts(items: unknown[]) {
    localStorage.setItem(LOCAL_STORAGE_LEGACY_SCRIPTS, JSON.stringify(items))
    localStorage.setItem(LOCAL_STORAGE_LEGACY_SCOPE, 'global')
}

function makeItem(overrides: Partial<Script> = {}): Script {
    return { id: 'x', title: 'X', secondaryText: '', content: '', runMode: 'active', type: 'js', ...overrides }
}
