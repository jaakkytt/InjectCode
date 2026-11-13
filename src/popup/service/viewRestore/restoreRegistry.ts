import { AnchorKind, EditorViewState } from './viewRestore.types'

export interface Anchor {
    getBoundingClientRect(): { top: number }
}

export type EditorRestore = (state: EditorViewState) => void

export interface RestoreRegistry {
    registerAnchor(kind: AnchorKind, id: string, anchor: Anchor): () => void
    registerEditor(scriptId: string, restore: EditorRestore): () => void
    anchor(kind: AnchorKind, id: string): Anchor | undefined
    editor(scriptId: string): EditorRestore | undefined
}

export function createRestoreRegistry(): RestoreRegistry {
    const anchors = new Map<string, Anchor>()
    const editors = new Map<string, EditorRestore>()

    return {
        registerAnchor: (kind, id, anchor) => register(anchors, `${kind}:${id}`, anchor),
        registerEditor: (scriptId, restore) => register(editors, scriptId, restore),
        anchor: (kind, id) => anchors.get(`${kind}:${id}`),
        editor: (scriptId) => editors.get(scriptId),
    }
}

function register<T>(map: Map<string, T>, key: string, value: T): () => void {
    map.set(key, value)
    return () => {
        if (map.get(key) === value) {
            map.delete(key)
        }
    }
}
