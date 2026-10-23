import { createContext, Dispatch, useContext } from 'react'
import { ScriptsByPattern } from '../../shared/types'
import { Action } from '../types'

export const UrlsContext = createContext<ScriptsByPattern | undefined>(undefined)
export const UrlsDispatchContext = createContext<Dispatch<Action> | undefined>(undefined)

export function useUrls(): ScriptsByPattern {
    const context = useContext(UrlsContext)
    if (!context) {
        throw new Error('useUrls must be used within <UrlsProvider>')
    }
    return context
}

export function useUrlsDispatch(): Dispatch<Action> {
    const context = useContext(UrlsDispatchContext)
    if (!context) {
        throw new Error('useUrlsDispatch must be used within <UrlsProvider>')
    }
    return context
}
