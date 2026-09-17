import React, { useEffect, useReducer, useRef } from 'react'
import { SHARED_CODE, STORAGE_SCRIPTS } from '../constants'
import { urlsRootReducer } from '../providers/urlsReducer'
import { useCurrentUrl } from '../providers/CurrentUrlProvider'
import { storage } from '../service/storageApi'
import UrlTabs from '../components/UrlTabs'
import { UrlsProvider } from '../providers/UrlsProvider'
import Footer from '../components/footer/Footer'
import { UrlsFilterScope } from '../providers/UrlsFilterScope'
import UrlAccordion from '../components/sortable/UrlAccordion'
import { ExistingUrlsProvider } from '../providers/ExistingUrlsProvider'
import AccordionSkeleton from '../components/sortable/AccordionSkeleton'
import { TabProvider } from '../providers/TabProvider'
import { LastInteractedProvider } from '../providers/LastInteractedProvider'
import BuildInfo from '../components/BuildInfo'

const SAVES_TO_IGNORE_BECAUSE_OF_HYDRATION = 2

const Popup = () => {
    const saveSequence = useRef(0)
    const currentUrl = useCurrentUrl()

    const [state, dispatch] = useReducer(urlsRootReducer, {
        committed: { [SHARED_CODE]: [] },
        working: null,
        isDirty: false,
    })

    function shouldPersist(): boolean {
        return saveSequence.current > SAVES_TO_IGNORE_BECAUSE_OF_HYDRATION && !state.isDirty
    }

    useEffect(() => {
        storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] }).then((data) => {
            dispatch({ name: 'hydrate', payload: data })
        })
    }, [])

    useEffect(() => {
        saveSequence.current += 1
        if (!shouldPersist()) {
            return
        }

        storage.set(STORAGE_SCRIPTS, state.committed).then(() => {
            console.debug('State saved')
        })
    }, [state.committed, state.isDirty])

    return <UrlsProvider state={state} dispatch={dispatch}>
        <ExistingUrlsProvider value={Object.keys(state.committed)}>
            <TabProvider>
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
            </TabProvider>
        </ExistingUrlsProvider>
        <BuildInfo/>
    </UrlsProvider>
}

export default Popup
