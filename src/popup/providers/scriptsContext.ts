import { createContext, useContext } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import { Script, ScriptType } from '../../shared/types'

export type ScriptsDispatch = {
    add: (id: string, type: ScriptType, title: string) => void
    update: (scriptId: string, patch: Partial<Script>) => void
    remove: (scriptId: string) => void
}

export const ScriptsContext = createContext<Script[] | undefined>(undefined)
export const ScriptsDispatchContext = createContext<ScriptsDispatch | undefined>(undefined)

export function useScripts() {
    return requireContext(useContext(ScriptsContext), 'ScriptsProvider')
}

export function useScriptsDispatch() {
    return requireContext(useContext(ScriptsDispatchContext), 'ScriptsProvider')
}
