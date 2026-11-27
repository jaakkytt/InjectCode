import { Switch } from '@mui/material'
import React from 'react'

import { useEditorSettings } from '../providers/EditorSettingsProvider'

const InsertSpacesToggle = () => {
    const { settings, changeSettings } = useEditorSettings()

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        changeSettings({ insertSpaces: event.target.checked })
    }

    return (
        <Switch
            checked={settings?.insertSpaces ?? false}
            disabled={settings === null}
            onChange={handleChange}
        />
    )
}

export default InsertSpacesToggle
