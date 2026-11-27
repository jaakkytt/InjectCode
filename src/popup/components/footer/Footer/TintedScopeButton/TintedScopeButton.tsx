import Button from '@mui/material/Button'
import React from 'react'

import { buttonSx } from './TintedScopeButton.styles'
import { Props } from './TintedScopeButton.types'

export default function TintedScopeButton({ color, label, active, onClick }: Props) {
    return (
        <Button
            color={color}
            disableRipple={true}
            onClick={onClick}
            sx={buttonSx(active)}
        >{label}</Button>
    )
}
