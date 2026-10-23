import '../styles/global.css'
import './Popup.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './Popup'
import { CurrentUrlProvider } from '../providers/CurrentUrlProvider'
import { RunScopeProvider } from '../providers/RunScopeProvider'
import { FeedbackProvider } from '../providers/FeedbackProvider'
import FeedbackSnackbar from '../components/FeedbackSnackbar'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
    <CurrentUrlProvider>
        <RunScopeProvider>
            <FeedbackProvider>
                <Popup/>
                <FeedbackSnackbar/>
            </FeedbackProvider>
        </RunScopeProvider>
    </CurrentUrlProvider>,
)
