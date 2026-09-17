import React, { SyntheticEvent, useState } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import { LOCAL_STORAGE_TOOLTIP_COUNTERS, LOCAL_STORAGE_TOOLTIP_DISABLED } from '../constants'

const defaultCount = 20

const readTooltipCounters = (): Record<string, number> => {
    const stored = localStorage.getItem(LOCAL_STORAGE_TOOLTIP_COUNTERS)
    return stored !== null ? JSON.parse(stored) : {}
}

const TutorialTooltip: React.FC<TooltipProps> = ({ children, title, onOpen, ...props }) => {

    const [disabled] = useState<boolean>(() => localStorage.getItem(LOCAL_STORAGE_TOOLTIP_DISABLED) === 'true')

    const [exhausted] = useState<boolean>(() => {
        const counters = readTooltipCounters()
        return (counters[String(title)] ?? 0) >= defaultCount
    })

    const handleOpen = (event: SyntheticEvent<Element, Event>) => {
        const titleKey = String(title)
        const counters = readTooltipCounters()
        const currentCount = counters[titleKey] ?? 0

        if (currentCount < defaultCount) {
            counters[titleKey] = currentCount + 1
            localStorage.setItem(LOCAL_STORAGE_TOOLTIP_COUNTERS, JSON.stringify(counters))
        }

        if (onOpen) {
            onOpen(event)
        }
    }

    if (disabled || exhausted) {
        return <>{children}</>
    }

    return (
        <Tooltip title={title} {...props} onOpen={handleOpen}>
            {children}
        </Tooltip>
    )
}

export default TutorialTooltip
