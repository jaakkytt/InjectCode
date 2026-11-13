import { STORAGE_EDITOR_SETTINGS } from '../../constants'
import { storage } from '../storageApi'

export const EDITOR_COMMANDS = ['toggleComment'] as const

export type EditorCommand = typeof EDITOR_COMMANDS[number]

export type EditorHotkeys = Record<EditorCommand, string>

export interface EditorSettings {
    tabSize: number
    insertSpaces: boolean
    hotkeys: EditorHotkeys
}

export const TAB_SIZES = [2, 4, 8]

export const DEFAULT_EDITOR_HOTKEYS: EditorHotkeys = {
    toggleComment: 'Mod+/',
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
    tabSize: 2,
    insertSpaces: true,
    hotkeys: DEFAULT_EDITOR_HOTKEYS,
}

function asRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function parseHotkeys(value: unknown): EditorHotkeys {
    const stored = asRecord(value)

    return Object.fromEntries(EDITOR_COMMANDS.map(command => {
        const hotkey = stored[command]
        return [command, typeof hotkey === 'string' && hotkey !== '' ? hotkey : DEFAULT_EDITOR_HOTKEYS[command]]
    })) as EditorHotkeys
}

function parseEditorSettings(value: unknown): EditorSettings {
    const { tabSize, insertSpaces, hotkeys } = asRecord(value)

    return {
        tabSize: TAB_SIZES.find(size => size === tabSize) ?? DEFAULT_EDITOR_SETTINGS.tabSize,
        insertSpaces: typeof insertSpaces === 'boolean' ? insertSpaces : DEFAULT_EDITOR_SETTINGS.insertSpaces,
        hotkeys: parseHotkeys(hotkeys),
    }
}

export async function readEditorSettings(): Promise<EditorSettings> {
    const stored = await storage.getValue<unknown>(STORAGE_EDITOR_SETTINGS, DEFAULT_EDITOR_SETTINGS)
    return parseEditorSettings(stored)
}

export function saveEditorSettings(settings: EditorSettings): Promise<void> {
    return storage.setValue(STORAGE_EDITOR_SETTINGS, settings)
}
