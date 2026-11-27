import CssIcon from '@mui/icons-material/Css'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import JavascriptIcon from '@mui/icons-material/Javascript'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Fade, IconButton } from '@mui/material'

import { SHARED_CODE } from '../../../../shared/constants'
import ConfirmDeleteButton from '../../ConfirmDeleteButton'
import TutorialTooltip from '../../TutorialTooltip'
import AccordionBody from '../AccordionBody'
import AccordionTitle from '../AccordionTitle'
import RunModeToggle from '../RunModeToggle'
import { useScriptAccordionBehavior } from './ScriptAccordion.behavior'
import { Props } from './ScriptAccordion.types'
import {
    accordionDetailsSx,
    AccordionSummary,
    accordionSx,
    deleteButtonWrapperSx,
    dragHandleButtonStyle,
    dragHandleWrapperStyle,
    expandIconSx,
    headerRowSx,
    rootStyle,
    TypeIconOverlay,
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
        restoreAnchorRef,
        handlers,
    } = useScriptAccordionBehavior({ item, parentId })

    const isExpanded = expandedPanel === item.id

    return (
        <div
            ref={setNodeRef}
            style={rootStyle(transform, transition, isDragging)}
        >
            <Accordion
                expanded={!isDragging && isExpanded} onChange={onAccordionChange(item.id)}
                sx={accordionSx}
                slotProps={{
                    transition: { unmountOnExit: true },
                }}
            >
                <AccordionSummary
                    ref={restoreAnchorRef}
                    runMode={item.runMode}
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
                            onChange={handlers.titleChange}
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
                                onModeChange={handlers.runModeChange}
                                warning={contentFocused && item.runMode === 'always'}
                            />
                        </Typography>
                        <Typography
                            component="span"
                            onClick={handlers.stopClickPropagation}
                            sx={deleteButtonWrapperSx(isExpanded)}
                        >
                            <ConfirmDeleteButton
                                onConfirm={handlers.remove}
                                placement='top'
                                showDeleteTooltip={true}
                            />
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={accordionDetailsSx}>
                    <AccordionBody
                        scriptId={item.id}
                        urlBlockId={parentId}
                        value={item.content}
                        language={item.type === 'css' ? 'css' : 'javascript'}
                        onChange={handlers.contentChange}
                        onFocusChange={handlers.setContentFocused}
                    />
                </AccordionDetails>
            </Accordion>
        </div>
    )
}
