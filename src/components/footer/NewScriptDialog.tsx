import * as React from 'react'
import Button from '@mui/material/Button'
import {
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material'
import { useUrls, useUrlsDispatch } from '../../providers/UrlsContextProvider'
import { ScriptType } from '../../types'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import MenuItem from '@mui/material/MenuItem'
import { useLastInteracted } from '../../providers/LastInteractedProvider'
import { RESERVED_URL } from '../../constants'

interface Props {
    isOpen: boolean
    scriptTye: ScriptType
    onClose : () => void
}

const NewScriptDialog = ({ isOpen, scriptTye, onClose } : Props) => {

    const { lastUrl, setLastUrl } = useLastInteracted()
    const [inputValue, setInputValue] = useState('')
    const [selectedUrl, setSelectedUrl] = React.useState(lastUrl)
    const [error, setError] = useState<string | undefined>(undefined)

    const urls = useUrls()
    const dispatch = useUrlsDispatch()

    useEffect(() => {
        if (urls && Object.keys(urls).length > 0 && lastUrl in urls) {
            setSelectedUrl(lastUrl)
        } else {
            setSelectedUrl(RESERVED_URL)
        }
    }, [urls, lastUrl])

    const handleSelect = (event: SelectChangeEvent) => {
        setSelectedUrl(event.target.value as string)
        setLastUrl(event.target.value as string)
    }

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setInputValue(value)
        setError(value.trim() === '' ? 'Title cannot be empty' : undefined)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const value = (formData.get('newScript') as string).trim()

        if (value === '') {
            setError('Title cannot be empty')
            return
        }

        const fistContainer = selectedUrl in urls ? selectedUrl : Object.keys(urls).at(0)
        if (!fistContainer) {
            console.error('No container found to add the script to.')
            return
        }

        dispatch({ name: 'scriptAdd', containerId: fistContainer, type: scriptTye, title: value })
        handleClose()
    }

    const handleClose = () => {
        onClose()
        setInputValue('')
        setError(undefined)
    }

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth={'md'} fullWidth={true} disableScrollLock={true}>
            <DialogTitle>New {scriptTye.toUpperCase()} {scriptTye === 'js' ? 'Script' : 'Style'}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} id="newScriptForm">
                    <TextField
                        autoFocus
                        required={true}
                        margin="dense"
                        id="newScript"
                        name="newScript"
                        value={inputValue}
                        label={!error ? 'Title' : error}
                        type="text"
                        fullWidth
                        onChange={handleChange}
                        variant="standard"
                        error={!!error}
                    />
                    <FormControl fullWidth variant="standard" sx={{ mt: 3 }}>
                        <InputLabel id="save-script-under-url">Save under URL</InputLabel>
                        <Select
                            labelId="save-script-under-url"
                            id="save-script-under-url"
                            value={selectedUrl}
                            label="Save under URL"
                            onChange={handleSelect}
                        >
                            {urls && Object.keys(urls).map((url) => (
                                <MenuItem key={url} value={url}>{url}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="secondary" onClick={handleClose} startIcon={<CloseIcon/>}>Cancel</Button>
                <Button
                    variant="outlined"
                    disabled={!!error || inputValue.trim() === ''}
                    type="submit"
                    form="newScriptForm"
                    startIcon={<AddIcon/>}
                >Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewScriptDialog
