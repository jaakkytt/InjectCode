import DeleteIcon from '@mui/icons-material/Delete'
import React from 'react'
import { Fade, IconButton } from '@mui/material'

import TutorialTooltip from '../TutorialTooltip'
import { useConfirmDeleteButtonBehavior } from './ConfirmDeleteButton.behavior'
import { Props } from './ConfirmDeleteButton.types'

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
                onClick={handlers.click}
                onMouseLeave={handlers.mouseLeave}
            >
                <DeleteIcon />
            </IconButton>
        </TutorialTooltip>
    )
}

export default ConfirmDeleteButton
