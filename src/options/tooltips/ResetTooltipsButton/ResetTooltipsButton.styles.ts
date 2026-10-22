import { styled } from '@mui/material/styles'

export const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
}))

export const Confirmation = styled('span')(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.success.main,
}))
