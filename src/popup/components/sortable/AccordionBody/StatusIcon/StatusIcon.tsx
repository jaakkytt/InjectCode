import React from 'react'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloudDotsIcon from '../../../CloudDotsIcon'
import { Props } from './StatusIcon.types'
import { containerSx, fadeStyle, iconWrapperSx, svgIconSx } from './StatusIcon.styles'

const icons = {
    idle: <CloudDoneIcon sx={svgIconSx} />,
    upToDate: <CloudDoneIcon sx={svgIconSx} />,
    unsaved: <CloudDotsIcon width="16" height="16" />,
    saved: <CloudUploadIcon sx={svgIconSx} />,
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
