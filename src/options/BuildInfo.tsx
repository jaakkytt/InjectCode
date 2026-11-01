import * as React from 'react'
import Typography from '@mui/material/Typography'

export default function BuildInfo() {
    const builtAt = new Date(__BUILD_TIME__)
    const builtLabel = Number.isNaN(builtAt.getTime()) ? __BUILD_TIME__ : builtAt.toLocaleString()
    const { version, version_name } = chrome.runtime.getManifest()

    return (
        <Typography
            component="div"
            align="center"
            sx={{ fontSize: 10, color: 'text.disabled', py: 0.5 }}
        >
            Version {version_name ?? version}, built {builtLabel}
        </Typography>
    )
}
