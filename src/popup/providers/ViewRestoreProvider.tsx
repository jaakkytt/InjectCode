import React, { ReactNode, useEffect, useState } from 'react'

import { AccordionStateProvider } from './AccordionStateProvider'
import { useCurrentTab } from './CurrentUrlProvider'
import { useInteractions } from './InteractionsProvider'
import { restoreRegistryContext } from './restoreRegistryContext'
import { useUrlsHydrated } from './urlsContext'
import { ViewProvider } from './ViewProvider'
import { createViewRestoreController, ViewRestoreController } from '../service/viewRestore/viewRestoreController'
import { bindToDocument, browserEnvironment, openBrowserViewRestoreStore } from '../service/viewRestore/browserPorts'

interface Props {
    fallback: ReactNode
    children: ReactNode
}

export function ViewRestoreProvider({ fallback, children }: Props) {
    const controller = useViewRestoreController()

    return controller ? (
        <ViewRestoreBridge controller={controller}>{children}</ViewRestoreBridge>
    ) : (
        <>{fallback}</>
    )
}

function ViewRestoreBridge({ controller, children }: { controller: ViewRestoreController, children: ReactNode }) {
    const interactions = useInteractions()
    const isHydrated = useUrlsHydrated()
    const [initialEntry] = useState(controller.entry)

    useEffect(() => interactions.subscribe(controller.handleInteraction), [interactions, controller])

    useEffect(() => {
        if (isHydrated) {
            controller.restore()
        }
    }, [controller, isHydrated])

    useEffect(() => bindToDocument(controller), [controller])

    return (
        <restoreRegistryContext.Provider value={controller.registry}>
            <ViewProvider initialView={initialEntry.view}>
                <AccordionStateProvider initialState={initialEntry.accordions}>
                    {children}
                </AccordionStateProvider>
            </ViewProvider>
        </restoreRegistryContext.Provider>
    )
}

function useViewRestoreController() {
    const { url, tabId, isResolved } = useCurrentTab()
    const [controller, setController] = useState<ViewRestoreController | null>(null)

    useEffect(() => {
        if (!isResolved) {
            return
        }

        openBrowserViewRestoreStore({ browserTabId: tabId, pageUrl: url })
            .then(store => setController(createViewRestoreController(store, browserEnvironment)))
    }, [isResolved, tabId, url])

    return controller
}
