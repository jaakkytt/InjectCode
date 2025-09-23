import React, { createContext, useContext } from 'react'

export const ExistingUrlsContext = createContext<string[]>([])

interface Props {
    value: string[]
    children?: React.ReactNode
}

export function ExistingUrlsProvider({ value, children } : Props) {
    return (
        <ExistingUrlsContext.Provider value={value}>
            {children}
        </ExistingUrlsContext.Provider>
    )
}

export function useExistingUrls(): string[] {
    const ctx = useContext(ExistingUrlsContext)
    if (!ctx) throw new Error('useExistingUrls must be used within <ExistingUrlsProvider>')
    return ctx
}
