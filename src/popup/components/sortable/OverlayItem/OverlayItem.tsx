import CssIcon from '@mui/icons-material/Css'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import JavascriptIcon from '@mui/icons-material/Javascript'
import { IconButton } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'

import RunModeToggle from '../RunModeToggle'
import { Props } from './OverlayItem.types'
import {
    AccordionSummary,
    dragHandleButtonStyle,
    dragHandleWrapperStyle,
    headerRowSx,
    rootStyle,
    titleSx,
    TypeIconOverlay,
} from './OverlayItem.styles'

// eslint-disable-next-line no-empty-function
function handleModeChangeNoop() {}

export const OverlayItem = React.forwardRef<HTMLDivElement, Props>(
    ({ item, isExpanded, isDragging, ...props }, ref) => {
        return (
            <div ref={ref} {...props} style={rootStyle(isDragging)}>
                <Accordion expanded={isDragging ? false : isExpanded}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${item.id}-content`}
                        id={`${item.id}-header`}
                    >
                        <Box sx={headerRowSx}>
                            <TypeIconOverlay>{ item.type === 'js' ? <JavascriptIcon /> : <CssIcon /> }</TypeIconOverlay>
                            <Typography
                                component="span"
                                style={dragHandleWrapperStyle(isDragging)}
                                color="primary"
                            >
                                <IconButton
                                    component="span"
                                    color="primary"
                                    aria-label="drag"
                                    style={dragHandleButtonStyle}
                                >
                                    <DragHandleIcon />
                                </IconButton>
                            </Typography>
                            <Typography component="span" sx={titleSx}>
                                {item.title}
                            </Typography>
                            <Typography component="span">
                                <RunModeToggle mode={item.runMode} onModeChange={handleModeChangeNoop} />
                            </Typography>
                        </Box>
                    </AccordionSummary>
                </Accordion>
            </div>
        )
    },
)
