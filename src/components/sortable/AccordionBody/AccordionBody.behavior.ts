import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Props, Status } from './AccordionBody.types'

function isDirty(current: string, lastSaved: string): boolean {
    return current.trim() !== lastSaved.trim()
}

export function useAccordionBodyBehavior({ value, onChange, onFocusChange }: Props) {
    const [inputValue, setInputValue] = useState(value)
    const [status, setStatus] = useState<Status>('idle')

    const lastSavedValueRef = useRef<string>(value)
    const inputValueRef = useRef<string>(value)
    const isFocusedRef = useRef<boolean>(false)
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        setInputValue(value)
        inputValueRef.current = value
        lastSavedValueRef.current = value
    }, [value])

    useEffect(() => {
        inputValueRef.current = inputValue
    }, [inputValue])

    useEffect(() => () => {
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current)
        }
    }, [])

    const doSave = useCallback(() => {
        if (isDirty(inputValueRef.current, lastSavedValueRef.current)) {
            const trimmed = inputValueRef.current.trim()
            onChange(trimmed)
            lastSavedValueRef.current = trimmed
            setStatus('saved')
            setTimeout(() => {
                setStatus(isFocusedRef.current ? 'upToDate' : 'idle')
            }, 1000)
        }
    }, [onChange])

    function startAutoSave() {
        if (!autoSaveTimerRef.current) {
            autoSaveTimerRef.current = setInterval(doSave, 5000)
        }
    }

    function stopAutoSave() {
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current)
            autoSaveTimerRef.current = null
        }
    }

    function handleFocus() {
        isFocusedRef.current = true
        setStatus(isDirty(inputValueRef.current, lastSavedValueRef.current) ? 'unsaved' : 'upToDate')
        startAutoSave()
        onFocusChange?.(true)
    }

    function handleBlur() {
        isFocusedRef.current = false
        stopAutoSave()
        if (isDirty(inputValueRef.current, lastSavedValueRef.current)) {
            doSave()
        } else {
            setStatus('idle')
        }
        onFocusChange?.(false)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newVal = e.target.value
        setInputValue(newVal)
        setStatus(isDirty(newVal, lastSavedValueRef.current) ? 'unsaved' : 'upToDate')
    }

    return {
        inputValue,
        status,
        handlers: {
            handleFocus,
            handleBlur,
            handleChange,
            stopClickPropagation: (e: React.MouseEvent) => e.stopPropagation(),
        },
    }
}
