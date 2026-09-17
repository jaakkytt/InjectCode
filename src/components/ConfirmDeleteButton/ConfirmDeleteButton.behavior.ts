import React, { useState } from 'react'
import { Props } from './ConfirmDeleteButton.types'

export function useConfirmDeleteButtonBehavior(
    { onConfirm, showDeleteTooltip }: Pick<Props, 'onConfirm' | 'showDeleteTooltip'>,
) {
    const [isConfirming, setIsConfirming] = useState(false)

    function resolveTooltipTitle(): string {
        if (!showDeleteTooltip) {
            return 'Confirm'
        }
        return isConfirming ? 'Confirm' : 'Delete'
    }

    function handleClick(e: React.MouseEvent) {
        if (isConfirming) {
            onConfirm()
            setIsConfirming(false)
        } else {
            setIsConfirming(true)
        }
        e.stopPropagation()
    }

    return {
        isConfirming,
        tooltipTitle: resolveTooltipTitle(),
        tooltipOpen: showDeleteTooltip ? undefined : isConfirming,
        handlers: {
            handleClick,
            handleMouseLeave: () => setIsConfirming(false),
        },
    }
}
