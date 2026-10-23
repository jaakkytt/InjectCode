import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react'
import { FeedbackSeverity } from '../../shared/types'
import { Message } from '../service/Message'

type FeedbackContextType = {
    id: number;
    open: boolean;
    message: string;
    severity: FeedbackSeverity;
};

type FeedbackDispatchContextType = {
    show: (message: Message) => void;
    close: () => void;
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)
const FeedbackDispatchContext = createContext<FeedbackDispatchContextType | undefined>(undefined)

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
    const [feedback, setFeedback] = useState<FeedbackContextType>({
        id: 0,
        open: false,
        message: '',
        severity: 'info',
    })

    const dispatch = useMemo<FeedbackDispatchContextType>(() => ({
        show: ({ message, severity }) => setFeedback(previous => ({
            id: previous.id + 1,
            open: true,
            message,
            severity,
        })),
        close: () => setFeedback(previous => ({ ...previous, open: false })),
    }), [])

    return (
        <FeedbackDispatchContext.Provider value={dispatch}>
            <FeedbackContext.Provider value={feedback}>
                {children}
            </FeedbackContext.Provider>
        </FeedbackDispatchContext.Provider>
    )
}

export const useFeedback = () => {
    const context = useContext(FeedbackContext)
    if (!context) {
        throw new Error('useFeedback must be used within FeedbackProvider')
    }
    return context
}

export const useFeedbackDispatch = () => {
    const context = useContext(FeedbackDispatchContext)
    if (!context) {
        throw new Error('useFeedbackDispatch must be used within FeedbackProvider')
    }
    return context
}
