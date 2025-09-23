import React, { createContext, Dispatch, useContext } from 'react'
import { Action, StoreState, ItemsDataState } from '../types'

export const UrlsContext = createContext<ItemsDataState | undefined>(undefined)
export const UrlsMetaContext = createContext<{ isDirty: boolean } | undefined>(undefined)
export const UrlsDispatchContext = createContext<Dispatch<Action> | undefined>(undefined)

interface Props {
    state: StoreState
    dispatch: Dispatch<Action>
    children?: React.ReactNode
}

export function UrlsContextProvider({ state, dispatch, children } : Props) {
    const view = state.working ?? state.committed

    return (
        <UrlsContext.Provider value={view}>
            <UrlsMetaContext.Provider value={{ isDirty: state.isDirty }}>
                <UrlsDispatchContext.Provider value={dispatch}>
                    {children}
                </UrlsDispatchContext.Provider>
            </UrlsMetaContext.Provider>
        </UrlsContext.Provider>
    )
}

export function useUrls(): ItemsDataState {
    const ctx = useContext(UrlsContext)
    if (!ctx) throw new Error('useUrls must be used within <UrlsContextProvider>')
    return ctx
}

export function useUrlsDispatch(): Dispatch<Action> {
    const ctx = useContext(UrlsDispatchContext)
    if (!ctx) throw new Error('useUrlsDispatch must be used within <UrlsContextProvider>')
    return ctx
}
