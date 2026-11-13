import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { TabIndex } from '../types'
import { useInteractions } from './InteractionsProvider'
import { requireContext } from '../../shared/lib/requireContext'

interface ViewDispatch {
    selectView(view: TabIndex): void
}

interface Props {
    initialView: TabIndex
    children: ReactNode
}

const viewContext = createContext<TabIndex | undefined>(undefined)
const viewDispatchContext = createContext<ViewDispatch | undefined>(undefined)

export function ViewProvider({ initialView, children }: Props) {
    const interactions = useInteractions()
    const [view, setView] = useState(initialView)

    const dispatch = useMemo<ViewDispatch>(() => ({
        selectView: (next: TabIndex) => {
            setView(next)
            interactions.publish({ kind: 'viewSelected', view: next })
        },
    }), [interactions])

    return (
        <viewContext.Provider value={view}>
            <viewDispatchContext.Provider value={dispatch}>
                {children}
            </viewDispatchContext.Provider>
        </viewContext.Provider>
    )
}

export function useView(): TabIndex {
    return requireContext(useContext(viewContext), 'ViewProvider')
}

export function useViewDispatch(): ViewDispatch {
    return requireContext(useContext(viewDispatchContext), 'ViewProvider')
}
