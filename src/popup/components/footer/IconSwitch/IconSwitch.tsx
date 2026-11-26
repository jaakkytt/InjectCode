import LocationOnIcon from '@mui/icons-material/LocationOn'
import PublicIcon from '@mui/icons-material/Public'
import React, { forwardRef } from 'react'

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
