import React from 'react'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import Typography from '@mui/material/Typography'
import ScriptAccordion from '../ScriptAccordion'
import { Props } from './Container.types'
import { useContainerBehavior } from './Container.behavior'
import { containerStyle } from './Container.styles'

export default function Container({ id, expandedPanel, onAccordionChange }: Props) {
    const { isOver, setNodeRef, items, itemIds } = useContainerBehavior(id)

    return (
        <SortableContext id={id} items={itemIds} strategy={rectSortingStrategy}>
            <div
                ref={setNodeRef}
                style={containerStyle(isOver)}
            >
                {items.length > 0 ? (
                    items.map(item => (
                        <ScriptAccordion
                            key={item.id}
                            item={item}
                            parentId={id}
                            expandedPanel={expandedPanel}
                            onAccordionChange={onAccordionChange}
                        />
                    ))
                ) : (
                    <Typography component="div">
                        Drop scripts here
                    </Typography>
                )}
            </div>
        </SortableContext>
    )
}
