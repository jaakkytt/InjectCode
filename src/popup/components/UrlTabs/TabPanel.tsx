import React from 'react'
import Box from '@mui/material/Box'
import { TabIndex } from '../../types'

interface Props {
    children?: React.ReactNode
    index: TabIndex
    value: TabIndex
}

export default function TabPanel({ children, value, index, ...other }: Props) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}
