import React from 'react'
import { Link } from '@mui/material'
import { openExtensionSettings } from '../../service/extensionSetup'

const ExtensionSettingsLink = () => (
    <Link
        component="button"
        underline="hover"
        title="opens in new tab"
        sx={{ verticalAlign: 'baseline' }}
        onClick={() => openExtensionSettings()}
    >
        extension settings
    </Link>
)

export default ExtensionSettingsLink
