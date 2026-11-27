import type { InputSelection } from 'prism-react-editor'

import { AnchorKind } from './viewRestore.types'

export interface Anchor {
    getBoundingClientRect(): { top: number }
    scrollIntoView(options: ScrollIntoViewOptions): void
}

export interface EditorHandle {
    focusAt(selection: InputSelection): void
    scrollTo(scrollTop: number): void
}

export type EditorRegisteredListener = (scriptId: string, editor: EditorHandle) => void

export interface RestoreRegistry {
    registerAnchor(kind: AnchorKind, id: string, anchor: Anchor): () => void
    registerEditor(scriptId: string, editor: EditorHandle): () => void
    anchor(kind: AnchorKind, id: string): Anchor | undefined
    editor(scriptId: string): EditorHandle | undefined
}

export function createRestoreRegistry(editorRegistered: EditorRegisteredListener): RestoreRegistry {
    const anchors = new Map<string, Anchor>()
    const editors = new Map<string, EditorHandle>()

    return {
        registerAnchor: (kind, id, anchor) => register(anchors, `${kind}:${id}`, anchor),
        registerEditor: (scriptId, editor) => {
            const unregister = register(editors, scriptId, editor)

            editorRegistered(scriptId, editor)

            return unregister
        },
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
