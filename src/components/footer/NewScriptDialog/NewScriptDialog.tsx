import React from 'react'
import Button from '@mui/material/Button'
import {
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    InputLabel,
    Select,
    TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import MenuItem from '@mui/material/MenuItem'
import { Props } from './NewScriptDialog.types'
import { useNewScriptDialogBehavior } from './NewScriptDialog.behavior'
import { dialogSx, formControlSx } from './NewScriptDialog.styles'

const NewScriptDialog = ({ isOpen, scriptType, onClose }: Props) => {
    const {
        urls,
        inputValue,
        selectedUrl,
        error,
        submitDisabled,
        handlers,
    } = useNewScriptDialogBehavior({ scriptType, onClose })

    return (
        <Dialog
            open={isOpen}
            onClose={handlers.handleClose}
            maxWidth={'md'}
            fullWidth={true}
            disableScrollLock={true}
            sx={dialogSx}
        >
            <DialogTitle>New {scriptType.toUpperCase()} {scriptType === 'js' ? 'Script' : 'Style'}</DialogTitle>
            <DialogContent>
                <form onSubmit={handlers.handleSubmit} id="newScriptForm">
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
                        onChange={handlers.handleChange}
                        variant="standard"
                        error={!!error}
                    />
                    <FormControl fullWidth variant="standard" sx={formControlSx}>
                        <InputLabel id="save-script-under-url">Save under URL</InputLabel>
                        <Select
                            labelId="save-script-under-url"
                            id="save-script-under-url"
                            value={selectedUrl}
                            label="Save under URL"
                            onChange={handlers.handleSelect}
                        >
                            {urls && Object.keys(urls).map((url) => (
                                <MenuItem key={url} value={url}>{url}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handlers.handleClose}
                    startIcon={<CloseIcon/>}
                >Cancel</Button>
                <Button
                    variant="outlined"
                    disabled={submitDisabled}
                    type="submit"
                    form="newScriptForm"
                    startIcon={<AddIcon/>}
                >Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewScriptDialog
