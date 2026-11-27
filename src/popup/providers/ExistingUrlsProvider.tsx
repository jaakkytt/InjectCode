import React, { createContext, useContext } from 'react'

import { requireContext } from '../../shared/lib/requireContext'

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
    return requireContext(useContext(ExistingUrlsContext), 'ExistingUrlsProvider')
}
