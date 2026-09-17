import React, { Dispatch } from 'react'
import { Action, StoreState } from '../types'
import { UrlsContext, UrlsDispatchContext } from './urlsContext'

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
                {children}
            </UrlsDispatchContext.Provider>
        </UrlsContext.Provider>
    )
}
