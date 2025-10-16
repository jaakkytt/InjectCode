import React, { createContext, useContext, useState, ReactNode } from 'react'
import { BACKGROUND_URL, LOCAL_STORAGE_LAST_URL } from '../constants'

type LastInteractedContextType = {
    lastUrl: string;
    setLastUrl: (id: string) => void;
};

const LastInteractedContext = createContext<LastInteractedContextType | undefined>(undefined)

export const LastInteractedProvider = ({ children }: { children: ReactNode }) => {
    const [lastUrl, setLastUrlState] = useState<string>(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_LAST_URL)
        return stored !== null ? stored : BACKGROUND_URL
    })

    const setLastUrl = (id: string) => {
        setLastUrlState(id)
        localStorage.setItem(LOCAL_STORAGE_LAST_URL, id)
    }

    return (
        <LastInteractedContext.Provider value={{ lastUrl, setLastUrl }}>
            {children}
        </LastInteractedContext.Provider>
    )
}

export const useLastInteracted = () => {
    const context = useContext(LastInteractedContext)
    if (!context) throw new Error('useLastInteracted must be used within LastInteractedProvider')
    return context
}
