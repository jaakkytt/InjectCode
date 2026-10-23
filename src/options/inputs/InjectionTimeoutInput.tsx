import React, { ReactNode, useEffect, useState } from 'react'
import { InputAdornment, TextField } from '@mui/material'
import {
    parseInjectionTimeout,
    readInjectionTimeout,
    saveInjectionTimeout,
} from '../../shared/service/settings/injectionTimeout'

export interface Props {
    unit: ReactNode
    invalid: ReactNode
}

const InjectionTimeoutInput = ({ unit, invalid }: Props) => {
    const [text, setText] = useState<string | null>(null)
    const isValid = text === null || parseInjectionTimeout(text) !== null

    useEffect(() => {
        readInjectionTimeout().then(seconds => setText(String(seconds)))
    }, [])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setText(event.target.value)

        const seconds = parseInjectionTimeout(event.target.value)
        if (seconds !== null) {
            saveInjectionTimeout(seconds).catch(err => console.error('Failed to save script timeout:', err))
        }
    }

    return (
        <TextField
            type="number"
            size="small"
            value={text ?? ''}
            disabled={text === null}
            error={!isValid}
            helperText={isValid ? undefined : invalid}
            onChange={handleChange}
            sx={{ width: 180, flexShrink: 0 }}
            slotProps={{
                htmlInput: { min: 0, step: 'any' },
                input: { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> },
            }}
        />
    )
}

export default InjectionTimeoutInput
