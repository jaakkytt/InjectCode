import React from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import Typography from '@mui/material/Typography'
import { AccordionItemData } from './types'
import { IconButton, Switch } from '@mui/material'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'

export const OverlayItem = React.forwardRef<HTMLDivElement, { item: AccordionItemData, isExpanded: boolean, isDragging?: boolean }>(
    ({ item, isExpanded, isDragging, ...props }, ref) => {
        return (
            <div ref={ref} {...props} style={{ opacity: isDragging ? 0.5 : 1 }}>
                <Accordion expanded={isDragging ? false : isExpanded}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${item.id}-content`}
                        id={`${item.id}-header`}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography
                                component="span"
                                style={{ cursor: isDragging ? 'grabbing' : 'grab', marginRight: 8 }}
                                color="primary"
                            >
                                <IconButton component="span" color="primary" aria-label="drag" style={{ cursor: 'grab' }}>
                                    <DragHandleIcon />
                                </IconButton>
                            </Typography>
                            <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                                {item.title}
                            </Typography>
                            <Typography component="span">
                                <IconButton component="span" color="primary" aria-label="play">
                                    <PlayCircleOutlineIcon />
                                </IconButton>
                            </Typography>
                            <Typography component="span">
                                <Switch checked={item.active} />
                            </Typography>
                        </Box>
                    </AccordionSummary>
                </Accordion>
            </div>
        )
    },
)
