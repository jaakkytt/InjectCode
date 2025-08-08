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

import { arrayMove } from '@dnd-kit/sortable'

import { OverlayItem } from './OverlayItem'
import Container from './Container'
import { Accordion, IconButton, styled, Typography } from '@mui/material'
import MuiAccordionSummary, {
    AccordionSummaryProps,
    accordionSummaryClasses,
} from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionTitle from './AccordionTitle'
import Box from '@mui/material/Box'
import ConfirmDelete from '../ConfirmDelete'
import { AccordionItemData, OnUpdateItem } from '../../types'
import { RESERVED_URL } from '../../constants'
import CounterPlay from './CounterPlay'

export type ItemsDataState = Record<string, AccordionItemData[]>;

interface DraggableProps {
    items: ItemsDataState;
    setItems: React.Dispatch<React.SetStateAction<ItemsDataState>>;
    onUpdateItem: OnUpdateItem
    removeItem: (itemId: string) => void;
    removeContainer: (containerId: string) => void;
}

const dragMinimumDelta = 5

export default function DraggableAccordion(
    { items, setItems, onUpdateItem, removeItem, removeContainer }: DraggableProps,
) {

    const [activeItem, setActiveItem] = useState<AccordionItemData | null>(null)
    const [dragTranslation, setTranslation] = useState<{ top: number; left: number }|null>(null)

    const [expanded, setExpanded] = useState<string | false>(() => {
        const savedExpanded = localStorage.getItem('childExpanded')
        return savedExpanded ? savedExpanded : false
    })

    const [closedParents, setClosedParents] = useState<Set<string>>(() => {
        const savedState = localStorage.getItem('closedParents')
        return savedState ? new Set(JSON.parse(savedState)) : new Set()
    })

    useEffect(() => {
        localStorage.setItem('closedParents', JSON.stringify(Array.from(closedParents)))
    }, [closedParents])

    useEffect(() => {
        localStorage.setItem('childExpanded', expanded || '')
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
    }

    const renameParentAccordionKey = (oldKey: string, newKey: string) => {
        setItems((prevItems) => {
            const { [oldKey]: oldValue, ...rest } = prevItems
            const updatedItems = {
                ...rest,
                [newKey]: oldValue,
            }

            const keys = Object.keys(updatedItems)
            const [firstKey, ...otherKeys] = keys
            const sortedOtherKeys = otherKeys.sort()
            return [firstKey, ...sortedOtherKeys].reduce((acc, key) => {
                acc[key] = updatedItems[key]
                return acc
            }, {} as ItemsDataState)
        })
    }

    const findContainer = (id: string) => {
        if (id in items) {
            return id
        }
        return Object.keys(items).find((key) => items[key].some(item => item.id === id))
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event

        const activeId = active.id.toString()
        const container = findContainer(activeId)

        if (container) {
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

        setItems((prev) => {

            if (prev[overContainer].some(item => item.id === activeId)) {
                return prev
            }

            const activeItems = prev[activeContainer]
            const overItems = prev[overContainer]
            const activeIndex = activeItems.findIndex((item) => item.id === activeId)
            const overIndex = overItems.findIndex((item) => item.id === overId)

            let newIndexInOver: number
            if (overId in prev) {
                newIndexInOver = overItems.length
            } else {
                newIndexInOver = overIndex >= 0 ? overIndex : overItems.length
            }

            return {
                ...prev,
                [activeContainer]: activeItems.filter((item) => item.id !== activeId),
                [overContainer]: [
                    ...overItems.slice(0, newIndexInOver),
                    activeItems[activeIndex],
                    ...overItems.slice(newIndexInOver),
                ],
            }
        })
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveItem(null)
        if (!over) {
            return
        }

        const activeId = active.id.toString()
        const overId = over.id.toString()

        const activeContainer = findContainer(activeId)
        const overContainer = findContainer(overId)

        if (!activeContainer || !overContainer || activeContainer !== overContainer) {
            return
        }

        const containerItems = items[activeContainer]
        const oldIndex = containerItems.findIndex((i) => i.id === activeId)
        const newIndex = containerItems.findIndex((i) => i.id === overId)

        if (oldIndex !== newIndex) {
            setItems((prev) => ({
                ...prev,
                [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
            }))
        }
    }

    const titleInputValidator = (value: string) => {
        if (value.trim() === '') {
            return 'This field cannot be empty'
        }
        if (value === RESERVED_URL) {
            return `"${RESERVED_URL}" is reserved and cannot be used`
        }
        if (Object.keys(items).includes(value)) {
            return `"${value}" already exists`
        }
        return undefined
    }

    const AccordionSummary = styled((props: AccordionSummaryProps) => (
        <MuiAccordionSummary {...props} />
    ))(() => ({
        [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
            margin: 0,
        },
    }))

    return (
        <div>
            <h1>Draggable Accordions</h1>
            <p>Drag the accordions by their handle to reorder them or move them between containers.</p>
            <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
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
                                    inputValidator={titleInputValidator}
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
                                            <ConfirmDelete onConfirm={ () => removeContainer(containerId)} hasText={false} />
                                        </Typography>
                                    )
                                ) }
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Container
                                id={containerId}
                                key={containerId}
                                items={items[containerId]}
                                expandedPanel={expanded}
                                onAccordionChange={handleAccordionChange}
                                onUpdateItem={onUpdateItem}
                                removeItem={removeItem}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))}
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? <OverlayItem item={activeItem} isExpanded={expanded === activeItem.id} isDragging /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
