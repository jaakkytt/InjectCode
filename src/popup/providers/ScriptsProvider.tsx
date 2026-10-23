import React, { useMemo } from 'react'
import { useUrls, useUrlsDispatch } from './urlsContext'
import { ScriptsContext, ScriptsDispatchContext, ScriptsDispatch } from './scriptsContext'

interface Props {
    containerId: string
    children?: React.ReactNode
}

export function ScriptsProvider({ containerId, children } : Props) {
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
