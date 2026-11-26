import { Fade } from '@mui/material'
import React from 'react'

import TutorialTooltip from '../../TutorialTooltip'
import { Props } from './RunModeToggle.types'
import { MODES, useRunModeToggleBehavior } from './RunModeToggle.behavior'
import { iconSx, Marker, Root, Thumb, tooltipSlotProps, Track } from './RunModeToggle.styles'

export default function RunModeToggle({ mode, onModeChange, warning }: Props) {
    const { Icon, tooltipTitle, tooltipOpen, handlers } = useRunModeToggleBehavior({ mode, onModeChange, warning })

    return (
        <TutorialTooltip
            title={tooltipTitle}
            placement="top"
            slots={{ transition: Fade }}
            slotProps={tooltipSlotProps}
            arrow
            open={tooltipOpen}
            onOpen={handlers.openTooltip}
            onClose={handlers.closeTooltip}
        >
            <Root onClick={handlers.click}>
                <Track mode={mode} />
                {MODES.map((markerMode) => (
                    <Marker key={markerMode} markerMode={markerMode} selected={markerMode === mode} />
                ))}
                <Thumb mode={mode}>
                    <Icon sx={iconSx} />
                </Thumb>
            </Root>
        </TutorialTooltip>
    )
}
