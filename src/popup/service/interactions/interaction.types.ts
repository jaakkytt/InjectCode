import type { InputSelection } from 'prism-react-editor'

import { TabIndex } from '../../types'

export type Interaction =
    | { kind: 'viewSelected'; view: TabIndex }
    | { kind: 'urlBlockToggled'; urlBlockId: string; isOpen: boolean }
    | { kind: 'urlBlockRenamed'; oldId: string; newId: string }
    | { kind: 'urlBlockCreated'; urlBlockId: string }
    | { kind: 'urlBlockPicked'; urlBlockId: string }
    | { kind: 'codeBlockToggled'; scriptId: string; urlBlockId: string; isOpen: boolean }
    | { kind: 'codeBlockCreated'; scriptId: string; urlBlockId: string }
    | { kind: 'codeBlockDragged'; scriptId: string; urlBlockId: string }
    | { kind: 'editorFocused'; scriptId: string; urlBlockId: string; selection: InputSelection }
    | { kind: 'editorSelectionChanged'; scriptId: string; selection: InputSelection }
    | { kind: 'editorScrolled'; scriptId: string; scrollTop: number }
    | { kind: 'editorBlurred'; scriptId: string }

export type InteractionListener = (interaction: Interaction) => void
