import React, { createContext, useContext, useEffect, useState } from 'react'

interface CurrentTab {
    url?: URL
    tabId?: number
    isResolved: boolean
}

const UNRESOLVED: CurrentTab = { isResolved: false }

const CurrentTabContext = createContext<CurrentTab>(UNRESOLVED)

export function CurrentUrlProvider({ children } : { children?: React.ReactNode }) {
    const [currentTab, setCurrentTab] = useState<CurrentTab>(UNRESOLVED)

    useEffect(() => {
        async function fetchCurrentTab(): Promise<CurrentTab> {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                if (!tab || !tab.id || !tab.url) {
                    console.error('No active tab found.')
                    return { isResolved: true }
                }
                return { url: new URL(tab.url), tabId: tab.id, isResolved: true }
            } else if (typeof window !== 'undefined' && window.location) {
                return { url: new URL(window.location.href), isResolved: true }
            } else {
                console.error('Unable to determine current URL.')
                return { isResolved: true }
            }
        }

        fetchCurrentTab()
            .catch((error) => {
                console.error('Unable to determine current tab:', error)
                return { isResolved: true }
            })
            .then(setCurrentTab)
    }, [])

    return (
        <CurrentTabContext value={currentTab}>
            {children}
        </CurrentTabContext>
    )
}

export function useCurrentTab() {
    return useContext(CurrentTabContext)
}

export function useCurrentUrl() {
    return useContext(CurrentTabContext).url
}
