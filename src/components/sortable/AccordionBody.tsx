import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Fade, TextField } from '@mui/material'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Box from '@mui/material/Box'
import './AccordionBody.css'
import CloudDotsIcon from '../CloudDotsIcon'

interface Props {
    value: string
    onChange: (newValue: string) => void
}

type Status = 'idle' | 'upToDate' | 'unsaved' | 'saved'

const icons = {
    idle: <CloudDoneIcon />,
    upToDate: <CloudDoneIcon />,
    unsaved: <CloudDotsIcon />,
    saved: <CloudUploadIcon />,
}

function StatusIcon({ status }: { status: keyof typeof icons }) {
    return (
        <Box
            sx={{
                position: 'relative',
                width: 24,
                height: 24,
                display: 'inline-block',
            }}
        >
            { (Object.keys(icons) as (keyof typeof icons)[]).map((key) => (
                <Fade
                    key={key}
                    in={status === key}
                    timeout={200}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    unmountOnExit
                >
                    <Box
                        component="span"
                        sx={{
                            width: 24,
                            height: 24,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icons[key]}
                    </Box>
                </Fade>
            )) }
        </Box>
    )
}

export default function AccordionBody({ value, onChange }: Props) {
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
        const trimmed = inputValueRef.current.trim()
        if (trimmed !== lastSavedValueRef.current.trim()) {
            onChange(trimmed)
            lastSavedValueRef.current = trimmed
            setStatus('saved')
            setTimeout(() => {
                setStatus(isFocusedRef.current ? 'upToDate' : 'idle')
            }, 1000)
        }
    }, [onChange])

    const startAutoSave = () => {
        if (!autoSaveTimerRef.current) {
            autoSaveTimerRef.current = setInterval(doSave, 5000)
        }
    }

    const stopAutoSave = () => {
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current)
            autoSaveTimerRef.current = null
        }
    }

    const handleFocus = () => {
        isFocusedRef.current = true
        const trimmed = inputValueRef.current.trim()
        setStatus(trimmed === lastSavedValueRef.current.trim() ? 'upToDate' : 'unsaved')
        startAutoSave()
    }

    const handleBlur = () => {
        isFocusedRef.current = false
        stopAutoSave()
        const trimmed = inputValueRef.current.trim()
        if (trimmed !== lastSavedValueRef.current.trim()) {
            doSave()
        } else {
            setStatus('idle')
        }
    }

    return (
        <TextField
            className="codeTextField"
            fullWidth
            multiline
            minRows={4}
            label={<StatusIcon status={status} />}
            value={inputValue}
            onChange={(e) => {
                const newVal = e.target.value
                setInputValue(newVal)
                const trimmed = newVal.trim()
                setStatus(trimmed === lastSavedValueRef.current.trim() ? 'upToDate' : 'unsaved')
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
        />
    )
}
