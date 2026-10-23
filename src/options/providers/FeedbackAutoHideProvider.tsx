import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { FeedbackSeverity } from '../../shared/types'
import {
    FeedbackAutoHideMs,
    FeedbackAutoHideBySeverity,
    readFeedbackAutoHide,
    saveFeedbackAutoHide,
} from '../../shared/service/settings/feedbackAutoHide'

interface FeedbackAutoHideValue {
    autoHide: FeedbackAutoHideBySeverity | null
    changeAutoHide: (severity: FeedbackSeverity, autoHide: FeedbackAutoHideMs) => void
}

interface FeedbackAutoHideProviderProps {
    children: ReactNode
}

const feedbackAutoHideContext = createContext<FeedbackAutoHideValue | undefined>(undefined)

export function useFeedbackAutoHide() {
    const context = useContext(feedbackAutoHideContext)
    if (!context) {
        throw new Error('useFeedbackAutoHide must be used within <FeedbackAutoHideProvider>')
    }
    return context
}

function useFeedbackAutoHideProviderBehavior(): FeedbackAutoHideValue {
    const [autoHide, setAutoHide] = useState<FeedbackAutoHideBySeverity | null>(null)

    useEffect(() => {
        readFeedbackAutoHide().then(setAutoHide)
    }, [])

    function changeAutoHide(severity: FeedbackSeverity, next: FeedbackAutoHideMs) {
        if (!autoHide) {
            return
        }

        const updated = { ...autoHide, [severity]: next }
        setAutoHide(updated)
        saveFeedbackAutoHide(updated).catch(err => console.error('Failed to save message auto hide:', err))
    }

    return { autoHide, changeAutoHide }
}

export const FeedbackAutoHideProvider = ({ children }: FeedbackAutoHideProviderProps) => {
    const value = useFeedbackAutoHideProviderBehavior()

    return (
        <feedbackAutoHideContext.Provider value={value}>
            {children}
        </feedbackAutoHideContext.Provider>
    )
}
