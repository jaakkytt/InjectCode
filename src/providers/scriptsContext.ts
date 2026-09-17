import { createContext, useContext } from 'react'
import { AccordionItemData, ScriptType } from '../types'

export type ScriptsDispatch = {
    add: (type: ScriptType, title: string) => void
    update: (scriptId: string, patch: Partial<AccordionItemData>) => void
    remove: (scriptId: string) => void
}

export const ScriptsContext = createContext<AccordionItemData[] | undefined>(undefined)
export const ScriptsDispatchContext = createContext<ScriptsDispatch | undefined>(undefined)

export function useScripts() {
    const context = useContext(ScriptsContext)
    if (!context) {
        throw new Error('useScripts must be used within <ScriptsProvider>')
    }
    return context
}

export function useScriptsDispatch() {
    const context = useContext(ScriptsDispatchContext)
    if (!context) {
        throw new Error('useScriptsDispatch must be used within <ScriptsProvider>')
    }
    return context
}
