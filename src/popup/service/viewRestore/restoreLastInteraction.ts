import { Anchor, RestoreRegistry } from './restoreRegistry'
import { AnchorKind, LastInteraction, LastInteractionKind } from './viewRestore.types'

export interface RestoreTarget {
    anchor: Anchor
    focusEditor?: () => void
}

export function anchorKindOf(kind: LastInteractionKind): AnchorKind {
    return kind === 'urlBlock' ? 'urlBlock' : 'codeBlock'
}

export function resolveRestoreTarget(
    lastInteraction: LastInteraction,
    registry: RestoreRegistry,
): RestoreTarget | null {
    const { kind, id, urlBlockId, selection } = lastInteraction
    const anchor = registry.anchor(anchorKindOf(kind), id)

    if (anchor && kind === 'editor' && selection) {
        const editor = registry.editor(id)
        if (editor) {
            return { anchor, focusEditor: () => editor.focusAt(selection) }
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

    target.focusEditor?.()
    scrollPageBy(target.anchor.getBoundingClientRect().top - lastInteraction.top)
}
