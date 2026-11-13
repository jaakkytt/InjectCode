import { useCallback, useRef } from 'react'
import { PrismEditor } from 'prism-react-editor'
import { setSelection } from 'prism-react-editor/utils'
import { useInteractions } from '../providers/InteractionsProvider'
import { useRestoreRegistry } from '../providers/restoreRegistryContext'
import { EditorViewState } from '../service/interactions/interaction.types'

interface Options {
    scriptId: string
    urlBlockId: string
}

export function useEditorRestore({ scriptId, urlBlockId }: Options) {
    const interactions = useInteractions()
    const registry = useRestoreRegistry()
    const editorRef = useRef<PrismEditor | null>(null)

    const attachEditor = useCallback((editor: PrismEditor | null) => {
        if (!editor) {
            return
        }

        editorRef.current = editor
        const container = editor.container

        const unregister = registry.registerEditor(scriptId, state => restoreEditor(editor, state))

        const removeSelectionListener = editor.on('selectionChange', (selection) => {
            if (editor.focused) {
                interactions.publish({ kind: 'editorChanged', scriptId, change: { selection } })
            }
        })

        const trackScroll = () => interactions.publish({
            kind: 'editorChanged',
            scriptId,
            change: { scrollTop: container?.scrollTop ?? 0 },
        })

        container?.addEventListener('scroll', trackScroll)

        return () => {
            unregister()
            removeSelectionListener()

            container?.removeEventListener('scroll', trackScroll)

            if (editorRef.current === editor) {
                editorRef.current = null
            }
        }
    }, [interactions, registry, scriptId])

    function focus() {
        const editor = editorRef.current
        if (editor) {
            interactions.publish({ kind: 'editorFocused', scriptId, urlBlockId, editor: editorStateOf(editor) })
        }
    }

    function blur() {
        interactions.publish({ kind: 'editorBlurred', scriptId })
    }

    return { editorRef: attachEditor, focus, blur }
}

function editorStateOf(editor: PrismEditor): EditorViewState {
    return { selection: editor.getSelection(), scrollTop: editor.container?.scrollTop ?? 0 }
}

function restoreEditor(editor: PrismEditor, { selection, scrollTop }: EditorViewState) {
    const length = editor.value.length
    const [start, end, direction] = selection

    setSelection(editor, Math.min(start, length), Math.min(end, length), direction)
    editor.textarea?.focus({ preventScroll: true })

    if (editor.container) {
        editor.container.scrollTop = scrollTop
    }
}
