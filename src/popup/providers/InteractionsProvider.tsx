import React, { createContext, ReactNode, useContext, useState } from 'react'
import { createInteractionBus, InteractionBus } from '../service/interactions/interactionBus'
import { requireContext } from '../../shared/lib/requireContext'

const interactionsContext = createContext<InteractionBus | undefined>(undefined)

export function InteractionsProvider({ children }: { children: ReactNode }) {
    const [bus] = useState(createInteractionBus)

    return <interactionsContext.Provider value={bus}>{children}</interactionsContext.Provider>
}

export function useInteractions(): InteractionBus {
    return requireContext(useContext(interactionsContext), 'InteractionsProvider')
}
