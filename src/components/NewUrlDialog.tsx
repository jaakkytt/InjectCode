import * as React from 'react'
import Button from '@mui/material/Button'
import {
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material'
import { useUrlsDispatch } from '../providers/UrlsContextProvider'
import { useEffect, useState } from 'react'
import { useExistingUrls } from '../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../domain/urlPatternValidator'
import { urlCharacterFilter } from '../domain/urlCharacterFilter'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { useCurrentUrl } from '../providers/CurrentUrlProvider'
import { useTab } from '../providers/TabProvider'
import { TabIndex } from '../types'
import { matchPattern } from 'browser-extension-url-match'
import { MATCH_PATTERN_DOCS } from '../constants'
import { useLastInteracted } from '../providers/LastInteractedProvider'

interface Props {
    isOpen: boolean
    onClose : () => void
}

const getOriginPattern = (url: URL) : string => {
    let origin = url.origin
    if (url.port && origin.endsWith(url.port)) {
        origin = origin.slice(0, -url.port.length - 1)
    }
    return `${origin}/*`
}

const NewUrlDialog = ({ isOpen, onClose } : Props) => {

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

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = urlCharacterFilter(event.target.value).trim()
        setInputValue(value)
        if (value === '' && placeholder) {
            value = placeholder
        }

        setError(await urlPatternValidator(value, existingUrls))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
            const matcher = matchPattern(value)
            if (!matcher.valid || !matcher.match(currentUrl.href)) {
                setTabIndex(TabIndex.All)
            }
        }
    }

    const handleClose = () => {
        onClose()
        setInputValue('')
        setError(undefined)
    }

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth={'md'} fullWidth={true} disableScrollLock={true}>
            <DialogTitle>New URL Match Pattern</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Must follow the format specified in the <a href={MATCH_PATTERN_DOCS} target="_blank">
                    Chrome Extensions Docs</a>.
                </DialogContentText>
                <form onSubmit={handleSubmit} id="newUrlForm">
                    <TextField
                        autoFocus
                        required={!placeholder}
                        margin="dense"
                        id="newUrl"
                        name="newUrl"
                        label={error}
                        value={inputValue}
                        placeholder={placeholder}
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        error={!!error}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="secondary" onClick={handleClose} startIcon={<CloseIcon/>}>Cancel</Button>
                <Button
                    variant="outlined"
                    disabled={!!error || inputValue.trim() === '' && !placeholder}
                    type="submit"
                    form="newUrlForm"
                    startIcon={<AddIcon/>}
                >Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewUrlDialog
