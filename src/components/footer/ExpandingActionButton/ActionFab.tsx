import React from 'react'
import { Fab, SvgIconProps } from '@mui/material'

interface Props {
    icon: React.ComponentType<SvgIconProps>
    label: string
    onClick: () => void
}

const ActionFab = ({ icon: Icon, label, onClick }: Props) => (
    <Fab
        variant="circular"
        size="small"
        color="primary"
        onClick={onClick}
    >
        <span style={{ display: 'none' }}>{label}</span>
        <Icon sx={{ ml: 0 }} />
    </Fab>
)

export default ActionFab
