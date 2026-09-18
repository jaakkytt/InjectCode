import React from 'react'
import Accordion from '@mui/material/Accordion'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import Box from '@mui/material/Box'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import JavascriptIcon from '@mui/icons-material/Javascript'
import CssIcon from '@mui/icons-material/Css'
import Typography from '@mui/material/Typography'
import AccordionDetails from '@mui/material/AccordionDetails'
import { Fade, IconButton } from '@mui/material'
import AccordionTitle from '../AccordionTitle'
import AccordionBody from '../AccordionBody'
import ConfirmDeleteButton from '../../ConfirmDeleteButton'
import TutorialTooltip from '../../TutorialTooltip'
import { SHARED_CODE } from '../../../constants'
import RunModeToggle from '../RunModeToggle'
import { Props } from './ScriptAccordion.types'
import { useScriptAccordionBehavior } from './ScriptAccordion.behavior'
import {
    AccordionSummary,
    TypeIconOverlay,
    expandIconSx,
    accordionSx,
    accordionDetailsSx,
    headerRowSx,
    dragHandleWrapperStyle,
    dragHandleButtonStyle,
    rootStyle,
    deleteButtonWrapperSx,
} from './ScriptAccordion.styles'

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
        play,
        contentFocused,
        handlers,
    } = useScriptAccordionBehavior({ item, parentId })

    const isExpanded = expandedPanel === item.id

    return (
        <div
            ref={setNodeRef}
            style={rootStyle(transform, transition, isDragging, item.runMode)}
        >
            <Accordion
                expanded={!isDragging && isExpanded} onChange={onAccordionChange(item.id)}
                sx={accordionSx}
                slotProps={{
                    transition: { unmountOnExit: true },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={expandIconSx} color="primary" />}
                    aria-controls={`${item.id}-content`}
                    id={`${item.id}-header`}
                    component="div"
                >
                    <Box sx={headerRowSx}>
                        <TypeIconOverlay>{ item.type === 'js' ? <JavascriptIcon /> : <CssIcon /> }</TypeIconOverlay>
                        <AccordionTitle
                            value={item.title}
                            allowEditing={isExpanded}
                            onChange={handlers.handleTitleChange}
                        >
                            <Typography
                                component="span"
                                {...attributes}
                                {...listeners}
                                style={dragHandleWrapperStyle}
                                color="primary"
                                onClick={handlers.stopClickPropagation}
                            >
                                <IconButton
                                    color="primary"
                                    component="span"
                                    aria-label="drag"
                                    style={dragHandleButtonStyle}
                                >
                                    <DragHandleIcon />
                                </IconButton>
                            </Typography>
                        </AccordionTitle>
                        {parentId !== SHARED_CODE && (
                            <Typography
                                component="span"
                                onClick={handlers.stopClickPropagation}
                            >
                                <TutorialTooltip title="Run" placement="top" slots={{ transition: Fade }} arrow>
                                    <IconButton
                                        component="span"
                                        color="primary"
                                        aria-label="play"
                                        {...play.buttonProps}
                                    >
                                        <PlayCircleOutlineIcon />
                                    </IconButton>
                                </TutorialTooltip>
                            </Typography>
                        )}
                        <Typography component="span">
                            <RunModeToggle
                                mode={item.runMode}
                                onModeChange={handlers.handleRunModeChange}
                                warning={contentFocused && item.runMode === 'always'}
                            />
                        </Typography>
                        <Typography
                            component="span"
                            onClick={handlers.stopClickPropagation}
                            sx={deleteButtonWrapperSx(isExpanded)}
                        >
                            <ConfirmDeleteButton
                                onConfirm={handlers.handleDelete}
                                placement='top'
                                showDeleteTooltip={true}
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={accordionDetailsSx}>
                    <AccordionBody
                        value={item.content}
                        language={item.type === 'css' ? 'css' : 'javascript'}
                        onChange={handlers.handleContentChange}
                        onFocusChange={handlers.setContentFocused}
                    />
                </AccordionDetails>
            </Accordion>
        </div>
    )
}
