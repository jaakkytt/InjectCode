import { useDroppable } from '@dnd-kit/core'
import { useRef } from 'react'

import { useScripts } from '../../../providers/scriptsContext'

const emptyStableIds: StableIds = { key: '', ids: [] }

interface StableIds {
    key: string
    ids: string[]
}

export function useContainerBehavior(id: string) {
    const { isOver, setNodeRef } = useDroppable({ id })
    const items = useScripts()

    const stableIdsRef = useRef<StableIds>(emptyStableIds)

    function resolveStableIds(): StableIds {
        const ids = items.map(i => i.id)
        const key = ids.join(',')
        return key === stableIdsRef.current.key ? stableIdsRef.current : { key, ids }
    }

    stableIdsRef.current = resolveStableIds()

    return { isOver, setNodeRef, items, itemIds: stableIdsRef.current.ids }
}
