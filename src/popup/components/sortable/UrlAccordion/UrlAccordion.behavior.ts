import React, { useEffect, useRef, useState } from 'react'
import {
    defaultDropAnimation,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DropAnimation,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { Script, ScriptsByPattern } from '../../../../shared/types'
import { useUrls, useUrlsDispatch } from '../../../providers/urlsContext'
import { useAccordionState, useAccordionStateDispatch } from '../../../providers/AccordionStateProvider'
import { useInteractions } from '../../../providers/InteractionsProvider'

const dragMinimumDelta = 5

function findContainer(items: ScriptsByPattern, id: string) {
    if (id in items) {
        return id
    }
    return Object.keys(items).find((key) => items[key].some(item => item.id === id))
}

function isPositionChangeSignificant(
    dragTranslation: { top: number; left: number } | null,
    rect: { top: number; left: number },
    minimumDelta: number = dragMinimumDelta,
) {
    if (!dragTranslation) {
        return true
    }
    return Math.abs(dragTranslation.top - rect.top) >= minimumDelta
        || Math.abs(dragTranslation.left - rect.left) >= minimumDelta
}

function resolveDropIndex(
    items: ScriptsByPattern,
    overId: string,
    overItems: Script[],
    overIndex: number,
) {
    if (overId in items) {
        return overItems.length
    }
    return overIndex >= 0 ? overIndex : overItems.length
}

export function useUrlAccordionBehavior() {
    const items = useUrls()
    const dispatch = useUrlsDispatch()
    const { openCodeBlock, closedUrlBlocks } = useAccordionState()
    const expanded: string | false = openCodeBlock ?? false
    const accordions = useAccordionStateDispatch()
    const interactions = useInteractions()

    const [activeItem, setActiveItem] = useState<Script | null>(null)
    const [dragTranslation, setTranslation] = useState<{ top: number; left: number } | null>(null)

    const sensors = useSensors(useSensor(PointerSensor))
    const dropAnimation: DropAnimation = { ...defaultDropAnimation }

    const dragActiveRef = useRef(false)

    // Chrome's extension popup emits window 'resize' events with unchanged
    // dimensions during pointer interactions. dnd-kit's AbstractPointerSensor
    // binds resize -> handleCancel, so those spurious events cancel every drag
    // before the first pointermove is processed. Suppress resize for the
    // duration of a drag only.
    useEffect(() => {
        function suppressDuringDrag(e: Event) {
            if (dragActiveRef.current) {
                e.stopImmediatePropagation()
            }
        }
        window.addEventListener('resize', suppressDuringDrag)
        return () => window.removeEventListener('resize', suppressDuringDrag)
    }, [])

    function parentAccordionChange(panel: string) {
        return (_event: React.SyntheticEvent, isExpanded: boolean) => {
            accordions.setUrlBlockOpen(panel, isExpanded)
        }
    }

    function dragStart(event: DragStartEvent) {
        dragActiveRef.current = true
        dispatch({ name: 'dragStart' })

        const { active } = event
        const activeId = active.id.toString()
        const container = findContainer(items, activeId)

        if (container) {
            interactions.publish({ kind: 'codeBlockDragged', scriptId: activeId, urlBlockId: container })
            const item = items[container].find(i => i.id === activeId)
            if (item) {
                setActiveItem(item)
            }
        }
    }

    function dragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) {
            return
        }

        const rect = active.rect.current.translated
        if (!rect || !isPositionChangeSignificant(dragTranslation, rect)) {
            return
        }

        setTranslation({ top: rect.top, left: rect.left })

        const activeId = active.id.toString()
        const overId = over.id.toString()
        const activeContainer = findContainer(items, activeId)
        const overContainer = findContainer(items, overId)

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return
        }

        if (closedUrlBlocks.has(overContainer)) {
            return
        }

        const activeItems = items[activeContainer]
        const overItems = items[overContainer]
        const activeIndex = activeItems.findIndex((item) => item.id === activeId)
        const overIndex = overItems.findIndex((item) => item.id === overId)

        const newIndexInOver = resolveDropIndex(items, overId, overItems, overIndex)

        dispatch({
            name: 'dragAcrossContainer',
            itemId: activeId,
            fromId: activeContainer,
            fromIndex: activeIndex,
            toId: overContainer,
            toIndex: newIndexInOver,
        })
    }

    function dragCancel() {
        dragActiveRef.current = false
        setActiveItem(null)
        setTranslation(null)
        dispatch({ name: 'dragCancel' })
    }

    function dragEnd(event: DragEndEvent) {
        const { active, over } = event
        dragActiveRef.current = false
        setActiveItem(null)
        setTranslation(null)

        if (!over) {
            dispatch({ name: 'dragCancel' })
            return
        }

        const activeId = active.id.toString()
        const overId = over.id.toString()
        const activeContainer = findContainer(items, activeId)
        const overContainer = findContainer(items, overId)

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
        interactions.publish({ kind: 'codeBlockDragged', scriptId: activeId, urlBlockId: overContainer })
    }

    return {
        items,
        activeItem,
        expanded,
        closedUrlBlocks,
        sensors,
        dropAnimation,
        handlers: {
            dragCancel,
            dragEnd,
            dragOver,
            dragStart,
            parentAccordionChange,
            removeContainer: (containerId: string) => dispatch({ name: 'deleted', id: containerId }),
            accordionChange: (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
                accordions.setCodeBlockOpen(panel, findContainer(items, panel) ?? panel, isExpanded)
            },
            renameParentAccordionKey: (oldKey: string, newKey: string) => {
                dispatch({ name: 'renamed', id: oldKey, title: newKey })
                accordions.renameUrlBlock(oldKey, newKey)
            },
        },
    }
}
