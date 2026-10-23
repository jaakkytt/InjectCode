import { SxProps, Theme } from '@mui/material'

export const rootStackSx: SxProps<Theme> = {
    pl: 1,
    pt: 0,
    pr: 1,
    pb: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
}

export const leftStackSx: SxProps<Theme> = { justifyContent: 'flex-end', alignItems: 'center' }

export const scopeStackSx: SxProps<Theme> = { justifyContent: 'flex-end', alignItems: 'center' }
