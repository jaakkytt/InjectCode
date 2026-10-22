import React, { ReactNode } from 'react'
import { Link } from '@mui/material'
import { openExtensionSettings } from '../../service/extensionSetup'

export interface Props {
    children: ReactNode
}

const ExtensionSettingsLink = ({ children }: Props) => (
    <Link
        component="button"
        underline="hover"
        title="opens in new tab"
        sx={{ verticalAlign: 'baseline' }}
        onClick={() => openExtensionSettings()}
    >
        {children}
    </Link>
)

export default ExtensionSettingsLink
