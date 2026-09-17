import React from 'react'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import { IconButton, TextField, Typography } from '@mui/material'
import { Props } from './AccordionTitle.types'
import { useAccordionTitleBehavior } from './AccordionTitle.behavior'
import { actionIconWrapperSx, titleValueSx } from './AccordionTitle.styles'

export default function AccordionTitle({
    value,
    allowEditing,
    onChange,
    inputValidator = (input: string) => Promise.resolve(input.trim() === '' ? 'This field cannot be empty' : undefined),
    inputTransformer,
    children,
}: Props) {
    const { isEditing, error, inputValue, textFieldRef, handlers } = useAccordionTitleBehavior({
        value,
        onChange,
        inputValidator,
        inputTransformer,
    })

    if (!allowEditing) {
        return (
            <>
                {children}
                <Typography component="span" sx={titleValueSx}>
                    {inputValue}
                </Typography>
            </>
        )
    }

    if (!isEditing) {
        return (
            <>
                <Typography component="span" sx={actionIconWrapperSx}>
                    <IconButton
                        color="primary"
                        component="span"
                        aria-label="Edit"
                        size="medium"
                        onClick={handlers.handleEditClick}
                    >
                        <EditIcon />
                    </IconButton>
                </Typography>
                <Typography component="span" sx={titleValueSx}>
                    {inputValue}
                </Typography>
            </>
        )
    }

    return (
        <>
            <Typography component="span" sx={actionIconWrapperSx}>
                <IconButton
                    color="primary"
                    component="span"
                    aria-label="Save"
                    size="medium"
                    onMouseDown={handlers.preventFocusLoss}
                    onClick={handlers.handleSaveClick}
                >
                    <SaveIcon />
                </IconButton>
            </Typography>
            <Typography component="span" sx={titleValueSx}>
                <TextField
                    fullWidth
                    error={!!error}
                    label={error}
                    variant="standard"
                    size="medium"
                    value={inputValue}
                    onClick={handlers.stopClickPropagation}
                    onChange={handlers.handleOnChange}
                    onBlur={handlers.handleBlur}
                    inputRef={textFieldRef}
                    onKeyDown={handlers.handleKeyDown}
                />
            </Typography>
        </>
    )
}
