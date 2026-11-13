import React, { createContext, useContext, useState, ReactNode } from 'react'
import { LOCAL_STORAGE_SCOPE } from '../../shared/constants'
import { RunScope } from '../types'
import { requireContext } from '../../shared/lib/requireContext'

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
