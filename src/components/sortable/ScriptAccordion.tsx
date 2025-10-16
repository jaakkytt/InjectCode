import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Accordion from '@mui/material/Accordion'
import { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import Box from '@mui/material/Box'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import JavascriptIcon from '@mui/icons-material/Javascript'
import CssIcon from '@mui/icons-material/Css'
import Typography from '@mui/material/Typography'
import AccordionDetails from '@mui/material/AccordionDetails'
import { Fade, IconButton, styled, Switch } from '@mui/material'
import AccordionTitle from './AccordionTitle'
import AccordionBody from './AccordionBody'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import ConfirmDeleteButton from '../ConfirmDeleteButton'
import { AccordionItemData } from '../../types'
import TutorialTooltip from '../TutorialTooltip'
import { useScriptsDispatch } from '../../providers/ScriptsContextProvider'
import { usePlayControls } from '../usePlayControls'
import { SHARED_CODE } from '../../constants'

interface Props {
    item: AccordionItemData;
    parentId: string;
    expandedPanel: string | false;
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

export default function ScriptAccordion(
    { item, parentId, expandedPanel, onAccordionChange }: Props,
) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const dispatch = useScriptsDispatch()
    const play = usePlayControls({ [parentId]: [item] })

    const AccordionSummary = styled((props: AccordionSummaryProps) => (
        <MuiAccordionSummary {...props} />
    ))(() => ({
        [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
            margin: 0,
        },
    }))

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
                slotProps={{
                    transition: { unmountOnExit: true },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon style={{ marginLeft: 4 }} color="primary" />}
                    aria-controls={`${item.id}-content`}
                    id={`${item.id}-header`}
                    component="div"
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span style={{
                            display: 'block',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            opacity: 0.3,
                        }}>{ item.type === 'js' ? <JavascriptIcon /> : <CssIcon /> }</span>
                        <AccordionTitle
                            value={item.title}
                            allowEditing={expandedPanel === item.id}
                            onChange={(newTitle) => dispatch.update(item.id, { title: newTitle })}
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
                        {parentId !== SHARED_CODE && (
                            <Typography
                                component="span"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <TutorialTooltip title="Run" placement="top" slots={{ transition: Fade }} arrow>
                                    <IconButton component="span" color="primary" aria-label="play" {...play.buttonProps}>
                                        <PlayCircleOutlineIcon />
                                    </IconButton>
                                </TutorialTooltip>
                            </Typography>
                        )}
                        <Typography component="span">
                            <TutorialTooltip title={item.active ? 'Enabled' : 'Disabled'} placement="top" slots={{ transition: Fade }} arrow>
                                <Switch
                                    checked={item.active}
                                    onChange={e => { dispatch.update(item.id, { active: e.target.checked }) }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </TutorialTooltip>
                        </Typography>
                        <Typography
                            component="span"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                opacity: expandedPanel === item.id ? 1 : 0,
                                display: expandedPanel === item.id ? 'block' : 'none',
                                transition: 'all 0.3s ease-in-out',
                            }}
                        >
                            <ConfirmDeleteButton onConfirm={ () => dispatch.remove(item.id) } placement='top' showDeleteTooltip={true} />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <AccordionBody
                        value={item.content}
                        onChange={(newContent) => dispatch.update(item.id, { content: newContent })}
                    />
                </AccordionDetails>
            </Accordion>
        </div>
    )
}
