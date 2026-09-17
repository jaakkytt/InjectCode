import React from 'react'
import { SxProps, Theme } from '@mui/material'

export {
    AccordionSummary,
    TypeIconOverlay,
    headerRowSx,
    dragHandleButtonStyle,
} from '../ScriptAccordion/ScriptAccordion.styles'

export function rootStyle(isDragging: boolean | undefined): React.CSSProperties {
    return { opacity: isDragging ? 0.5 : 1 }
}

export function dragHandleWrapperStyle(isDragging: boolean | undefined): React.CSSProperties {
    return { cursor: isDragging ? 'grabbing' : 'grab', marginRight: 8 }
}

export const titleSx: SxProps<Theme> = { flexGrow: 1, textWrap: 'auto' }
