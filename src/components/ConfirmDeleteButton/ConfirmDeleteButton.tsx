import React from 'react'
import { Fade, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import TutorialTooltip from '../TutorialTooltip'
import { Props } from './ConfirmDeleteButton.types'
import { useConfirmDeleteButtonBehavior } from './ConfirmDeleteButton.behavior'

const ConfirmDeleteButton = ({ onConfirm, showDeleteTooltip, placement }: Props) => {
    const { isConfirming, tooltipTitle, tooltipOpen, handlers } = useConfirmDeleteButtonBehavior({
        onConfirm,
        showDeleteTooltip,
    })

    return (
        <TutorialTooltip
            open={tooltipOpen}
            title={tooltipTitle}
            placement={placement}
            slots={{ transition: Fade }}
            arrow
        >
            <IconButton
                color={isConfirming ? 'warning' : 'primary'}
                sx={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
                onClick={handlers.handleClick}
                onMouseLeave={handlers.handleMouseLeave}
            >
                <DeleteIcon />
            </IconButton>
        </TutorialTooltip>
    )
}

export default ConfirmDeleteButton
