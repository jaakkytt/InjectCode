import * as React from 'react'
import { useState } from 'react'
import { Fade } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import AdsClickIcon from '@mui/icons-material/AdsClick'
import BoltIcon from '@mui/icons-material/Bolt'
import TutorialTooltip from '../TutorialTooltip'
import { ScriptRunMode } from '../../types'

const MODES: ScriptRunMode[] = ['disabled', 'active', 'always']

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

const Root = styled('div')({
    position: 'relative',
    width: 60,
    height: 26,
    flex: 'none',
    cursor: 'pointer',
    userSelect: 'none',
})

const Track = styled('div', {
    shouldForwardProp: (prop) => prop !== 'mode',
})<{ mode: ScriptRunMode }>(({ theme }) => ({
    position: 'absolute',
    top: 5,
    left: 0,
    width: 60,
    height: 16,
    borderRadius: '8px',
    transition: 'background 200ms cubic-bezier(0.4,0,0.2,1)',
    variants: [
        { props: { mode: 'disabled' }, style: { backgroundColor: alpha(theme.palette.common.black, 0.25) } },
        { props: { mode: 'active' }, style: { backgroundColor: alpha(theme.palette.primary.main, 0.5) } },
        { props: { mode: 'always' }, style: { backgroundColor: alpha(theme.palette.warning.main, 0.5) } },
    ],
}))

const Marker = styled('div', {
    shouldForwardProp: (prop) => prop !== 'markerMode' && prop !== 'selected',
})<{ markerMode: ScriptRunMode; selected: boolean }>(({ theme }) => ({
    position: 'absolute',
    top: 9,
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'background 200ms ease',
    variants: [
        {
            props: { markerMode: 'disabled' },
            style: { left: 9, backgroundColor: alpha(theme.palette.common.white, 0.85) },
        },
        {
            props: { markerMode: 'active' },
            style: { left: 26, backgroundColor: alpha(theme.palette.primary.main, 0.6) },
        },
        {
            props: { markerMode: 'always' },
            style: { left: 43, backgroundColor: alpha(theme.palette.warning.main, 0.6) },
        },
        { props: { selected: true }, style: { backgroundColor: alpha(theme.palette.common.white, 0.35) } },
    ],
}))

const Thumb = styled('div', {
    shouldForwardProp: (prop) => prop !== 'mode',
})<{ mode: ScriptRunMode }>(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: '50%',
    boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
    display: 'grid',
    placeItems: 'center',
    transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), background 200ms cubic-bezier(0.4,0,0.2,1)',
    variants: [
        {
            props: { mode: 'disabled' },
            style: {
                transform: 'translateX(0px)',
                backgroundColor: theme.palette.grey[50],
                color: theme.palette.action.active,
            },
        },
        {
            props: { mode: 'active' },
            style: {
                transform: 'translateX(17px)',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
            },
        },
        {
            props: { mode: 'always' },
            style: {
                transform: 'translateX(34px)',
                backgroundColor: theme.palette.warning.main,
                color: theme.palette.warning.contrastText,
            },
        },
    ],
}))

interface Props {
    mode: ScriptRunMode
    onModeChange: (mode: ScriptRunMode) => void
    warning?: boolean
}

export default function RunModeToggle({ mode, onModeChange, warning }: Props) {
    const Icon = ICON[mode]
    const [hoverOpen, setHoverOpen] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length]
        onModeChange(next)
    }

    return (
        <TutorialTooltip
            title={warning ? EDIT_DOWNGRADE_WARNING : LABEL[mode]}
            placement="top"
            slots={{ transition: Fade }}
            slotProps={{ tooltip: { sx: { whiteSpace: 'nowrap' } } }}
            arrow
            open={warning || hoverOpen}
            onOpen={() => setHoverOpen(true)}
            onClose={() => setHoverOpen(false)}
        >
            <Root onClick={handleClick}>
                <Track mode={mode} />
                {MODES.map((markerMode) => (
                    <Marker key={markerMode} markerMode={markerMode} selected={markerMode === mode} />
                ))}
                <Thumb mode={mode}>
                    <Icon sx={{ fontSize: 15 }} />
                </Thumb>
            </Root>
        </TutorialTooltip>
    )
}
