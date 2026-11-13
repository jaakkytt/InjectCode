import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import {
    DEFAULT_EDITOR_SETTINGS,
    EditorSettings,
    readEditorSettings,
} from '../../shared/service/settings/editorSettings'

const editorSettingsContext = createContext<EditorSettings>(DEFAULT_EDITOR_SETTINGS)

export function useEditorSettings() {
    return useContext(editorSettingsContext)
}

export const EditorSettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState(DEFAULT_EDITOR_SETTINGS)

    useEffect(() => {
        readEditorSettings().then(setSettings)
    }, [])

    return (
        <editorSettingsContext.Provider value={settings}>
            {children}
        </editorSettingsContext.Provider>
    )
}
