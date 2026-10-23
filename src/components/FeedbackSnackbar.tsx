import React, { useEffect, useState } from 'react'
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material'
import { useFeedback, useFeedbackDispatch } from '../providers/FeedbackProvider'
import { DEFAULT_FEEDBACK_AUTO_HIDE, readFeedbackAutoHide } from '../service/feedbackAutoHide'

const FeedbackSnackbar = () => {
    const { id, open, message, severity } = useFeedback()
    const { close } = useFeedbackDispatch()
    const [autoHide, setAutoHide] = useState(DEFAULT_FEEDBACK_AUTO_HIDE)

    useEffect(() => {
        readFeedbackAutoHide().then(setAutoHide)
    }, [])

    const hideAfterMs = autoHide[severity]

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return
        }
        close()
    }

    return (
        <Snackbar
            key={id}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={open && hideAfterMs !== 0}
            autoHideDuration={hideAfterMs}
            onClose={handleClose}
            sx={{ width: '80%' }}
        >
            <Alert onClose={() => close()} severity={severity} variant="filled" sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    )
}

export default FeedbackSnackbar
