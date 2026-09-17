import { SxProps, Theme } from '@mui/material'

export function buttonSx(active: boolean): SxProps<Theme> {
    return {
        opacity: active ? 1 : 0.5,
        cursor: active ? 'default' : 'pointer',
        background: 'none',
    }
}
