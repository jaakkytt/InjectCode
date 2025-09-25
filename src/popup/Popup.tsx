import React, { useEffect, useReducer, useRef } from 'react'
import UrlTabs from '../components/UrlTabs'
import { RESERVED_URL, STORAGE_SCRIPTS } from '../constants'
import { UrlsContextProvider } from '../providers/UrlsContextProvider'
import Footer from '../components/footer/Footer'
import { UrlsFilterScope } from '../providers/UrlsFilterScope'
import { urlsRootReducer } from '../providers/urlsReducer'
import DraggableAccordion from '../components/sortable/DraggableAccordion'
import { ExistingUrlsProvider } from '../providers/ExistingUrlsProvider'
import { useCurrentUrl } from '../providers/CurrentUrlProvider'
import AccordionSkeleton from '../components/sortable/AccordionSkeleton'
import { TabProvider } from '../providers/TabProvider'
import { LastInteractedProvider } from '../providers/LastInteractedProvider'
import { storage } from '../service/storageApi'

const Popup = () => {

    const saveSequence = useRef(0)
    const savesToIgnoreBecauseOfHydration = 2
    const currentUrl = useCurrentUrl()

    const [state, dispatch] = useReducer(urlsRootReducer, {
        committed: { [RESERVED_URL]: [] },
        working: null,
        isDirty: false,
    })

    useEffect(() => {
        storage.get(STORAGE_SCRIPTS, { [RESERVED_URL]: [] }).then((data) => {
            dispatch({ name: 'hydrate', payload: data })
        })
    }, [])

    useEffect(() => {
        saveSequence.current += 1
        if (saveSequence.current <= savesToIgnoreBecauseOfHydration) {
            return
        }

        if (!state.isDirty) {
            storage.set(STORAGE_SCRIPTS, state.committed).then(() => {
                console.debug('State saved')
            })
        }
    }, [state.committed, state.isDirty])

    return <UrlsContextProvider state={state} dispatch={dispatch}>
        <ExistingUrlsProvider value={Object.keys(state.committed)}>
            <TabProvider>
                <LastInteractedProvider>
                    <UrlTabs
                        curren={
                            currentUrl ? (
                                <UrlsFilterScope activePageUrl={currentUrl.href}>
                                    <DraggableAccordion/>
                                </UrlsFilterScope>
                            ) : (
                                <AccordionSkeleton/>
                            )
                        }
                        all={<DraggableAccordion/>}
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
            </TabProvider>
        </ExistingUrlsProvider>
    </UrlsContextProvider>
}

export default Popup
