import React, { useState } from 'react'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import AdsClickIcon from '@mui/icons-material/AdsClick'
import BoltIcon from '@mui/icons-material/Bolt'
import { ScriptRunMode } from '../../../types'
import { Props } from './RunModeToggle.types'

export const MODES: ScriptRunMode[] = ['disabled', 'active', 'always']

const LABEL: Record<ScriptRunMode, string> = {
    disabled: 'Disabled',
    active: 'Active - runs when played',
    always: 'Always on - runs automatically on matching pages',
}

const ICON: Record<ScriptRunMode, typeof PowerSettingsNewIcon> = {
    disabled: PowerSettingsNewIcon,
    active: AdsClickIcon,
    always: BoltIcon,
}

const EDIT_DOWNGRADE_WARNING = 'Edit will downgrade to Active'

export function useRunModeToggleBehavior({ mode, onModeChange, warning }: Props) {
    const [hoverOpen, setHoverOpen] = useState(false)

    function nextMode(): ScriptRunMode {
        return MODES[(MODES.indexOf(mode) + 1) % MODES.length]
    }

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        onModeChange(nextMode())
    }

    return {
        Icon: ICON[mode],
        tooltipTitle: warning ? EDIT_DOWNGRADE_WARNING : LABEL[mode],
        tooltipOpen: warning || hoverOpen,
        handlers: {
            handleClick,
            handleTooltipOpen: () => setHoverOpen(true),
            handleTooltipClose: () => setHoverOpen(false),
        },
    }
}
