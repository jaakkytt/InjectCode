import React, { useMemo } from 'react'
import { usePrismEditor } from 'prism-react-editor/extensions'
import { useEditHistory, useEditorCommands } from 'prism-react-editor/commands'
import { IndentGuides } from 'prism-react-editor/guides'
import { useBracketMatcher } from 'prism-react-editor/match-brackets'
import { useHighlightBracketPairs } from 'prism-react-editor/highlight-brackets'
import { useHighlightMatchingTags, useTagMatcher } from 'prism-react-editor/match-tags'
import { useHighlightSelectionMatches, useSearchWidget, useShowInvisibles } from 'prism-react-editor/search'
import { useCursorPosition } from 'prism-react-editor/cursor'
import { EditorHotkeys } from '../../../../shared/service/settings/editorSettings'
import { buildKeymap } from '../../../lib/editor/keymap'

export interface Props {
    hotkeys: EditorHotkeys
}

export default function EditorSetup({ hotkeys }: Props) {
    const [editor] = usePrismEditor()
    const keymap = useMemo(() => buildKeymap(hotkeys), [hotkeys])

    useBracketMatcher(editor)
    useHighlightBracketPairs(editor)
    useTagMatcher(editor)
    useHighlightMatchingTags(editor)
    useEditorCommands(editor, keymap)
    useEditHistory(editor)
    useSearchWidget(editor)
    useHighlightSelectionMatches(editor)
    useShowInvisibles(editor)
    useCursorPosition(editor)

    return <IndentGuides />
}
