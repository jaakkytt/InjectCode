import { defaultKeymap, EditorHotkey, toggleComment } from 'prism-react-editor/commands'
import {
    DEFAULT_EDITOR_HOTKEYS,
    EDITOR_COMMANDS,
    EditorCommand,
    EditorHotkeys,
} from '../../../shared/service/settings/editorSettings'

const COMMANDS: Record<EditorCommand, EditorHotkey> = {
    toggleComment: editor => toggleComment(editor),
}

export function buildKeymap(hotkeys: EditorHotkeys): Record<string, EditorHotkey> {
    const keymap = { ...defaultKeymap }

    EDITOR_COMMANDS.forEach(command => delete keymap[DEFAULT_EDITOR_HOTKEYS[command]])
    EDITOR_COMMANDS.forEach(command => keymap[hotkeys[command]] = COMMANDS[command])

    return keymap
}
