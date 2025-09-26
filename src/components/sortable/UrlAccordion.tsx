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
import { AccordionItemData } from '../../types'
import { LOCAL_STORAGE_CHILD_EXPANDED, LOCAL_STORAGE_CLOSE_PARENTS, RESERVED_URL } from '../../constants'
import { useUrls, useUrlsDispatch } from '../../providers/UrlsContextProvider'
import { useLastInteracted } from '../../providers/LastInteractedProvider'
import AccordionItem from './AccordionItem'

const dragMinimumDelta = 5

export default function UrlAccordion() {
    const items = useUrls()
    const dispatch = useUrlsDispatch()
    const { setLastUrl } = useLastInteracted()

    const [activeItem, setActiveItem] = useState<AccordionItemData | null>(null)
    const [dragTranslation, setTranslation] = useState<{ top: number; left: number } | null>(null)

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
                    <AccordionItem
                        key={`container-${containerId}`}
                        containerId={containerId}
                        items={items[containerId]}
                        isExpanded={!closedParents.has(containerId)}
                        onParentChange={handleParentAccordionChange(containerId)}
                        allowEditing={!closedParents.has(containerId) && containerId !== RESERVED_URL}
                        onRename={(newKey) => renameParentAccordionKey(containerId, newKey)}
                        reservedUrl={RESERVED_URL}
                        onRemove={() => removeContainer(containerId)}
                        expandedPanel={expanded}
                        onAccordionChange={handleAccordionChange}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? (
                    <OverlayItem item={activeItem} isExpanded={expanded === activeItem.id} isDragging />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
