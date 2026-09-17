import React from 'react'
import { TextField } from '@mui/material'
import './AccordionBody.css'
import StatusIcon from './StatusIcon'
import { Props } from './AccordionBody.types'
import { useAccordionBodyBehavior } from './AccordionBody.behavior'

export default function AccordionBody({ value, onChange, onFocusChange }: Props) {
    const { inputValue, status, handlers } = useAccordionBodyBehavior({ value, onChange, onFocusChange })

    return (
        <TextField
            className="codeTextField"
            fullWidth
            multiline
            minRows={4}
            label={<StatusIcon status={status} />}
            value={inputValue}
            onChange={handlers.handleChange}
            onFocus={handlers.handleFocus}
            onBlur={handlers.handleBlur}
            onClick={handlers.stopClickPropagation}
        />
    )
}
