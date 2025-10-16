import React from 'react'
import { Accordion, Fade, IconButton, styled, Typography } from '@mui/material'
import MuiAccordionSummary, { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import ConfirmDeleteButton from '../ConfirmDeleteButton'
import AccordionTitle from './AccordionTitle'
import { ScriptsContextProvider } from '../../providers/ScriptsContextProvider'
import Container from './Container'
import TutorialTooltip from '../TutorialTooltip'
import { AccordionItemData } from '../../types'
import { useExistingUrls } from '../../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../../service/urlPatternValidator'
import { urlCharacterFilter } from '../../service/urlCharacterFilter'
import { usePlayControls } from '../usePlayControls'
import { PlayBadgeIcon } from '../PlayBadgeIcon'
import { BACKGROUND_URL } from '../../constants'

interface AccordionItemProps {
    containerId: string
    items: AccordionItemData[]
    isExpanded: boolean
    onParentChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
    allowEditing: boolean
    onRename: (newKey: string) => void
    onRemove: () => void
    expandedPanel: string | false
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}

const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />)(() => ({
    [`&.${accordionSummaryClasses.expanded}`]: {
        minHeight: 48,
    },
    [`& .${accordionSummaryClasses.content}`]: {
        margin: '10px 0',
    },
    [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
        margin: '10px 0',
    },
}))

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
}: AccordionItemProps) {

    const existingUrls = useExistingUrls()
    const play = usePlayControls({ [containerId]: items })

    return (
        <Accordion defaultExpanded expanded={isExpanded} onChange={onParentChange} style={{ flex: 1 }}>
            <AccordionSummary component="div" expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', margin: '0 8px 0 0' }}>
                    <AccordionTitle
                        value={containerId}
                        allowEditing={allowEditing}
                        onChange={(newKey) => onRename(newKey)}
                        inputValidator={(value) => urlPatternValidator(value, existingUrls)}
                        inputTransformer={urlCharacterFilter}
                    >
                        <Typography component="span" style={{ marginRight: 8 }}>
                            {containerId === BACKGROUND_URL ? (
                                <TutorialTooltip title="Executes alongside any active URL-specific script" placement="top" slots={{ transition: Fade }} arrow>
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
                    {containerId !== BACKGROUND_URL && (
                        items.length > 0 ? (
                            <Typography component="span">
                                <TutorialTooltip title="Run" placement="left" slots={{ transition: Fade }} arrow>
                                    <IconButton component="span" color="primary" aria-label="play" {...play.buttonProps}>
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

            <AccordionDetails sx={{ p: 1 }}>
                <ScriptsContextProvider containerId={containerId}>
                    <Container id={containerId} key={containerId} expandedPanel={expandedPanel} onAccordionChange={onAccordionChange} />
                </ScriptsContextProvider>
            </AccordionDetails>
        </Accordion>
    )
}
