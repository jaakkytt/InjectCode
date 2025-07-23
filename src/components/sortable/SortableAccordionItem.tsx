import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import Box from '@mui/material/Box'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import DeleteIcon from '@mui/icons-material/Delete'
import Typography from '@mui/material/Typography'
import AccordionDetails from '@mui/material/AccordionDetails'
import { AccordionActions, Button, IconButton, Switch } from '@mui/material'
import { AccordionItemData, OnUpdateItem } from './types'
import AccordionTitle from './AccordionTitle'

interface Props {
    item: AccordionItemData;
    expandedPanel: string | false;
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onUpdateItem: OnUpdateItem;
}

export default function SortableAccordionItem({ item, expandedPanel, onAccordionChange, onUpdateItem }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateItem(item.id, { active: event.target.checked })
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : (item.active ? 1 : 0.5),
            }}
        >
            <Accordion
                expanded={!isDragging && expandedPanel === item.id} onChange={onAccordionChange(item.id)}
                slotProps={{ transition: { unmountOnExit: true } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon style={{ marginLeft: 4 }} color="primary" />}
                    aria-controls={`${item.id}-content`}
                    id={`${item.id}-header`}
                    component="div"
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <AccordionTitle
                            value={item.title}
                            allowEditing={expandedPanel === item.id}
                            onChange={(newTitle) => onUpdateItem(item.id, { title: newTitle })}
                        >
                            <Typography
                                component="span"
                                {...attributes}
                                {...listeners}
                                style={{ cursor: 'grab', marginRight: 8 }}
                                color="primary"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconButton color="primary" component="span" aria-label="drag" style={{ cursor: 'grab' }}>
                                    <DragHandleIcon />
                                </IconButton>
                            </Typography>
                        </AccordionTitle>
                        <Typography
                            component="span"
                            style={{
                                opacity: expandedPanel === item.id ? 0 : 1,
                                visibility: expandedPanel === item.id ? 'hidden' : 'visible',
                                transition: 'all 0.1s ease-in-out',
                            }}
                        >
                            <IconButton component="span" color="primary" aria-label="play">
                                <PlayCircleOutlineIcon />
                            </IconButton>
                        </Typography>
                        <Typography
                            component="span"
                            style={{
                                opacity: expandedPanel === item.id ? 0 : 1,
                                visibility: expandedPanel === item.id ? 'hidden' : 'visible',
                                transition: 'all 0.1s ease-in-out',
                            }}
                        >
                            <Switch
                                checked={item.active}
                                onChange={handleActiveChange}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>{item.content}</Typography>
                </AccordionDetails>
                <AccordionActions>
                    <Button variant="outlined" startIcon={<PlayCircleOutlineIcon />}>
                        Run
                    </Button>
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<Switch
                            size="small"
                            checked={item.active}
                            onChange={handleActiveChange}
                            onClick={(e) => e.stopPropagation()}
                        />}
                    >
                        { item.active ? 'Enabled' : 'Disabled' }
                    </Button>
                    <Button variant="outlined" color="warning" startIcon={<DeleteIcon />}>
                        Delete
                    </Button>
                </AccordionActions>
            </Accordion>
        </div>
    )
}
