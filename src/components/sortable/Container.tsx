import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import SortableAccordionItem from './SortableAccordionItem'
import { useScripts } from '../../providers/ScriptsContextProvider'

interface ContainerProps {
    id: string;
    expandedPanel: string | false;
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

export default function Container(
    { id, expandedPanel, onAccordionChange } : ContainerProps,
) {
    const { isOver, setNodeRef } = useDroppable({ id })
    const items = useScripts()

    const containerStyle: React.CSSProperties = {
        transition: 'background-color 0.2s ease',
        backgroundColor: isOver ? 'rgba(34, 139, 230, 0.1)' : '#F3F4F6',
        padding: 8,
        border: '1px dashed #9CA3AF',
        borderRadius: 8,
        minHeight: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    }

    return (
        <SortableContext id={id} items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            <div
                ref={setNodeRef}
                style={containerStyle}
            >
                {items.length > 0 ? (
                    items.map(item => (
                        <SortableAccordionItem
                            key={item.id}
                            item={item}
                            expandedPanel={expandedPanel}
                            onAccordionChange={onAccordionChange}
                        />
                    ))
                ) : (
                    <div>
                        Drop items here
                    </div>
                )}
            </div>
        </SortableContext>
    )
}
