import React, { SyntheticEvent, useState } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import {
    areTooltipsEnabled,
    countTooltipShown,
    isTooltipExhausted,
} from '../../shared/service/settings/tooltipPreferences'

const TutorialTooltip: React.FC<TooltipProps> = ({ children, title, onOpen, ...props }) => {

    const [disabled] = useState<boolean>(() => !areTooltipsEnabled())

    const [exhausted] = useState<boolean>(() => isTooltipExhausted(String(title)))

    const handleOpen = (event: SyntheticEvent<Element, Event>) => {
        countTooltipShown(String(title))

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
