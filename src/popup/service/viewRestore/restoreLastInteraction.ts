import { Anchor, RestoreRegistry } from './restoreRegistry'
import { AnchorKind, LastInteraction, LastInteractionKind } from './viewRestore.types'

export interface RestoreTarget {
    anchor: Anchor
    restoreEditor?: () => void
}

export function anchorKindOf(kind: LastInteractionKind): AnchorKind {
    return kind === 'urlBlock' ? 'urlBlock' : 'codeBlock'
}

export function resolveRestoreTarget(
    lastInteraction: LastInteraction,
    registry: RestoreRegistry,
): RestoreTarget | null {
    const { kind, id, urlBlockId, editor } = lastInteraction
    const anchor = registry.anchor(anchorKindOf(kind), id)

    if (anchor && kind === 'editor' && editor) {
        const restore = registry.editor(id)
        if (restore) {
            return { anchor, restoreEditor: () => restore(editor) }
        }
    }

    if (anchor) {
        return { anchor }
    }

    const fallback = registry.anchor('urlBlock', urlBlockId)

    return fallback ? { anchor: fallback } : null
}

export function restoreLastInteraction(
    lastInteraction: LastInteraction | null,
    registry: RestoreRegistry,
    scrollPageBy: (deltaY: number) => void,
) {
    const target = lastInteraction && resolveRestoreTarget(lastInteraction, registry)
    if (!lastInteraction || !target) {
        return
    }

    target.restoreEditor?.()
    scrollPageBy(target.anchor.getBoundingClientRect().top - lastInteraction.top)
}
