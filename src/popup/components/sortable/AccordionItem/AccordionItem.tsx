import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined'
import LinkIcon from '@mui/icons-material/Link'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import React from 'react'
import { Accordion, Fade, IconButton, Typography } from '@mui/material'

import { SHARED_CODE } from '../../../../shared/constants'
import { ScriptsProvider } from '../../../providers/ScriptsProvider'
import ConfirmDeleteButton from '../../ConfirmDeleteButton'
import { PlayBadgeIcon } from '../../PlayBadgeIcon'
import TutorialTooltip from '../../TutorialTooltip'
import AccordionTitle from '../AccordionTitle'
import Container from '../Container'
import { useAccordionItemBehavior } from './AccordionItem.behavior'
import { Props } from './AccordionItem.types'
import {
    accordionStyle,
    AccordionSummary,
    detailsSx,
    headerRowSx,
    titleIconWrapperSx,
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
    const { play, restoreAnchorRef, transformTitleInput, handlers } = useAccordionItemBehavior({
        containerId,
        items,
        onRename,
    })

    return (
        <Accordion defaultExpanded expanded={isExpanded} onChange={onParentChange} style={accordionStyle}>
            <AccordionSummary ref={restoreAnchorRef} component="div" expandIcon={<ExpandMoreIcon />}>
                <Box sx={headerRowSx}>
                    <AccordionTitle
                        value={containerId}
                        allowEditing={allowEditing}
                        onChange={handlers.titleChange}
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
