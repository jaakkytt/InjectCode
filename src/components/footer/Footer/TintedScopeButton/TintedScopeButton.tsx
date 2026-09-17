import React from 'react'
import Button from '@mui/material/Button'
import { Props } from './TintedScopeButton.types'
import { buttonSx } from './TintedScopeButton.styles'

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
