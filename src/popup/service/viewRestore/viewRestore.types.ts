import { ViewRestoreMode } from '../../../shared/service/settings/viewRestoreMode'
import { AccordionState } from '../../lib/accordionState'
import { EditorViewState } from '../interactions/interaction.types'
import { TabIndex } from '../../types'

export type { AccordionState, EditorViewState }

export type LastInteractionKind = 'editor' | 'codeBlock' | 'urlBlock'

export type AnchorKind = Exclude<LastInteractionKind, 'editor'>

export interface InteractionTarget {
    kind: AnchorKind
    id: string
    urlBlockId: string
}

export interface LastInteraction {
    kind: LastInteractionKind
    id: string
    urlBlockId: string
    top: number
    editor: EditorViewState | null
}

export interface LastUsedState {
    view: TabIndex
    accordions: AccordionState
}

export interface ViewRestoreEntry extends LastUsedState {
    key: string
    lastInteraction: LastInteraction | null
}

export interface ViewRestoreCache {
    mode: ViewRestoreMode
    sessionId: string
    lastUsed: LastUsedState
    entries: ViewRestoreEntry[]
}

export interface BrowserTabLocation {
    browserTabId?: number
    pageUrl?: URL
}

export type ViewRestoreChange = Partial<Pick<ViewRestoreEntry, 'view' | 'accordions' | 'lastInteraction'>>
