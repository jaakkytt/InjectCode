import React, { createContext, useContext, useMemo } from 'react'
import { AccordionItemData, ScriptType } from '../types'
import { useUrls, useUrlsDispatch } from './UrlsContextProvider'

type ScriptsDispatch = {
    add: (type: ScriptType, title: string) => void
    update: (scriptId: string, patch: Partial<AccordionItemData>) => void
    remove: (scriptId: string) => void
}

const ScriptsContext = createContext<AccordionItemData[] | undefined>(undefined)
const ScriptsDispatchContext = createContext<ScriptsDispatch | undefined>(undefined)

interface Props {
    containerId: string
    children?: React.ReactNode
}

export function ScriptsContextProvider({ containerId, children } : Props) {
    const urls = useUrls()
    const parentDispatch = useUrlsDispatch()
    const scripts = useMemo(() => urls[containerId] ?? [], [urls, containerId])
    const dispatch: ScriptsDispatch = useMemo(
        () => ({
            add: (type, title) =>
                parentDispatch({ name: 'scriptAdd', containerId, type, title }),
            update: (scriptId, patch) =>
                parentDispatch({ name: 'scriptUpdate', containerId, scriptId, patch }),
            remove: (scriptId) =>
                parentDispatch({ name: 'scriptDelete', containerId, scriptId }),
        }),
        [parentDispatch, containerId],
    )

    return (
        <ScriptsContext value={scripts}>
            <ScriptsDispatchContext value={dispatch}>
                {children}
            </ScriptsDispatchContext>
        </ScriptsContext>
    )
}

export function useScripts() {
    const ctx = useContext(ScriptsContext)
    if (!ctx) throw new Error('useScripts must be used within <ScriptsContextProvider>')
    return ctx
}

export function useScriptsDispatch() {
    const ctx = useContext(ScriptsDispatchContext)
    if (!ctx) throw new Error('useScriptsDispatch must be used within <ScriptsContextProvider>')
    return ctx
}

// TODO: find a usage or delete this method
export function useScript(scriptId: string) {
    const scripts = useScripts()
    const dispatch = useScriptsDispatch()
    const script = useMemo(() => scripts.find(s => s.id === scriptId), [scripts, scriptId])

    function update(patch: Partial<AccordionItemData>) {
        dispatch.update(scriptId, patch)
    }
    function remove() {
        dispatch.remove(scriptId)
    }

    return { script, update, remove }
}
