import React from 'react'
import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core'
import { OverlayItem } from '../OverlayItem'
import AccordionItem from '../AccordionItem'
import { SHARED_CODE } from '../../../constants'
import { useUrlAccordionBehavior } from './UrlAccordion.behavior'

export default function UrlAccordion() {
    const { items, activeItem, expanded, closedParents, sensors, dropAnimation, handlers } = useUrlAccordionBehavior()

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handlers.handleDragStart}
            onDragOver={handlers.handleDragOver}
            onDragEnd={handlers.handleDragEnd}
            onDragCancel={handlers.handleDragCancel}
        >
            <div>
                {Object.keys(items).map((containerId) => (
                    <AccordionItem
                        key={`container-${containerId}`}
                        containerId={containerId}
                        items={items[containerId]}
                        isExpanded={!closedParents.has(containerId)}
                        onParentChange={handlers.handleParentAccordionChange(containerId)}
                        allowEditing={!closedParents.has(containerId) && containerId !== SHARED_CODE}
                        onRename={(newKey) => handlers.renameParentAccordionKey(containerId, newKey)}
                        onRemove={() => handlers.removeContainer(containerId)}
                        expandedPanel={expanded}
                        onAccordionChange={handlers.handleAccordionChange}
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
