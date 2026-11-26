import React from 'react'
import { createRoot } from 'react-dom/client'

import '../shared/styles/global.css'
import './Popup.css'
import { isUserScriptsEnabled } from '../shared/service/userScripts'
import ExtensionDisabledWarning from './components/ExtensionDisabledWarning'
import FeedbackSnackbar from './components/FeedbackSnackbar'
import Popup from './Popup'
import { CurrentUrlProvider } from './providers/CurrentUrlProvider'
import { EditorSettingsProvider } from './providers/EditorSettingsProvider'
import { FeedbackProvider } from './providers/FeedbackProvider'
import { RunScopeProvider } from './providers/RunScopeProvider'

const container = document.getElementById('root')!
const root = createRoot(container)

isUserScriptsEnabled().then(enabled => root.render(enabled ? (
    <CurrentUrlProvider>
        <RunScopeProvider>
            <FeedbackProvider>
                <EditorSettingsProvider>
                    <Popup/>
                </EditorSettingsProvider>
                <FeedbackSnackbar/>
            </FeedbackProvider>
        </RunScopeProvider>
    </CurrentUrlProvider>
) : (
    <ExtensionDisabledWarning />
)))
