import React from 'react'
import { Editor } from 'prism-react-editor'
import 'prism-react-editor/prism/languages/javascript'
import 'prism-react-editor/prism/languages/css'
import 'prism-react-editor/languages/clike'
import 'prism-react-editor/languages/css'
import 'prism-react-editor/layout.css'
import 'prism-react-editor/themes/github-light.css'
import 'prism-react-editor/search.css'
import 'prism-react-editor/invisibles.css'

import StatusIcon from './StatusIcon'
import EditorSetup from './EditorSetup'
import { Props } from './AccordionBody.types'
import { useAccordionBodyBehavior } from './AccordionBody.behavior'
import { EditorFrame, StatusSlot } from './AccordionBody.styles'

export default function AccordionBody({ scriptId, urlBlockId, value, language, onChange, onFocusChange }: Props) {
    const { editorSource, status, editorSettings, editorRef, handlers } = useAccordionBodyBehavior({
        scriptId,
        urlBlockId,
        value,
        onChange,
        onFocusChange,
    })

    return (
        <EditorFrame onClick={handlers.stopClickPropagation}>
            <StatusSlot>
                <StatusIcon status={status} />
            </StatusSlot>
            <Editor
                key={editorSource.revision}
                ref={editorRef}
                language={language}
                value={editorSource.value}
                tabSize={editorSettings.tabSize}
                insertSpaces={editorSettings.insertSpaces}
                onUpdate={handlers.update}
                textareaProps={{
                    onFocus: handlers.focus,
                    onBlur: handlers.blur,
                    'aria-label': language === 'css' ? 'CSS code' : 'JavaScript code',
                }}
            >
                <EditorSetup hotkeys={editorSettings.hotkeys} />
            </Editor>
        </EditorFrame>
    )
}
