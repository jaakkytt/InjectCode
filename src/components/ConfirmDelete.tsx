import { Button, IconButton } from '@mui/material'
import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

interface Props {
    onConfirm: () => void,
    hasText: boolean
}

const ConfirmDelete = ({ onConfirm, hasText } : Props) => {

    const [isConfirming, setIsConfirming] = useState(false)

    const handleInitialClick = () => {
        setIsConfirming(true)
    }

    const handleConfirmClick = () => {
        onConfirm()
        setIsConfirming(false)
    }

    const handleMouseLeave = () => {
        setIsConfirming(false)
    }

    return (
        hasText ? (
            <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                color={isConfirming ? 'warning' : 'primary'}
                sx={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
                onClick={isConfirming ? handleConfirmClick : handleInitialClick}
                onMouseLeave={handleMouseLeave}
            >
                <span style={{ minWidth: '9ch' }}>{isConfirming ? 'Confirm' : 'Delete'}</span>
            </Button>
        ) : (
            <IconButton
                color={isConfirming ? 'warning' : 'primary'}
                sx={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
                onClick={(e) => {
                    if (isConfirming) {
                        handleConfirmClick()
                    } else {
                        handleInitialClick()
                    }
                    e.stopPropagation()
                }}
                onMouseLeave={handleMouseLeave}
            >
                <DeleteIcon />
            </IconButton>
        )
    )
}

export default ConfirmDelete
