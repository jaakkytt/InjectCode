import { useCallback, useRef } from 'react'
import { InputSelection, PrismEditor } from 'prism-react-editor'
import { setSelection } from 'prism-react-editor/utils'
import { useInteractions } from '../providers/InteractionsProvider'
import { useRestoreRegistry } from '../providers/restoreRegistryContext'
import { EditorHandle } from '../service/viewRestore/restoreRegistry'

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

        const unregister = registry.registerEditor(scriptId, editorHandleOf(editor))

        const removeSelectionListener = editor.on('selectionChange', (selection) => {
            if (editor.focused) {
                interactions.publish({ kind: 'editorSelectionChanged', scriptId, selection })
            }
        })

        const trackScroll = () => interactions.publish({
            kind: 'editorScrolled',
            scriptId,
            scrollTop: container?.scrollTop ?? 0,
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
            interactions.publish({ kind: 'editorFocused', scriptId, urlBlockId, selection: editor.getSelection() })
        }
    }

    function blur() {
        interactions.publish({ kind: 'editorBlurred', scriptId })
    }

    return { editorRef: attachEditor, focus, blur }
}

function editorHandleOf(editor: PrismEditor): EditorHandle {
    function scrollTo(scrollTop: number) {
        if (editor.container) {
            editor.container.scrollTop = scrollTop
        }
    }

    function focusAt([start, end, direction]: InputSelection) {
        const length = editor.value.length
        const scrollTop = editor.container?.scrollTop ?? 0

        setSelection(editor, Math.min(start, length), Math.min(end, length), direction)
        editor.textarea?.focus({ preventScroll: true })

        scrollTo(scrollTop)
    }

    return { focusAt, scrollTo }
}
