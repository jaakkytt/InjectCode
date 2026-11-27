import React from 'react'
import { createRoot } from 'react-dom/client'

import '../shared/styles/global.css'
import './Popup.css'
import { ColorModeProvider } from '../shared/providers/ColorModeProvider'
import { isUserScriptsEnabled } from '../shared/service/userScripts'
import EditorTheme from './components/EditorTheme'
import ExtensionDisabledWarning from './components/ExtensionDisabledWarning'
import FeedbackSnackbar from './components/FeedbackSnackbar'
import Popup from './Popup'
import { CurrentUrlProvider } from './providers/CurrentUrlProvider'
import { EditorSettingsProvider } from './providers/EditorSettingsProvider'
import { FeedbackProvider } from './providers/FeedbackProvider'
import { RunScopeProvider } from './providers/RunScopeProvider'

const container = document.getElementById('root')!
const root = createRoot(container)

isUserScriptsEnabled().then(enabled => root.render(
    <ColorModeProvider>
        {enabled ? (
            <CurrentUrlProvider>
                <RunScopeProvider>
                    <FeedbackProvider>
                        <EditorSettingsProvider>
                            <EditorTheme/>
                            <Popup/>
                        </EditorSettingsProvider>
                        <FeedbackSnackbar/>
                    </FeedbackProvider>
                </RunScopeProvider>
            </CurrentUrlProvider>
        ) : (
            <ExtensionDisabledWarning />
        )}
    </ColorModeProvider>,
))
