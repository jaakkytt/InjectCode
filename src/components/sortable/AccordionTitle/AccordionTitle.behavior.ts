import React, { useEffect, useRef, useState } from 'react'
import { AccordionTitleBehaviorProps } from './AccordionTitle.types'

type SaveOutcome =
    | { type: 'unchanged' }
    | { type: 'invalid'; error: string }
    | { type: 'saved'; value: string }

function shouldValidateOnChange(transformedValue: string, originalValue: string) {
    return transformedValue.trim() !== originalValue.trim() || originalValue.trim() === ''
}

export function useAccordionTitleBehavior(
    { value, onChange, inputValidator, inputTransformer }: AccordionTitleBehaviorProps,
) {
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

    async function resolveSaveOutcome(): Promise<SaveOutcome> {
        const trimmed = inputValue.trim()
        if (trimmed === value.trim()) {
            return { type: 'unchanged' }
        }

        const validationError = await inputValidator(trimmed)
        if (validationError) {
            return { type: 'invalid', error: validationError }
        }

        return { type: 'saved', value: trimmed }
    }

    async function handleSave() {
        const outcome = await resolveSaveOutcome()

        if (outcome.type === 'invalid') {
            setSaved(false)
            setError(outcome.error)
            return
        }

        setError(undefined)
        setSaved(true)
        setEditing(false)

        if (outcome.type === 'saved') {
            onChange(outcome.value)
        }

        if (textFieldRef.current) {
            textFieldRef.current.blur()
        }
    }

    async function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const rawValue = e.target.value
        const transformedValue = inputTransformer ? inputTransformer(rawValue) : rawValue
        setInputValue(transformedValue)

        if (shouldValidateOnChange(transformedValue, value)) {
            setError(await inputValidator(transformedValue))
        } else {
            setError(undefined)
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (textFieldRef.current) {
                handleSave()
            }
        } else if (event.key === 'Escape') {
            event.preventDefault()
            setInputValue(value)
            setError(undefined)
            setEditing(false)
            setSaved(true)
            if (textFieldRef.current) {
                textFieldRef.current.blur()
            }
        }
    }

    function handleBlur() {
        if (!isSaved) {
            setInputValue(value)
        }
        setError(undefined)
        setEditing(false)
    }

    function handleEditClick(e: React.MouseEvent) {
        e.stopPropagation()
        setEditing(true)
        setSaved(false)
    }

    function handleSaveClick(e: React.MouseEvent) {
        e.stopPropagation()
        handleSave()
    }

    return {
        isEditing,
        error,
        inputValue,
        textFieldRef,
        handlers: {
            handleOnChange,
            handleKeyDown,
            handleBlur,
            handleEditClick,
            handleSaveClick,
            preventFocusLoss: (e: React.MouseEvent) => e.preventDefault(),
            stopClickPropagation: (e: React.MouseEvent) => e.stopPropagation(),
        },
    }
}
