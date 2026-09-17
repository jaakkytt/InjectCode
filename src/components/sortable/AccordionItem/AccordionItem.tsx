import React from 'react'
import { Accordion, Fade, IconButton, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import ConfirmDeleteButton from '../../ConfirmDeleteButton'
import AccordionTitle from '../AccordionTitle'
import { ScriptsProvider } from '../../../providers/ScriptsProvider'
import Container from '../Container'
import TutorialTooltip from '../../TutorialTooltip'
import { PlayBadgeIcon } from '../../PlayBadgeIcon'
import { SHARED_CODE } from '../../../constants'
import { Props } from './AccordionItem.types'
import { useAccordionItemBehavior } from './AccordionItem.behavior'
import {
    AccordionSummary,
    accordionStyle,
    headerRowSx,
    titleIconWrapperSx,
    detailsSx,
} from './AccordionItem.styles'

export default function AccordionItem({
    containerId,
    items,
    isExpanded,
    onParentChange,
    allowEditing,
    onRename,
    onRemove,
    expandedPanel,
    onAccordionChange,
}: Props) {
    const { play, transformTitleInput, handlers } = useAccordionItemBehavior({ containerId, items, onRename })

    return (
        <Accordion defaultExpanded expanded={isExpanded} onChange={onParentChange} style={accordionStyle}>
            <AccordionSummary component="div" expandIcon={<ExpandMoreIcon />}>
                <Box sx={headerRowSx}>
                    <AccordionTitle
                        value={containerId}
                        allowEditing={allowEditing}
                        onChange={handlers.handleTitleChange}
                        inputValidator={handlers.validateTitle}
                        inputTransformer={transformTitleInput}
                    >
                        <Typography component="span" sx={titleIconWrapperSx}>
                            {containerId === SHARED_CODE ? (
                                <TutorialTooltip
                                    title="Automatically included with any active script"
                                    placement="top"
                                    slots={{ transition: Fade }}
                                    arrow
                                >
                                    <IconButton color="warning" component="span">
                                        <InfoOutlineIcon />
                                    </IconButton>
                                </TutorialTooltip>
                            ) : (
                                <IconButton color="primary" component="span">
                                    <LinkIcon />
                                </IconButton>
                            )}
                        </Typography>
                    </AccordionTitle>
                    {containerId !== SHARED_CODE && (
                        items.length > 0 ? (
                            <Typography component="span">
                                <TutorialTooltip title="Run" placement="left" slots={{ transition: Fade }} arrow>
                                    <IconButton
                                        component="span"
                                        color="primary"
                                        aria-label="play"
                                        {...play.buttonProps}
                                    >
                                        <PlayBadgeIcon count={play.activeCount} />
                                    </IconButton>
                                </TutorialTooltip>
                            </Typography>
                        ) : (
                            <Typography component="span">
                                <ConfirmDeleteButton onConfirm={onRemove} placement="left" showDeleteTooltip={true} />
                            </Typography>
                        )
                    )}
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={detailsSx}>
                <ScriptsProvider containerId={containerId}>
                    <Container
                        id={containerId}
                        key={containerId}
                        expandedPanel={expandedPanel}
                        onAccordionChange={onAccordionChange}
                    />
                </ScriptsProvider>
            </AccordionDetails>
        </Accordion>
    )
}
