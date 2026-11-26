import type { InputSelection } from 'prism-react-editor'

import { ViewRestoreMode } from '../../../shared/service/settings/viewRestoreMode'
import { AccordionState } from '../../lib/accordionState'
import { TabIndex } from '../../types'

export type { AccordionState }

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
    selection: InputSelection | null
}

export interface LastUsedState {
    view: TabIndex
    accordions: AccordionState
}

export interface ViewRestoreEntry extends LastUsedState {
    key: string
    lastInteraction: LastInteraction | null
}

export interface EditorScroll {
    scriptId: string
    scrollTop: number
}

export interface ViewRestoreCache {
    mode: ViewRestoreMode
    sessionId: string
    lastUsed: LastUsedState
    editorScrolls: EditorScroll[]
    entries: ViewRestoreEntry[]
}

export interface BrowserTabLocation {
    browserTabId?: number
    pageUrl?: URL
}

export type ViewRestoreChange = Partial<Pick<ViewRestoreEntry, 'view' | 'accordions' | 'lastInteraction'>>
