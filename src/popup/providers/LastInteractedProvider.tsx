import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import { Interaction } from '../service/interactions/interaction.types'
import { useInteractions } from './InteractionsProvider'
import { LOCAL_STORAGE_LAST_URL, SHARED_CODE } from '../../shared/constants'

const lastInteractedContext = createContext<string | undefined>(undefined)

export function LastInteractedProvider({ children }: { children: ReactNode }) {
    const interactions = useInteractions()
    const [lastUrl, setLastUrl] = useState<string>(() => localStorage.getItem(LOCAL_STORAGE_LAST_URL) ?? SHARED_CODE)

    useEffect(() => interactions.subscribe((interaction) => {
        const urlBlockId = interactedUrlBlockOf(interaction)
        if (urlBlockId !== undefined) {
            setLastUrl(urlBlockId)
            localStorage.setItem(LOCAL_STORAGE_LAST_URL, urlBlockId)
        }
    }), [interactions])

    return <lastInteractedContext.Provider value={lastUrl}>{children}</lastInteractedContext.Provider>
}

export function useLastInteracted(): string {
    return requireContext(useContext(lastInteractedContext), 'LastInteractedProvider')
}

function interactedUrlBlockOf(interaction: Interaction): string | undefined {
    switch (interaction.kind) {
        case 'urlBlockToggled':
        case 'urlBlockCreated':
        case 'urlBlockPicked':
        case 'codeBlockCreated':
        case 'codeBlockDragged':
            return interaction.urlBlockId
        case 'urlBlockRenamed':
            return interaction.newId
        default:
            return undefined
    }
}
