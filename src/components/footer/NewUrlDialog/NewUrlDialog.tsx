import React from 'react'
import Button from '@mui/material/Button'
import {
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
    TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { MATCH_PATTERN_DOCS } from '../../../constants'
import { Props } from './NewUrlDialog.types'
import { useNewUrlDialogBehavior } from './NewUrlDialog.behavior'
import { dialogSx } from './NewUrlDialog.styles'

const NewUrlDialog = ({ isOpen, onClose }: Props) => {
    const { inputValue, placeholder, error, submitDisabled, handlers } = useNewUrlDialogBehavior({ onClose })

    return (
        <Dialog
            open={isOpen}
            onClose={handlers.handleClose}
            maxWidth={'md'}
            fullWidth={true}
            disableScrollLock={true}
            sx={dialogSx}
        >
            <DialogTitle>New URL Match Pattern</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Must follow the format specified in the{' '}
                    <Link href={MATCH_PATTERN_DOCS} target="_blank" rel="noreferrer" underline="hover">
                        Chrome Extensions Docs
                    </Link>.
                </DialogContentText>
                <form onSubmit={handlers.handleSubmit} id="newUrlForm">
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
                        onChange={handlers.handleChange}
                        error={!!error}
                    />
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
                    form="newUrlForm"
                    startIcon={<AddIcon/>}
                >Add</Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewUrlDialog
