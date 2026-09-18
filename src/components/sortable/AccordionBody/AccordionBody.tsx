import React from 'react'
import { Editor } from 'prism-react-editor'
import { BasicSetup } from 'prism-react-editor/setups'
import 'prism-react-editor/prism/languages/javascript'
import 'prism-react-editor/prism/languages/css'
import 'prism-react-editor/languages/clike'
import 'prism-react-editor/languages/css'
import 'prism-react-editor/layout.css'
import 'prism-react-editor/themes/github-light.css'
import 'prism-react-editor/search.css'
import 'prism-react-editor/invisibles.css'

import StatusIcon from './StatusIcon'
import { Props } from './AccordionBody.types'
import { useAccordionBodyBehavior } from './AccordionBody.behavior'
import { EditorFrame, StatusSlot } from './AccordionBody.styles'

export default function AccordionBody({ value, language, onChange, onFocusChange }: Props) {
    const { editorSource, status, handlers } = useAccordionBodyBehavior({ value, onChange, onFocusChange })

    return (
        <EditorFrame onClick={handlers.stopClickPropagation}>
            <StatusSlot>
                <StatusIcon status={status} />
            </StatusSlot>
            <Editor
                key={editorSource.revision}
                language={language}
                value={editorSource.value}
                onUpdate={handlers.handleUpdate}
                textareaProps={{
                    onFocus: handlers.handleFocus,
                    onBlur: handlers.handleBlur,
                    'aria-label': language === 'css' ? 'CSS code' : 'JavaScript code',
                }}
            >
                <BasicSetup />
            </Editor>
        </EditorFrame>
    )
}
