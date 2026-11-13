import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import {
    readViewRestoreMode,
    saveViewRestoreMode,
    ViewRestoreMode,
} from '../../shared/service/settings/viewRestoreMode'
import { requireContext } from '../../shared/lib/requireContext'

interface ViewRestoreModeValue {
    mode: ViewRestoreMode | null
    changeMode: (mode: ViewRestoreMode) => void
}

interface ViewRestoreModeProviderProps {
    children: ReactNode
}

const viewRestoreModeContext = createContext<ViewRestoreModeValue | undefined>(undefined)

export function useViewRestoreMode() {
    return requireContext(useContext(viewRestoreModeContext), 'ViewRestoreModeProvider')
}

function useViewRestoreModeProviderBehavior(): ViewRestoreModeValue {
    const [mode, setMode] = useState<ViewRestoreMode | null>(null)

    useEffect(() => {
        readViewRestoreMode().then(setMode)
    }, [])

    function changeMode(next: ViewRestoreMode) {
        setMode(next)
        saveViewRestoreMode(next).catch(err => console.error('Failed to save popup restore mode:', err))
    }

    return { mode, changeMode }
}

export const ViewRestoreModeProvider = ({ children }: ViewRestoreModeProviderProps) => {
    const value = useViewRestoreModeProviderBehavior()

    return (
        <viewRestoreModeContext.Provider value={value}>
            {children}
        </viewRestoreModeContext.Provider>
    )
}
