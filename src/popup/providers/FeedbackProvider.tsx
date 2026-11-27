import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
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
    return requireContext(useContext(FeedbackContext), 'FeedbackProvider')
}

export const useFeedbackDispatch = () => {
    return requireContext(useContext(FeedbackDispatchContext), 'FeedbackProvider')
}
