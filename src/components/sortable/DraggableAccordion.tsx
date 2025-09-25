import React, { useEffect, useState } from 'react'
import {
    ClientRect,
    defaultDropAnimation,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimation,
    PointerSensor,
    rectIntersection,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { OverlayItem } from './OverlayItem'
import Container from './Container'
import { Accordion, IconButton, styled, Typography } from '@mui/material'
import MuiAccordionSummary, { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionTitle from './AccordionTitle'
import Box from '@mui/material/Box'
import ConfirmDeleteButton from '../ConfirmDeleteButton'
import { AccordionItemData } from '../../types'
import { LOCAL_STORAGE_CHILD_EXPANDED, LOCAL_STORAGE_CLOSE_PARENTS, RESERVED_URL } from '../../constants'
import CounterPlay from './CounterPlay'
import { urlPatternValidator } from '../../service/urlPatternValidator'
import { urlCharacterFilter } from '../../service/urlCharacterFilter'
import { useUrls, useUrlsDispatch } from '../../providers/UrlsContextProvider'
import { ScriptsContextProvider } from '../../providers/ScriptsContextProvider'
import { useExistingUrls } from '../../providers/ExistingUrlsProvider'
import { useLastInteracted } from '../../providers/LastInteractedProvider'

const dragMinimumDelta = 5

export default function DraggableAccordion() {

    const items = useUrls()
    const dispatch = useUrlsDispatch()
    const existingUrls = useExistingUrls()

    const { setLastUrl } = useLastInteracted()

    const [activeItem, setActiveItem] = useState<AccordionItemData | null>(null)
    const [dragTranslation, setTranslation] = useState<{ top: number; left: number }|null>(null)

    const [expanded, setExpanded] = useState<string | false>(() => {
        const savedExpanded = localStorage.getItem(LOCAL_STORAGE_CHILD_EXPANDED)
        return savedExpanded ? savedExpanded : false
    })

    const [closedParents, setClosedParents] = useState<Set<string>>(() => {
        const savedState = localStorage.getItem(LOCAL_STORAGE_CLOSE_PARENTS)
        return savedState ? new Set(JSON.parse(savedState)) : new Set()
    })

    const removeContainer = (containerId: string) => {
        dispatch({ name: 'deleted', id: containerId })
    }

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_CLOSE_PARENTS, JSON.stringify(Array.from(closedParents)))
    }, [closedParents])

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_CHILD_EXPANDED, expanded || '')
    }, [expanded])

    const sensors = useSensors(useSensor(PointerSensor))

    const dropAnimation: DropAnimation = { ...defaultDropAnimation }

    const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    const handleParentAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setClosedParents((prevState) => {
            const newState = new Set(prevState)
            if (isExpanded) {
                newState.delete(panel)
            } else {
                newState.add(panel)
            }
            return newState
        })
        setLastUrl(panel)
    }

    const renameParentAccordionKey = (oldKey: string, newKey: string) => {
        dispatch({ name: 'renamed', id: oldKey, title: newKey })
        setLastUrl(newKey)
    }

    const findContainer = (id: string) => {
        if (id in items) {
            return id
        }
        return Object.keys(items).find((key) => items[key].some(item => item.id === id))
    }

    function handleDragStart(event: DragStartEvent) {
        dispatch({ name: 'dragStart' })

        const { active } = event
        const activeId = active.id.toString()
        const container = findContainer(activeId)

        if (container) {
            setLastUrl(container)
            const item = items[container].find(i => i.id === activeId)
            if (item) {
                setActiveItem(item)
                setExpanded(false)
            }
        }
    }

    function isPositionChangeSignificant(rect: ClientRect) {
        if (!dragTranslation) {
            return true
        }
        return Math.abs(dragTranslation.top - rect.top) >= dragMinimumDelta
            || Math.abs(dragTranslation.left - rect.left) >= dragMinimumDelta
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) {
            return
        }

        const rect = active.rect.current.translated
        if (!rect || !isPositionChangeSignificant(rect)) {
            return
        }

        setTranslation({ top: rect.top, left: rect.left })

        const activeId = active.id.toString()
        const overId = over.id.toString()
        const activeContainer = findContainer(activeId)
        const overContainer = findContainer(overId)

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return
        }

        if (closedParents.has(overContainer)) {
            return
        }

        const activeItems = items[activeContainer]
        const overItems = items[overContainer]
        const activeIndex = activeItems.findIndex((item) => item.id === activeId)
        const overIndex = overItems.findIndex((item) => item.id === overId)

        const newIndexInOver = overId in items ? overItems.length : (overIndex >= 0 ? overIndex : overItems.length)

        dispatch({
            name: 'dragAcrossContainer',
            itemId: activeId,
            fromId: activeContainer,
            fromIndex: activeIndex,
            toId: overContainer,
            toIndex: newIndexInOver,
        })
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveItem(null)

        if (!over) {
            dispatch({ name: 'dragCancel' })
            return
        }

        const activeId = active.id.toString()
        const overId = over.id.toString()
        const activeContainer = findContainer(activeId)
        const overContainer = findContainer(overId)

        if (!activeContainer || !overContainer) {
            dispatch({ name: 'dragCancel' })
            return
        }

        if (activeContainer === overContainer) {
            const containerItems = items[activeContainer]
            const oldIndex = containerItems.findIndex((i) => i.id === activeId)
            const newIndex = containerItems.findIndex((i) => i.id === overId)

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                dispatch({
                    name: 'dragWithinContainer',
                    containerId: activeContainer,
                    fromIndex: oldIndex,
                    toIndex: newIndex,
                })
            }
        }

        dispatch({ name: 'dragDrop' })
        setLastUrl(overContainer)
    }

    const AccordionSummary = styled((props: AccordionSummaryProps) => (
        <MuiAccordionSummary {...props} />
    ))(() => ({
        [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
            margin: 0,
        },
    }))

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div>
                {Object.keys(items).map((containerId) => (
                    <Accordion
                        defaultExpanded
                        key={`container-${containerId}`}
                        expanded={!closedParents.has(containerId)}
                        onChange={handleParentAccordionChange(containerId)}
                        style={{ flex: 1 }}
                    >
                        <AccordionSummary component="div" expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', margin: '0 8px 0 0' }}>
                                <AccordionTitle
                                    value={containerId}
                                    allowEditing={!closedParents.has(containerId) && containerId !== RESERVED_URL}
                                    onChange={(newKey) => renameParentAccordionKey(containerId, newKey)}
                                    inputValidator={(value) => urlPatternValidator(value, existingUrls)}
                                    inputTransformer={urlCharacterFilter}
                                >
                                    <Typography component="span" style={{ marginRight: 8 }}>
                                        <IconButton color="primary" component="span">
                                            <LinkIcon />
                                        </IconButton>
                                    </Typography>
                                </AccordionTitle>
                                { items[containerId].length > 0 ? (
                                    <CounterPlay items={items[containerId]} onClick={() => {
                                        console.log('Play clicked for container:', containerId)
                                    }} />
                                ) : (
                                    containerId !== RESERVED_URL && (
                                        <Typography component="span">
                                            <ConfirmDeleteButton onConfirm={ () => removeContainer(containerId)} placement='left' showDeleteTooltip={true} />
                                        </Typography>
                                    )
                                ) }
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1 }}>
                            <ScriptsContextProvider containerId={containerId}>
                                <Container
                                    id={containerId}
                                    key={containerId}
                                    expandedPanel={expanded}
                                    onAccordionChange={handleAccordionChange}
                                />
                            </ScriptsContextProvider>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? <OverlayItem item={activeItem} isExpanded={expanded === activeItem.id} isDragging /> : null}
            </DragOverlay>
        </DndContext>
    )
}
