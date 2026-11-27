import { defaultKeymap } from 'prism-react-editor/commands'
import { describe, expect, it } from 'vitest'

import { buildKeymap } from '../../../../src/popup/lib/editor/keymap'
import { DEFAULT_EDITOR_HOTKEYS } from '../../../../src/shared/service/settings/editorSettings'

describe('buildKeymap', () => {
    it('moves toggle comment from its default key to the chosen one', () => {
        const keymap = buildKeymap({ toggleComment: '3+k' })

        expect(keymap['Mod+/']).toBeUndefined()
        expect(keymap['3+k']).toBeTypeOf('function')
    })

    it('keeps the other default commands', () => {
        const keymap = buildKeymap({ toggleComment: '3+k' })

        expect(keymap['Mod+]']).toBe(defaultKeymap['Mod+]'])
        expect(Object.keys(keymap)).toHaveLength(Object.keys(defaultKeymap).length)
    })

    it('keeps toggle comment on its default key when unchanged', () => {
        expect(buildKeymap(DEFAULT_EDITOR_HOTKEYS)['Mod+/']).toBeTypeOf('function')
    })
})
