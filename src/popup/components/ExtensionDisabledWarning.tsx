import SettingsIcon from '@mui/icons-material/Settings'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import React from 'react'

const ExtensionDisabledWarning = () => {

    const openSettings = () => {
        chrome.runtime.openOptionsPage()
    }

    return (
        <Card sx={{ width: 450, marginTop: '80px', marginBottom: '80px', marginLeft: 'auto', marginRight: 'auto' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Please finish the extension setup
                </Typography>
                <Typography variant="body2">
                    InjectCode needs "Allow User Scripts" turned on in order to work.
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={openSettings} startIcon={<SettingsIcon />}>Open settings</Button>
            </CardActions>
        </Card>
    )
}

export default ExtensionDisabledWarning
