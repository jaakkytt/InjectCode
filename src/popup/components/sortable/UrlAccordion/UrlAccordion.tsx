import React from 'react'
import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core'
import { OverlayItem } from '../OverlayItem'
import AccordionItem from '../AccordionItem'
import { SHARED_CODE } from '../../../../shared/constants'
import { useUrlAccordionBehavior } from './UrlAccordion.behavior'

export default function UrlAccordion() {
    const { items, activeItem, expanded, closedParents, sensors, dropAnimation, handlers } = useUrlAccordionBehavior()

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handlers.dragStart}
            onDragOver={handlers.dragOver}
            onDragEnd={handlers.dragEnd}
            onDragCancel={handlers.dragCancel}
        >
            <div>
                {Object.keys(items).map((containerId) => (
                    <AccordionItem
                        key={`container-${containerId}`}
                        containerId={containerId}
                        items={items[containerId]}
                        isExpanded={!closedParents.has(containerId)}
                        onParentChange={handlers.parentAccordionChange(containerId)}
                        allowEditing={!closedParents.has(containerId) && containerId !== SHARED_CODE}
                        onRename={(newKey) => handlers.renameParentAccordionKey(containerId, newKey)}
                        onRemove={() => handlers.removeContainer(containerId)}
                        expandedPanel={expanded}
                        onAccordionChange={handlers.accordionChange}
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
