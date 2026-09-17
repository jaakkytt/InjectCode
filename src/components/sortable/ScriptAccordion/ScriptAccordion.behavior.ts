import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { ScriptRunMode } from '../../../types'
import { useScriptsDispatch } from '../../../providers/scriptsContext'
import { usePlayControls } from '../../usePlayControls'
import { Props } from './ScriptAccordion.types'

export function useScriptAccordionBehavior({ item, parentId }: Pick<Props, 'item' | 'parentId'>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const dispatch = useScriptsDispatch()
    const play = usePlayControls({ [parentId]: [item] })
    const [contentFocused, setContentFocused] = useState(false)

    return {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        play,
        contentFocused,
        handlers: {
            handleTitleChange: (newTitle: string) => dispatch.update(item.id, { title: newTitle }),
            handleRunModeChange: (runMode: ScriptRunMode) => dispatch.update(item.id, { runMode }),
            handleContentChange: (newContent: string) => dispatch.update(item.id, { content: newContent }),
            handleDelete: () => dispatch.remove(item.id),
            setContentFocused,
            stopClickPropagation: (e: React.MouseEvent) => e.stopPropagation(),
        },
    }
}
