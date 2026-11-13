import React, { ReactNode } from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { parseViewRestoreMode } from '../../shared/service/settings/viewRestoreMode'
import { useViewRestoreMode } from '../providers/ViewRestoreModeProvider'

export interface Props {
    sameHost: ReactNode
    sameTab: ReactNode
    off: ReactNode
}

const ViewRestoreModeSelect = ({ sameHost, sameTab, off }: Props) => {
    const { mode, changeMode } = useViewRestoreMode()

    function handleChange(event: SelectChangeEvent) {
        changeMode(parseViewRestoreMode(event.target.value))
    }

    return (
        <Select
            size="small"
            value={mode ?? ''}
            disabled={mode === null}
            onChange={handleChange}
        >
            <MenuItem value="sameHost">{sameHost}</MenuItem>
            <MenuItem value="sameTab">{sameTab}</MenuItem>
            <MenuItem value="off">{off}</MenuItem>
        </Select>
    )
}

export default ViewRestoreModeSelect
