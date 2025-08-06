import React, { useEffect, useRef, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import { IconButton, TextField } from '@mui/material'
import Typography from '@mui/material/Typography'

interface Props {
    value: string
    allowEditing: boolean
    onChange: (newValue: string) => void
    inputValidator?: (input: string) => string | undefined
    children?: React.ReactNode
}

export default function AccordionTitle({
    value,
    allowEditing,
    onChange,
    inputValidator = (input: string) => input.trim() === '' ? 'This field cannot be empty' : undefined,
    children,
}: Props) {

    const [isEditing, setEditing] = useState(false)
    const [isSaved, setSaved] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [inputValue, setInputValue] = useState(value)
    const textFieldRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && textFieldRef.current) {
            textFieldRef.current.focus()
        }
    }, [isEditing])

    useEffect(() => setInputValue(value), [value])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (textFieldRef.current) {
                handleSave()
            }
        }
    }

    const handleSave = () => {
        const validationError = inputValidator(inputValue)
        if (validationError) {
            setSaved(false)
            setError(validationError)
            return
        }
        setError(undefined)
        if (inputValue.trim() !== value.trim()) {
            setSaved(true)
            onChange(inputValue.trim())
        }
        setEditing(false)
        if (textFieldRef.current) {
            textFieldRef.current.blur()
        }
    }

    return (
        allowEditing ? (
            isEditing ? (
                <>
                    <Typography
                        component="span"
                        sx={{ flexGrow: 0 }} style={{ marginRight: 8 }}
                    >
                        <IconButton
                            color="primary"
                            component="span"
                            aria-label="Save"
                            size="medium"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleSave()
                            }}
                        >
                            <SaveIcon />
                        </IconButton>
                    </Typography>
                    <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                        <TextField
                            fullWidth
                            error={!!error}
                            label={error}
                            variant="standard"
                            size="medium"
                            value={inputValue}
                            onClick={e => e.stopPropagation()}
                            onChange={(e) => {
                                setInputValue(e.target.value)
                                if (e.target.value.trim() !== value.trim() || value.trim() === '') {
                                    setError(inputValidator(e.target.value))
                                } else {
                                    setError(undefined)
                                }
                            }}
                            onBlur={() => {
                                if (!isSaved) {
                                    setInputValue(value)
                                }
                                setError(undefined)
                                setEditing(false)
                            }}
                            inputRef={textFieldRef}
                            onKeyDown={handleKeyDown}
                        />
                    </Typography>
                </>
            ) : (
                <>
                    <Typography component="span" sx={{ flexGrow: 0 }} style={{ marginRight: 8 }}>
                        <IconButton
                            color="primary"
                            component="span"
                            aria-label="Edit"
                            size="medium"
                            onClick={(e) => {
                                e.stopPropagation()
                                setEditing(true)
                                setSaved(false)
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Typography>
                    <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                        {inputValue}
                    </Typography>
                </>
            )
        ) : (
            <>
                {children}
                <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                    {inputValue}
                </Typography>
            </>
        )
    )
}
