import React, { createContext, ReactNode, useContext, useState } from 'react'

import { LOCAL_STORAGE_SCOPE } from '../../shared/constants'
import { requireContext } from '../../shared/lib/requireContext'
import { RunScope } from '../types'

type RunScopeContextType = {
    scope: RunScope;
    setScope: (value: RunScope) => void;
};

const RunScopeContext = createContext<RunScopeContextType | undefined>(undefined)

export const RunScopeProvider = ({ children }: { children: ReactNode }) => {
    const [scope, setScopeState] = useState<RunScope>(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_SCOPE)
        return stored !== null ? stored as RunScope : 'current'
    })

    const setScope = (id: RunScope) => {
        setScopeState(id)
        localStorage.setItem(LOCAL_STORAGE_SCOPE, id)
    }

    return (
        <RunScopeContext.Provider value={{ scope, setScope }}>
            {children}
        </RunScopeContext.Provider>
    )
}

export const useRunScope = () => {
    return requireContext(useContext(RunScopeContext), 'RunScopeProvider')
}
