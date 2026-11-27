import { Link } from '@mui/material'
import React from 'react'

import { openExtensionErrors } from '../service/extensionSetup'

const ExtensionSettingsLink = () => (
    <Link
        component="button"
        underline="hover"
        title="opens in new tab"
        sx={{ verticalAlign: 'baseline' }}
        onClick={() => openExtensionErrors()}
    >
        extension errors
    </Link>
)

export default ExtensionSettingsLink
