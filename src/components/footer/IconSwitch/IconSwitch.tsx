import React, { forwardRef } from 'react'
import PublicIcon from '@mui/icons-material/Public'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Props } from './IconSwitch.types'
import { StyledSwitch, Thumb } from './IconSwitch.styles'

export const IconSwitch = forwardRef<HTMLButtonElement, Props>(({ ...props }, ref) => {
    return (
        <StyledSwitch
            ref={ref}
            icon={<Thumb checked={props.checked}><LocationOnIcon /></Thumb>}
            checkedIcon={<Thumb checked={props.checked}><PublicIcon /></Thumb>}
            {...props}
        />
    )
})
