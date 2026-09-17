import React from 'react'
import { Fade } from '@mui/material'
import TutorialTooltip from '../../TutorialTooltip'
import { Props } from './RunModeToggle.types'
import { MODES, useRunModeToggleBehavior } from './RunModeToggle.behavior'
import { Root, Track, Marker, Thumb, iconSx, tooltipSlotProps } from './RunModeToggle.styles'

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
            onOpen={handlers.handleTooltipOpen}
            onClose={handlers.handleTooltipClose}
        >
            <Root onClick={handlers.handleClick}>
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
