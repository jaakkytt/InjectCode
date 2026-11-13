import React, { Dispatch } from 'react'
import { Action, StoreState } from '../types'
import { UrlsContext, UrlsDispatchContext, UrlsHydratedContext } from './urlsContext'

interface Props {
    state: StoreState
    dispatch: Dispatch<Action>
    children?: React.ReactNode
}

export function UrlsProvider({ state, dispatch, children } : Props) {
    const view = state.working ?? state.committed

    return (
        <UrlsContext.Provider value={view}>
            <UrlsDispatchContext.Provider value={dispatch}>
                <UrlsHydratedContext.Provider value={state.isHydrated}>
                    {children}
                </UrlsHydratedContext.Provider>
            </UrlsDispatchContext.Provider>
        </UrlsContext.Provider>
    )
}
