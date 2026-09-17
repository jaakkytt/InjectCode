import React, { useEffect, useState } from 'react'
import { useUrlsDispatch } from '../../../providers/urlsContext'
import { useExistingUrls } from '../../../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../../../service/urlPatternValidator'
import { urlCharacterFilter } from '../../../service/urlCharacterFilter'
import { useCurrentUrl } from '../../../providers/CurrentUrlProvider'
import { useTab } from '../../../providers/TabProvider'
import { TabIndex } from '../../../types'
import { useLastInteracted } from '../../../providers/LastInteractedProvider'
import { urlPatternMatcher } from '../../../service/urlPatternMatcher'
import { Props } from './NewUrlDialog.types'

function getOriginPattern(url: URL): string {
    let origin = url.origin
    if (url.port && origin.endsWith(url.port)) {
        origin = origin.slice(0, -url.port.length - 1)
    }
    return `${origin}/*`
}

export function useNewUrlDialogBehavior({ onClose }: Pick<Props, 'onClose'>) {
    const [inputValue, setInputValue] = useState('')
    const [placeholder, setPlaceholder] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const { tabIndex, setTabIndex } = useTab()

    const currentUrl = useCurrentUrl()
    const urlsDispatch = useUrlsDispatch()
    const existingUrls = useExistingUrls()
    const { setLastUrl } = useLastInteracted()

    useEffect(() => {
        const check = async () => {
            if (!currentUrl) {
                return undefined
            }
            const originPattern = getOriginPattern(currentUrl)
            const urlError = await urlPatternValidator(originPattern, existingUrls)
            return !urlError ? originPattern : undefined
        }
        check().then(setPlaceholder)
    }, [existingUrls, currentUrl])

    function isSubmitDisabled() {
        return !!error || (inputValue.trim() === '' && !placeholder)
    }

    function handleClose() {
        onClose()
        setInputValue('')
        setError(undefined)
    }

    async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        let value = urlCharacterFilter(event.target.value).trim()
        setInputValue(value)

        if (value === '' && placeholder) {
            value = placeholder
        }

        setError(await urlPatternValidator(value, existingUrls))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        let value = urlCharacterFilter(formData.get('newUrl') as string)

        if (value === '' && placeholder) {
            value = placeholder
        }

        const urlError = await urlPatternValidator(value, existingUrls)
        if (urlError) {
            setError(urlError)
            return
        }

        urlsDispatch({ name: 'added', id: value })
        setLastUrl(value)

        handleClose()

        if (tabIndex === TabIndex.Current && currentUrl) {
            const matcher = urlPatternMatcher(value)
            if (!matcher.valid || !matcher.match(currentUrl.href)) {
                setTabIndex(TabIndex.All)
            }
        }
    }

    return {
        inputValue,
        placeholder,
        error,
        submitDisabled: isSubmitDisabled(),
        handlers: {
            handleChange,
            handleSubmit,
            handleClose,
        },
    }
}
