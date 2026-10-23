import React, { createContext, useContext, useEffect, useState } from 'react'

const CurrentUrlContext = createContext<URL | undefined>(undefined)

export function CurrentUrlProvider({ children } : { children?: React.ReactNode }) {
    const [currentUrl, setCurrentUrl] = useState<URL | undefined>(undefined)

    useEffect(() => {
        async function fetchCurrentUrl() {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                if (!tab || !tab.id || !tab.url) {
                    console.error('No active tab found.')
                    return
                }
                return new URL(tab.url)
            } else if (typeof window !== 'undefined' && window.location) {
                return new URL(window.location.href)
            } else {
                console.error('Unable to determine current URL.')
            }
        }
        fetchCurrentUrl().then(setCurrentUrl)
    }, [])

    return (
        <CurrentUrlContext value={currentUrl}>
            {children}
        </CurrentUrlContext>
    )
}

export function useCurrentUrl() {
    return useContext(CurrentUrlContext)
}
