import { styled, Switch, switchClasses } from '@mui/material'

export const Thumb = styled('span', {
    shouldForwardProp: (prop) => prop !== 'checked',
})<{ checked?: boolean }>(({ theme, checked }) => ({
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: checked ? theme.palette.warning.main : theme.palette.success.main,
    display: 'grid',
    placeItems: 'center',
    '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: '#fff',
    },
}))

export const StyledSwitch = styled(Switch)(({ theme }) => ({
    width: 54,
    height: 26,
    padding: 7,
    [`& .${switchClasses.switchBase}`]: {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        [`&.${switchClasses.checked}`]: {
            color: '#fff',
            transform: 'translateX(22px)',
            [`& + .${switchClasses.track}`]: {
                opacity: 1,
                backgroundColor: theme.palette.warning.main,
            },
        },
    },
    [`& .${switchClasses.track}`]: {
        opacity: 1,
        backgroundColor: theme.palette.success.main,
        borderRadius: 10,
    },
}))
