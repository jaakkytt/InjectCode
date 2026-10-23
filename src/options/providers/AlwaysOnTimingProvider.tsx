import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { AlwaysOnTiming, readAlwaysOnTiming, saveAlwaysOnTiming } from '../../shared/service/settings/alwaysOnTiming'

interface AlwaysOnTimingValue {
    timing: AlwaysOnTiming | null
    changeTiming: (timing: AlwaysOnTiming) => void
}

interface AlwaysOnTimingProviderProps {
    children: ReactNode
}

const alwaysOnTimingContext = createContext<AlwaysOnTimingValue | undefined>(undefined)

export function useAlwaysOnTiming() {
    const context = useContext(alwaysOnTimingContext)
    if (!context) {
        throw new Error('useAlwaysOnTiming must be used within <AlwaysOnTimingProvider>')
    }
    return context
}

function useAlwaysOnTimingProviderBehavior(): AlwaysOnTimingValue {
    const [timing, setTiming] = useState<AlwaysOnTiming | null>(null)

    useEffect(() => {
        readAlwaysOnTiming().then(setTiming)
    }, [])

    function changeTiming(next: AlwaysOnTiming) {
        setTiming(next)
        saveAlwaysOnTiming(next).catch(err => console.error('Failed to save Always on timing:', err))
    }

    return { timing, changeTiming }
}

export const AlwaysOnTimingProvider = ({ children }: AlwaysOnTimingProviderProps) => {
    const value = useAlwaysOnTimingProviderBehavior()

    return (
        <alwaysOnTimingContext.Provider value={value}>
            {children}
        </alwaysOnTimingContext.Provider>
    )
}
