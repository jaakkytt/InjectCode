import React from 'react'
import { SxProps, Theme } from '@mui/material'

export const containerSx: SxProps<Theme> = {
    position: 'relative',
    width: 16,
    height: 16,
    display: 'inline-block',
}

export const fadeStyle: React.CSSProperties = { position: 'absolute', top: 0, left: 0 }

export const iconWrapperSx: SxProps<Theme> = {
    width: 16,
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
}

export const svgIconSx: SxProps<Theme> = { fontSize: 16 }
