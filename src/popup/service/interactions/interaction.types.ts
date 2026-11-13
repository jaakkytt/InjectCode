import type { InputSelection } from 'prism-react-editor'
import { TabIndex } from '../../types'

export interface EditorViewState {
    selection: InputSelection
    scrollTop: number
}

export type Interaction =
    | { kind: 'viewSelected'; view: TabIndex }
    | { kind: 'urlBlockToggled'; urlBlockId: string; isOpen: boolean }
    | { kind: 'urlBlockRenamed'; oldId: string; newId: string }
    | { kind: 'urlBlockCreated'; urlBlockId: string }
    | { kind: 'urlBlockPicked'; urlBlockId: string }
    | { kind: 'codeBlockToggled'; scriptId: string; urlBlockId: string; isOpen: boolean }
    | { kind: 'codeBlockCreated'; scriptId: string; urlBlockId: string }
    | { kind: 'codeBlockDragged'; scriptId: string; urlBlockId: string }
    | { kind: 'editorFocused'; scriptId: string; urlBlockId: string; editor: EditorViewState }
    | { kind: 'editorChanged'; scriptId: string; change: Partial<EditorViewState> }
    | { kind: 'editorBlurred'; scriptId: string }

export type InteractionListener = (interaction: Interaction) => void
