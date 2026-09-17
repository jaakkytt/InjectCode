import React from 'react'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloudDotsIcon from '../../../CloudDotsIcon'
import { Props } from './StatusIcon.types'
import { containerSx, fadeStyle, iconWrapperSx } from './StatusIcon.styles'

const icons = {
    idle: <CloudDoneIcon />,
    upToDate: <CloudDoneIcon />,
    unsaved: <CloudDotsIcon />,
    saved: <CloudUploadIcon />,
}

export default function StatusIcon({ status }: Props) {
    return (
        <Box sx={containerSx}>
            { (Object.keys(icons) as (keyof typeof icons)[]).map((key) => (
                <Fade
                    key={key}
                    in={status === key}
                    timeout={200}
                    style={fadeStyle}
                    unmountOnExit
                >
                    <Box component="span" sx={iconWrapperSx}>
                        {icons[key]}
                    </Box>
                </Fade>
            )) }
        </Box>
    )
}
