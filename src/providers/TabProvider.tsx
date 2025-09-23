import React, { createContext, useContext, useState } from 'react'
import { TabIndex } from '../types'
import { LOCAL_STORAGE_SELECTED_TAB } from '../constants'

type TabContextType = {
    tabIndex: TabIndex
    setTabIndex: (index: TabIndex) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children?: React.ReactNode }) {
    const [tabIndex, setTabIndexState] = useState<TabIndex>(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_SELECTED_TAB)
        return stored !== null ? Number(stored) as TabIndex : TabIndex.Current
    })

    const setTabIndex = (index: TabIndex) => {
        setTabIndexState(index)
        localStorage.setItem(LOCAL_STORAGE_SELECTED_TAB, String(index))
    }

    return (
        <TabContext.Provider value={{ tabIndex, setTabIndex }}>
            {children}
        </TabContext.Provider>
    )
}

export function useTab() {
    const context = useContext(TabContext)
    if (!context) throw new Error('useTab must be used within a TabProvider')
    return context
}
