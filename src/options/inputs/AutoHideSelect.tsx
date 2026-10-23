import React from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { FeedbackSeverity } from '../../shared/types'
import { FeedbackAutoHideMs } from '../../shared/service/settings/feedbackAutoHide'
import { useFeedbackAutoHide } from '../providers/FeedbackAutoHideProvider'

export interface Props {
    severity: FeedbackSeverity
}

const OPTIONS: { ms: FeedbackAutoHideMs, label: string }[] = [
    { ms: 0, label: 'Don\'t show' },
    { ms: 1000, label: 'Hide after 1s' },
    { ms: 2000, label: 'Hide after 2s' },
    { ms: 5000, label: 'Hide after 5s' },
    { ms: 10000, label: 'Hide after 10s' },
    { ms: null, label: 'Hide only on click' },
]

const AutoHideSelect = ({ severity }: Props) => {
    const { autoHide, changeAutoHide } = useFeedbackAutoHide()

    function handleChange(event: SelectChangeEvent) {
        changeAutoHide(severity, JSON.parse(event.target.value))
    }

    return (
        <Select
            size="small"
            value={autoHide ? String(autoHide[severity]) : ''}
            disabled={autoHide === null}
            sx={{ minWidth: 180 }}
            onChange={handleChange}
        >
            {OPTIONS.map(({ ms, label }) => (
                <MenuItem key={label} value={String(ms)}>{label}</MenuItem>
            ))}
        </Select>
    )
}

export default AutoHideSelect
