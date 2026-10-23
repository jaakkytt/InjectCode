import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StatusSlot = styled(Box)(() => ({
    position: 'absolute',
    top: 0,
    right: '3px',
    zIndex: 2,
    display: 'flex',
    pointerEvents: 'none',
    color: 'rgba(0, 0, 0, 0.5)',
}))

export const EditorFrame = styled(Box)(({ theme }) => ({
    position: 'relative',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
    },
    [`&:focus-within ${StatusSlot}`]: {
        color: theme.palette.primary.main,
    },
    '& .prism-code-editor': {
        minHeight: '7em',
        maxHeight: '60vh',
        fontSize: '0.8125rem',
    },
}))
