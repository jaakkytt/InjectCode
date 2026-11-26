import { useCallback } from 'react'

import { useRestoreRegistry } from '../providers/restoreRegistryContext'
import { AnchorKind } from '../service/viewRestore/viewRestore.types'

export function useRestoreAnchor(kind: AnchorKind, id: string) {
    const registry = useRestoreRegistry()

    return useCallback(
        (element: HTMLElement | null) => element ? registry.registerAnchor(kind, id, element) : undefined,
        [registry, kind, id],
    )
}
