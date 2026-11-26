import { styled } from '@mui/material/styles'

export const DropArea = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isOver',
})<{ isOver: boolean }>(({ theme, isOver }) => [
    {
        transition: 'background-color 0.2s ease',
        backgroundColor: '#F3F4F6',
        padding: 8,
        border: '1px dashed #9CA3AF',
        borderRadius: 8,
        minHeight: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    theme.applyStyles('dark', {
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.grey[700],
    }),
    isOver && { backgroundColor: 'rgba(34, 139, 230, 0.1)' },
])
