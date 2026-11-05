import '../shared/styles/global.css'
import './Popup.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './Popup'
import { isUserScriptsEnabled } from '../shared/service/userScripts'
import { CurrentUrlProvider } from './providers/CurrentUrlProvider'
import { RunScopeProvider } from './providers/RunScopeProvider'
import { FeedbackProvider } from './providers/FeedbackProvider'
import FeedbackSnackbar from './components/FeedbackSnackbar'
import ExtensionDisabledWarning from './components/ExtensionDisabledWarning'

const container = document.getElementById('root')!
const root = createRoot(container)

isUserScriptsEnabled().then(enabled => root.render(enabled ? (
    <CurrentUrlProvider>
        <RunScopeProvider>
            <FeedbackProvider>
                <Popup/>
                <FeedbackSnackbar/>
            </FeedbackProvider>
        </RunScopeProvider>
    </CurrentUrlProvider>
) : (
    <ExtensionDisabledWarning />
)))
