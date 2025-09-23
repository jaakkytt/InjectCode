import * as React from 'react'
import { forwardRef } from 'react'
import { Switch, SwitchProps, switchClasses, styled } from '@mui/material'
import PublicIcon from '@mui/icons-material/Public'
import LocationOnIcon from '@mui/icons-material/LocationOn'

type IconSwitchBaseProps = Omit<SwitchProps, 'icon' | 'checkedIcon'> & {
    uncheckedIcon?: React.ReactElement;
    checkedIcon?: React.ReactElement;
};

export type IconSwitchProps = IconSwitchBaseProps;

const Thumb = styled('span', {
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

const StyledSwitch = styled(Switch)(({ theme }) => ({
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

export const IconSwitch = forwardRef<HTMLButtonElement, IconSwitchProps>(({ ...props }, ref) => {
    return (
        <StyledSwitch
            ref={ref}
            icon={<Thumb checked={props.checked}><LocationOnIcon /></Thumb>}
            checkedIcon={<Thumb checked={props.checked}><PublicIcon /></Thumb>}
            {...props}
        />
    )
})
