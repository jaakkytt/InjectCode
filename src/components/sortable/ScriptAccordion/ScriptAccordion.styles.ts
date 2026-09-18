import React from 'react'
import { styled } from '@mui/material'
import { SxProps, Theme } from '@mui/material'
import MuiAccordionSummary, { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary'
import { CSS } from '@dnd-kit/utilities'
import { Transform } from '@dnd-kit/utilities'
import { ScriptRunMode } from '../../../types'

export const AccordionSummary = styled((props: AccordionSummaryProps) =>
    React.createElement(MuiAccordionSummary, props),
)(() => ({
    [`&.${accordionSummaryClasses.expanded}`]: {
        minHeight: 48,
    },
    [`& .${accordionSummaryClasses.content}`]: {
        margin: 0,
    },
    [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
        margin: 0,
    },
}))

export const TypeIconOverlay = styled('span')({
    display: 'block',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.3,
})

export const expandIconSx: SxProps<Theme> = { marginLeft: '4px' }

export const accordionSx: SxProps<Theme> = { '&.Mui-expanded': { margin: '8px 0' } }

export const accordionDetailsSx: SxProps<Theme> = { padding: '0 8px 8px' }

export const headerRowSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', width: '100%' }

export const dragHandleWrapperStyle: React.CSSProperties = { cursor: 'grab', marginRight: 8 }

export const dragHandleButtonStyle: React.CSSProperties = { cursor: 'grab' }

export function rootStyle(
    transform: Transform | null,
    transition: string | undefined,
    isDragging: boolean,
    runMode: ScriptRunMode,
): React.CSSProperties {
    return {
        transform: CSS.Transform.toString(transform),
        transition: [transition, 'opacity 200ms ease'].filter(Boolean).join(', '),
        opacity: isDragging ? 0.5 : (runMode !== 'disabled' ? 1 : 0.5),
    }
}

export function deleteButtonWrapperSx(isExpanded: boolean): SxProps<Theme> {
    return {
        opacity: isExpanded ? 1 : 0,
        display: isExpanded ? 'block' : 'none',
        transition: 'all 0.3s ease-in-out',
    }
}
