import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import { useInteractions } from './InteractionsProvider'
import {
    AccordionState,
    withCodeBlockOpen,
    withUrlBlockOpen,
    withUrlBlockRenamed,
} from '../lib/accordionState'

export interface AccordionSnapshot {
    openCodeBlock: string | null
    closedUrlBlocks: ReadonlySet<string>
}

interface AccordionDispatch {
    setUrlBlockOpen(urlBlockId: string, isOpen: boolean): void
    setCodeBlockOpen(scriptId: string, urlBlockId: string, isOpen: boolean): void
    renameUrlBlock(oldId: string, newId: string): void
}

interface Props {
    initialState: AccordionState
    children: ReactNode
}

const accordionStateContext = createContext<AccordionSnapshot | undefined>(undefined)
const accordionDispatchContext = createContext<AccordionDispatch | undefined>(undefined)

export function AccordionStateProvider({ initialState, children }: Props) {
    const interactions = useInteractions()
    const [state, setState] = useState(initialState)

    const snapshot = useMemo<AccordionSnapshot>(() => ({
        openCodeBlock: state.openCodeBlock,
        closedUrlBlocks: new Set(state.closedUrlBlocks),
    }), [state])

    const dispatch = useMemo<AccordionDispatch>(() => ({
        setUrlBlockOpen: (urlBlockId: string, isOpen: boolean) => {
            setState(current => withUrlBlockOpen(current, urlBlockId, isOpen))
            interactions.publish({ kind: 'urlBlockToggled', urlBlockId, isOpen })
        },

        setCodeBlockOpen: (scriptId: string, urlBlockId: string, isOpen: boolean) => {
            setState(current => withCodeBlockOpen(current, scriptId, isOpen))
            interactions.publish({ kind: 'codeBlockToggled', scriptId, urlBlockId, isOpen })
        },

        renameUrlBlock: (oldId: string, newId: string) => {
            setState(current => withUrlBlockRenamed(current, oldId, newId))
            interactions.publish({ kind: 'urlBlockRenamed', oldId, newId })
        },
    }), [interactions])

    return (
        <accordionStateContext.Provider value={snapshot}>
            <accordionDispatchContext.Provider value={dispatch}>
                {children}
            </accordionDispatchContext.Provider>
        </accordionStateContext.Provider>
    )
}

export function useAccordionState(): AccordionSnapshot {
    return requireContext(useContext(accordionStateContext), 'AccordionStateProvider')
}

export function useAccordionStateDispatch(): AccordionDispatch {
    return requireContext(useContext(accordionDispatchContext), 'AccordionStateProvider')
}
