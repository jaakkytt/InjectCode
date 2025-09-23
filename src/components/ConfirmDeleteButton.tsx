import { Fade, IconButton } from '@mui/material'
import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import TutorialTooltip from './TutorialTooltip'

interface Props {
    onConfirm: () => void,
    placement: 'left' | 'top',
    showDeleteTooltip: boolean,
}

const ConfirmDeleteButton = ({ onConfirm, showDeleteTooltip, placement } : Props) => {

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
        <TutorialTooltip
            open={showDeleteTooltip ? undefined : isConfirming}
            title={showDeleteTooltip ? (isConfirming ? 'Confirm' : 'Delete') : 'Confirm'}
            placement={placement}
            slots={{ transition: Fade }}
            arrow
        >
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
        </TutorialTooltip>
    )
}

export default ConfirmDeleteButton
