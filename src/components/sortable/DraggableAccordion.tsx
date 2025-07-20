import React, { useState } from 'react'

import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DropAnimation,
    defaultDropAnimation, rectIntersection, ClientRect,
} from '@dnd-kit/core'

import {
    arrayMove,
} from '@dnd-kit/sortable'

import { OverlayItem } from './OverlayItem'
import Container from './Container'
import { AccordionItemData, OnUpdateItem } from './types'
import { Accordion } from '@mui/material'
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";

export type ItemsDataState = Record<string, AccordionItemData[]>;

interface DraggableProps {
    items: ItemsDataState;
    setItems: React.Dispatch<React.SetStateAction<ItemsDataState>>;
    onUpdateItem: OnUpdateItem
}

const dragMinimumDelta = 5

export default function DraggableAccordion({ items, setItems, onUpdateItem }: DraggableProps) {
    const [expanded, setExpanded] = useState<string | false>(false)
    const [activeItem, setActiveItem] = useState<AccordionItemData | null>(null)
    const [dragTranslation, setTranslation] = useState<{ top: number; left: number }|null>(null)

    const sensors = useSensors(useSensor(PointerSensor))

    const dropAnimation: DropAnimation = { ...defaultDropAnimation }

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
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

    return (
        <div>
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
                        <Accordion defaultExpanded key={`container-${containerId}`} style={{ flex: 1 }}>
                            <AccordionSummary component="div" expandIcon={<ExpandMoreIcon />}>
                                <Typography component="span">URL: {containerId}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Container
                                    id={containerId}
                                    key={containerId}
                                    items={items[containerId]}
                                    expandedPanel={expanded}
                                    onAccordionChange={handleAccordionChange}
                                    onUpdateItem={onUpdateItem}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeItem ? <OverlayItem item={activeItem} isExpanded={expanded === activeItem.id} isDragging /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}
