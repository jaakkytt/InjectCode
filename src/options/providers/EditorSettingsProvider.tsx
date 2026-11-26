import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import {
    EditorCommand,
    EditorSettings,
    readEditorSettings,
    saveEditorSettings,
} from '../../shared/service/settings/editorSettings'

interface EditorSettingsValue {
    settings: EditorSettings | null
    changeSettings: (change: Partial<EditorSettings>) => void
    changeHotkey: (command: EditorCommand, hotkey: string) => void
}

interface EditorSettingsProviderProps {
    children: ReactNode
}

const editorSettingsContext = createContext<EditorSettingsValue | undefined>(undefined)

export function useEditorSettings() {
    return requireContext(useContext(editorSettingsContext), 'EditorSettingsProvider')
}

function useEditorSettingsProviderBehavior(): EditorSettingsValue {
    const [settings, setSettings] = useState<EditorSettings | null>(null)

    useEffect(() => {
        readEditorSettings().then(setSettings)
    }, [])

    function changeSettings(change: Partial<EditorSettings>) {
        if (!settings) {
            return
        }

        const updated = { ...settings, ...change }
        setSettings(updated)
        saveEditorSettings(updated).catch(err => console.error('Failed to save editor settings:', err))
    }

    function changeHotkey(command: EditorCommand, hotkey: string) {
        if (settings) {
            changeSettings({ hotkeys: { ...settings.hotkeys, [command]: hotkey } })
        }
    }

    return { settings, changeSettings, changeHotkey }
}

export const EditorSettingsProvider = ({ children }: EditorSettingsProviderProps) => {
    const value = useEditorSettingsProviderBehavior()

    return (
        <editorSettingsContext.Provider value={value}>
            {children}
        </editorSettingsContext.Provider>
    )
}
