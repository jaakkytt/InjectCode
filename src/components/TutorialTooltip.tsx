import React, { SyntheticEvent } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'

const TutorialTooltip: React.FC<TooltipProps> = ({ children, title, onOpen, ...props }) => {

    const handleOpen = (event: SyntheticEvent<Element, Event>) => {
        if (onOpen) {
            onOpen(event)
        }
    }

    return (
        <Tooltip title={title} {...props} onOpen={handleOpen}>
            {children}
        </Tooltip>
    )
}

export default TutorialTooltip
