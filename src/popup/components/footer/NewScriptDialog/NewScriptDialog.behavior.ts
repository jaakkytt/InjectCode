import React, { useEffect, useState } from 'react'
import { SelectChangeEvent } from '@mui/material'
import { useUrls, useUrlsDispatch } from '../../../providers/urlsContext'
import { useLastInteracted } from '../../../providers/LastInteractedProvider'
import { SHARED_CODE } from '../../../../shared/constants'
import { Props } from './NewScriptDialog.types'

export function useNewScriptDialogBehavior({ scriptType, onClose }: Pick<Props, 'scriptType' | 'onClose'>) {
    const { lastUrl, setLastUrl } = useLastInteracted()
    const [inputValue, setInputValue] = useState('')
    const [selectedUrl, setSelectedUrl] = useState(lastUrl)
    const [error, setError] = useState<string | undefined>(undefined)

    const urls = useUrls()
    const dispatch = useUrlsDispatch()

    useEffect(() => {
        if (urls && Object.keys(urls).length > 0 && lastUrl in urls) {
            setSelectedUrl(lastUrl)
        } else {
            setSelectedUrl(SHARED_CODE)
        }
    }, [urls, lastUrl])

    function resolveContainer(): string | undefined {
        return selectedUrl in urls ? selectedUrl : Object.keys(urls).at(0)
    }

    function isSubmitDisabled() {
        return !!error || inputValue.trim() === ''
    }

    function close() {
        onClose()
        setInputValue('')
        setError(undefined)
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const value = (formData.get('newScript') as string).trim()

        if (value === '') {
            setError('Title cannot be empty')
            return
        }

        const firstContainer = resolveContainer()
        if (!firstContainer) {
            console.error('No container found to add the script to.')
            return
        }

        dispatch({ name: 'scriptAdd', containerId: firstContainer, type: scriptType, title: value })
        close()
    }

    return {
        urls,
        inputValue,
        selectedUrl,
        error,
        submitDisabled: isSubmitDisabled(),
        handlers: {
            close,
            submit,
            change: async (event: React.ChangeEvent<HTMLInputElement>) => {
                const value = event.target.value
                setInputValue(value)
                setError(value.trim() === '' ? 'Title cannot be empty' : undefined)
            },
            select: (event: SelectChangeEvent) => {
                setSelectedUrl(event.target.value as string)
                setLastUrl(event.target.value as string)
            },
        },
    }
}
