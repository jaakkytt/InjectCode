import React, { createContext, ReactNode, useContext, useState } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import { createInteractionBus, InteractionBus } from '../service/interactions/interactionBus'

const interactionsContext = createContext<InteractionBus | undefined>(undefined)

export function InteractionsProvider({ children }: { children: ReactNode }) {
    const [bus] = useState(createInteractionBus)

    return <interactionsContext.Provider value={bus}>{children}</interactionsContext.Provider>
}

export function useInteractions(): InteractionBus {
    return requireContext(useContext(interactionsContext), 'InteractionsProvider')
}
