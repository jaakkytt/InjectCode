import React from 'react'
import { styled } from '@mui/material'
import { SxProps, Theme } from '@mui/material'
import MuiAccordionSummary, { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary'

export const AccordionSummary = styled((props: AccordionSummaryProps) =>
    React.createElement(MuiAccordionSummary, props),
)(() => ({
    [`&.${accordionSummaryClasses.expanded}`]: {
        minHeight: 48,
    },
    [`& .${accordionSummaryClasses.content}`]: {
        margin: '10px 0',
    },
    [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
        margin: '10px 0',
    },
}))

export const accordionStyle: React.CSSProperties = { flex: 1 }

export const headerRowSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: '0 8px 0 0',
}

export const titleIconWrapperSx: SxProps<Theme> = { marginRight: '8px' }

export const detailsSx: SxProps<Theme> = { padding: '0 8px 8px' }
