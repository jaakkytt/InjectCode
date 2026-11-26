import Typography from '@mui/material/Typography'
import React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import ScriptAccordion from '../ScriptAccordion'
import { useContainerBehavior } from './Container.behavior'
import { DropArea } from './Container.styles'
import { Props } from './Container.types'

export default function Container({ id, expandedPanel, onAccordionChange }: Props) {
    const { isOver, setNodeRef, items, itemIds } = useContainerBehavior(id)

    return (
        <SortableContext id={id} items={itemIds} strategy={verticalListSortingStrategy}>
            <DropArea ref={setNodeRef} isOver={isOver}>
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
                        Add scripts here
                    </Typography>
                )}
            </DropArea>
        </SortableContext>
    )
}
