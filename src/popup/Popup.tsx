import React, { useEffect, useReducer, useRef } from 'react'
import { SHARED_CODE, STORAGE_SCRIPTS } from '../shared/constants'
import { ScriptsByPattern } from '../shared/types'
import { urlsRootReducer } from './providers/urlsReducer'
import { useCurrentUrl } from './providers/CurrentUrlProvider'
import { storage } from '../shared/service/storageApi'
import UrlTabs from './components/UrlTabs'
import { UrlsProvider } from './providers/UrlsProvider'
import Footer from './components/footer/Footer'
import { UrlsFilterScope } from './providers/UrlsFilterScope'
import UrlAccordion from './components/sortable/UrlAccordion'
import { ExistingUrlsProvider } from './providers/ExistingUrlsProvider'
import AccordionSkeleton from './components/sortable/AccordionSkeleton'
import { LastInteractedProvider } from './providers/LastInteractedProvider'
import { ViewRestoreProvider } from './providers/ViewRestoreProvider'
import { InteractionsProvider } from './providers/InteractionsProvider'
import { useFeedbackDispatch } from './providers/FeedbackProvider'
import { Message } from './service/Message'

const SAVE_FAILED_MESSAGE = new Message(
    'Saving failed. Copy your latest changes before closing the popup, then see Finding errors on the options page.',
    'error',
)

const Popup = () => {
    const persistedScripts = useRef<ScriptsByPattern | null>(null)
    const currentUrl = useCurrentUrl()
    const { show } = useFeedbackDispatch()

    const [state, dispatch] = useReducer(urlsRootReducer, {
        committed: { [SHARED_CODE]: [] },
        working: null,
        isDirty: false,
        isHydrated: false,
    })

    useEffect(() => {
        storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] }).then((data) => {
            persistedScripts.current = data
            dispatch({ name: 'hydrate', payload: data })
        })
    }, [])

    useEffect(() => {
        if (!state.isHydrated || state.isDirty || state.committed === persistedScripts.current) {
            return
        }

        const scripts = state.committed

        storage.set(STORAGE_SCRIPTS, scripts).then(() => {
            persistedScripts.current = scripts
            console.debug('State saved')
        }).catch((error: unknown) => {
            console.error('Failed to save scripts:', error)
            show(SAVE_FAILED_MESSAGE)
        })
    }, [state.committed, state.isDirty, state.isHydrated, show])

    return <UrlsProvider state={state} dispatch={dispatch}>
        <ExistingUrlsProvider value={Object.keys(state.committed)}>
            <InteractionsProvider>
                <ViewRestoreProvider fallback={<AccordionSkeleton/>}>
                    <LastInteractedProvider>
                        <UrlTabs
                            curren={
                                currentUrl ? (
                                    <UrlsFilterScope activePageUrl={currentUrl.href}>
                                        <UrlAccordion/>
                                    </UrlsFilterScope>
                                ) : (
                                    <AccordionSkeleton/>
                                )
                            }
                            all={<UrlAccordion/>}
                            currentFooter={
                                currentUrl ? (
                                    <UrlsFilterScope activePageUrl={currentUrl.href}>
                                        <Footer/>
                                    </UrlsFilterScope>
                                ) : null
                            }
                            allFooter={<Footer/>}
                        />
                    </LastInteractedProvider>
                </ViewRestoreProvider>
            </InteractionsProvider>
        </ExistingUrlsProvider>
    </UrlsProvider>
}

export default Popup
