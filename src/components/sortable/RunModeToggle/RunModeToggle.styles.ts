import { alpha, styled } from '@mui/material/styles'
import { SxProps, Theme } from '@mui/material'
import { TooltipProps } from '@mui/material/Tooltip'
import { ScriptRunMode } from '../../../types'

export const Root = styled('div')({
    position: 'relative',
    width: 60,
    height: 26,
    flex: 'none',
    cursor: 'pointer',
    userSelect: 'none',
})

export const Track = styled('div', {
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

export const Marker = styled('div', {
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

export const Thumb = styled('div', {
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

export const iconSx: SxProps<Theme> = { fontSize: 15 }

export const tooltipSlotProps: TooltipProps['slotProps'] = {
    tooltip: { sx: { whiteSpace: 'nowrap' } },
}
