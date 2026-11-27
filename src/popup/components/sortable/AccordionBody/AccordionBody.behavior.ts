import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useEditorRestore } from '../../../hooks/useEditorRestore'
import { useEditorSettings } from '../../../providers/EditorSettingsProvider'
import { Props, Status } from './AccordionBody.types'

type EditorSource = { value: string; revision: number }

export function useAccordionBodyBehavior(
    { scriptId, urlBlockId, value, onChange, onFocusChange }: Omit<Props, 'language'>,
) {

    const [editorSource, setEditorSource] = useState<EditorSource>({ value, revision: 0 })
    const [status, setStatus] = useState<Status>('idle')
    const editorSettings = useEditorSettings()

    const lastSavedValueRef = useRef<string>(value)
    const inputValueRef = useRef<string>(value)
    const isFocusedRef = useRef<boolean>(false)
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const editorRestore = useEditorRestore({ scriptId, urlBlockId })

    useEffect(() => {
        if (value === lastSavedValueRef.current) {
            return
        }

        lastSavedValueRef.current = value
        inputValueRef.current = value

        setEditorSource(prev => ({
            value,
            revision: prev.value === value ? prev.revision + 1 : prev.revision,
        }))
    }, [value])

    useEffect(() => () => {
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current)
        }
    }, [])

    const doSave = useCallback(() => {
        if (isDirty(inputValueRef.current, lastSavedValueRef.current)) {
            const trimmed = inputValueRef.current.trim()
            lastSavedValueRef.current = trimmed

            onChange(trimmed)
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

    function focus() {
        isFocusedRef.current = true
        setStatus(isDirty(inputValueRef.current, lastSavedValueRef.current) ? 'unsaved' : 'upToDate')
        startAutoSave()
        onFocusChange?.(true)
        editorRestore.focus()
    }

    function blur() {
        isFocusedRef.current = false
        stopAutoSave()

        if (isDirty(inputValueRef.current, lastSavedValueRef.current)) {
            doSave()
        } else {
            setStatus('idle')
        }

        onFocusChange?.(false)
        editorRestore.blur()
    }

    function update(newVal: string) {
        inputValueRef.current = newVal
        if (isFocusedRef.current) {
            setStatus(isDirty(newVal, lastSavedValueRef.current) ? 'unsaved' : 'upToDate')
        }
    }

    return {
        editorSource,
        status,
        editorSettings,
        editorRef: editorRestore.editorRef,
        handlers: {
            blur,
            focus,
            update,
            stopClickPropagation: (e: React.MouseEvent) => e.stopPropagation(),
        },
    }
}

function isDirty(current: string, lastSaved: string): boolean {
    return current.trim() !== lastSaved.trim()
}
