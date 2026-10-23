import React, { ReactNode } from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { parseAlwaysOnTiming } from '../../service/alwaysOnTiming'
import { useAlwaysOnTiming } from '../providers/AlwaysOnTimingProvider'

export interface Props {
    start: ReactNode
    end: ReactNode
    idle: ReactNode
}

const AlwaysOnTimingSelect = ({ start, end, idle }: Props) => {
    const { timing, changeTiming } = useAlwaysOnTiming()

    function handleChange(event: SelectChangeEvent) {
        changeTiming(parseAlwaysOnTiming(event.target.value))
    }

    return (
        <Select
            size="small"
            value={timing ?? ''}
            disabled={timing === null}
            sx={{ minWidth: 180 }}
            onChange={handleChange}
        >
            <MenuItem value="document_start">{start}</MenuItem>
            <MenuItem value="document_end">{end}</MenuItem>
            <MenuItem value="document_idle">{idle}</MenuItem>
        </Select>
    )
}

export default AlwaysOnTimingSelect
