import { withCodeBlockOpen, withUrlBlockOpen } from '../../lib/accordionState'
import { Interaction } from '../interactions/interaction.types'
import { createRestoreRegistry, RestoreRegistry } from './restoreRegistry'
import { anchorKindOf, restoreLastInteraction } from './restoreLastInteraction'
import { renameUrlBlockInEntry } from './viewRestoreCache'
import { ViewRestoreStore } from './viewRestoreStore'
import {
    AnchorKind,
    EditorViewState,
    InteractionTarget,
    ViewRestoreChange,
    ViewRestoreEntry,
} from './viewRestore.types'

export interface ViewRestoreController {
    readonly registry: RestoreRegistry
    readonly entry: ViewRestoreEntry
    handleInteraction(interaction: Interaction): void
    restore(): void
    flush(): void
}

export interface ViewRestoreEnvironment {
    requestFrame(callback: () => void): void
    afterCurrentTask(callback: () => void): void
    popupHasFocus(): boolean
    scrollPageBy(deltaY: number): void
}

export function createViewRestoreController(
    store: ViewRestoreStore,
    environment: ViewRestoreEnvironment,
): ViewRestoreController {
    const registry = createRestoreRegistry()
    let isRestored = false

    function commit(change: ViewRestoreChange, isDeferred = false) {
        if (isDeferred) {
            store.updateDeferred(change)
        } else {
            store.update(change)
        }
    }

    function anchorTop(kind: AnchorKind, id: string) {
        const anchor = registry.anchor(kind, id)

        return anchor && Math.round(anchor.getBoundingClientRect().top)
    }

    function refreshTop() {
        const lastInteraction = store.entry.lastInteraction
        if (!lastInteraction) {
            return
        }

        const top = anchorTop(anchorKindOf(lastInteraction.kind), lastInteraction.id)
        if (top !== undefined && top !== lastInteraction.top) {
            commit({ lastInteraction: { ...lastInteraction, top } })
        }
    }

    function recordInteraction(target: InteractionTarget) {
        commit({ lastInteraction: { ...target, top: anchorTop(target.kind, target.id) ?? 0, editor: null } })

        environment.requestFrame(refreshTop)
    }

    function editorFocused(scriptId: string, urlBlockId: string, editor: EditorViewState) {
        if (!isRestored) {
            return
        }

        const top = anchorTop('codeBlock', scriptId) ?? 0

        commit({ lastInteraction: { kind: 'editor', id: scriptId, urlBlockId, top, editor } })
    }

    function editorChanged(scriptId: string, change: Partial<EditorViewState>) {
        const lastInteraction = store.entry.lastInteraction
        if (!isRestored || lastInteraction?.kind !== 'editor' || lastInteraction.id !== scriptId) {
            return
        }

        const editor = lastInteraction.editor && { ...lastInteraction.editor, ...change }

        commit({ lastInteraction: { ...lastInteraction, editor } }, true)
    }

    function editorBlurred(scriptId: string) {
        environment.afterCurrentTask(() => {
            const lastInteraction = store.entry.lastInteraction
            const isStillTheEditor = lastInteraction?.kind === 'editor' && lastInteraction.id === scriptId

            if (isStillTheEditor && environment.popupHasFocus()) {
                recordInteraction({ kind: 'codeBlock', id: scriptId, urlBlockId: lastInteraction.urlBlockId })
            }
        })
    }

    function handleInteraction(interaction: Interaction) {
        switch (interaction.kind) {
            case 'viewSelected':
                commit({ view: interaction.view })
                break
            case 'urlBlockToggled': {
                const { urlBlockId, isOpen } = interaction
                commit({ accordions: withUrlBlockOpen(store.entry.accordions, urlBlockId, isOpen) })
                recordInteraction({ kind: 'urlBlock', id: urlBlockId, urlBlockId })
                break
            }
            case 'urlBlockRenamed': {
                const { accordions, lastInteraction } = renameUrlBlockInEntry(
                    store.entry,
                    interaction.oldId,
                    interaction.newId,
                )
                commit({ accordions, lastInteraction })
                break
            }
            case 'urlBlockCreated':
                recordInteraction({ kind: 'urlBlock', id: interaction.urlBlockId, urlBlockId: interaction.urlBlockId })
                break
            case 'codeBlockToggled': {
                const { scriptId, urlBlockId, isOpen } = interaction
                commit({ accordions: withCodeBlockOpen(store.entry.accordions, scriptId, isOpen) })
                recordInteraction({ kind: 'codeBlock', id: scriptId, urlBlockId })
                break
            }
            case 'codeBlockCreated':
            case 'codeBlockDragged':
                recordInteraction({ kind: 'codeBlock', id: interaction.scriptId, urlBlockId: interaction.urlBlockId })
                break
            case 'editorFocused':
                editorFocused(interaction.scriptId, interaction.urlBlockId, interaction.editor)
                break
            case 'editorChanged':
                editorChanged(interaction.scriptId, interaction.change)
                break
            case 'editorBlurred':
                editorBlurred(interaction.scriptId)
                break
        }
    }

    function restore() {
        if (isRestored) {
            return
        }

        restoreLastInteraction(store.entry.lastInteraction, registry, environment.scrollPageBy)
        isRestored = true
    }

    function flush() {
        if (isRestored) {
            refreshTop()
        }
        store.flush()
    }

    return {
        registry,
        flush,
        handleInteraction,
        restore,
        get entry() {
            return store.entry
        },
    }
}
