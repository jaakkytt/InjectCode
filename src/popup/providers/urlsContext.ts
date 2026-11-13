import { createContext, Dispatch, useContext } from 'react'
import { ScriptsByPattern } from '../../shared/types'
import { Action } from '../types'
import { requireContext } from '../../shared/lib/requireContext'

export const UrlsContext = createContext<ScriptsByPattern | undefined>(undefined)
export const UrlsDispatchContext = createContext<Dispatch<Action> | undefined>(undefined)
export const UrlsHydratedContext = createContext(false)

export function useUrls(): ScriptsByPattern {
    return requireContext(useContext(UrlsContext), 'UrlsProvider')
}

export function useUrlsDispatch(): Dispatch<Action> {
    return requireContext(useContext(UrlsDispatchContext), 'UrlsProvider')
}

export function useUrlsHydrated(): boolean {
    return useContext(UrlsHydratedContext)
}
