import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_EDITOR_SETTINGS, readEditorSettings } from '../../../../src/shared/service/settings/editorSettings'

const { getValue } = vi.hoisted(() => ({ getValue: vi.fn() }))

vi.mock('../../../../src/shared/service/storageApi', () => ({ storage: { getValue } }))

describe('readEditorSettings', () => {
    beforeEach(() => {
        getValue.mockReset()
    })

    it('keeps stored values', async () => {
        const stored = { tabSize: 4, insertSpaces: false, hotkeys: { toggleComment: '3+k' } }
        getValue.mockResolvedValue(stored)

        expect(await readEditorSettings()).toEqual(stored)
    })

    it('falls back to the default per field for invalid values', async () => {
        getValue.mockResolvedValue({ tabSize: 3, insertSpaces: false, hotkeys: { toggleComment: '' } })

        expect(await readEditorSettings()).toEqual({ ...DEFAULT_EDITOR_SETTINGS, insertSpaces: false })
    })

    it('falls back to all defaults when nothing usable is stored', async () => {
        getValue.mockResolvedValue('4')

        expect(await readEditorSettings()).toEqual(DEFAULT_EDITOR_SETTINGS)
    })
})
