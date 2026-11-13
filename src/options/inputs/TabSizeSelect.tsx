import React from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { TAB_SIZES } from '../../shared/service/settings/editorSettings'
import { useEditorSettings } from '../providers/EditorSettingsProvider'

const TabSizeSelect = () => {
    const { settings, changeSettings } = useEditorSettings()

    function handleChange(event: SelectChangeEvent) {
        changeSettings({ tabSize: Number(event.target.value) })
    }

    return (
        <Select
            size="small"
            value={settings ? String(settings.tabSize) : ''}
            disabled={settings === null}
            onChange={handleChange}
        >
            {TAB_SIZES.map(size => (
                <MenuItem key={size} value={String(size)}>{size}</MenuItem>
            ))}
        </Select>
    )
}

export default TabSizeSelect
