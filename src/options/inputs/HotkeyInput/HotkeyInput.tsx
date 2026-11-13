import React from 'react'
import { TextField } from '@mui/material'
import { Props } from './HotkeyInput.types'
import { useHotkeyInputBehavior } from './HotkeyInput.behavior'

const HotkeyInput = ({ command }: Props) => {
    const { value, isDisabled, handlers } = useHotkeyInputBehavior({ command })

    return (
        <TextField
            size="small"
            value={value}
            disabled={isDisabled}
            onBlur={handlers.blur}
            slotProps={{
                htmlInput: { readOnly: true, onKeyDown: handlers.keyDown, onKeyUp: handlers.keyUp },
            }}
        />
    )
}

export default HotkeyInput
