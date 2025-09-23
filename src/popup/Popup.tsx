import React, { useEffect, useReducer } from 'react'
import UrlTabs from '../components/UrlTabs'
import { ItemsDataState } from '../types'
import { USER_SCRIPT_ID, RESERVED_URL } from '../constants'
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

const Popup = () => {

    const currentUrl = useCurrentUrl()

    const itemsFromDisk : ItemsDataState = {
        [RESERVED_URL]: [
            {
                id: 'panel1',
                title: 'General settings',
                secondaryText: '',
                content: '1.',
                active: true,
                type: 'js',
            },
            {
                id: 'panel4',
                title: 'Personal data and a very long title which will most likely stretch this accordion item to the next line',
                secondaryText: '',
                content: 'Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.',
                active: true,
                type: 'css',
            },
        ],
        'https://github.com/*': [
            {
                id: 'panel3',
                title: 'Advanced settings',
                secondaryText: '',
                content: '3.',
                active: true,
                type: 'js',
            },
        ],
        'https://jaak.kytt.ee/static/*': [
            {
                id: 'panel2',
                title: 'Users',
                secondaryText: '',
                content: '2.',
                active: false,
                type: 'js',
            },
        ],
    }

    const [state, dispatch] = useReducer(urlsRootReducer, {
        committed: itemsFromDisk,
        working: null,
        isDirty: false,
    })

    useEffect(() => {
        if (!state.isDirty) {
            console.log('Saving committed state to storage...')
            // chrome.storage.local.set({ urls: state.committed })
        }
    }, [state.committed, state.isDirty])

    async function runMatching(pattern: string, sourceCode: string, scriptId: string) {
        const tabs = await chrome.tabs.query({ url: pattern })
        for (const tab of tabs) {
            if (!tab.id) {
                console.error('Tab ID is not available.')
                continue
            }
            await chrome.userScripts.execute({
                target: { tabId: tab.id },
                worldId: scriptId,
                js: [{ code: sourceCode }],
            })
        }
    }

    async function runActive(sourceCode: string, scriptId: string) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab || !tab.id) {
            console.error('No active tab found.')
            return
        }
        await chrome.userScripts.execute({
            target: { tabId: tab.id },
            worldId: scriptId,
            js: [{ code: sourceCode }],
        })
    }

    const handleRunAll = async () => {
        console.log('Running script on all tabs matching pattern...')
        const pat = 'https://github.com/*'
        const { script } = await chrome.storage.local.get({
            script: 'alert(\'hi\');',
        })
        await runMatching(pat, script, USER_SCRIPT_ID)
    }

    const handleRunCurrent = async () => {
        console.log('Running script on current tab...')
        const { script } = await chrome.storage.local.get({
            script: 'alert(\'hi\');',
        })
        await runActive(script, USER_SCRIPT_ID)
    }

    return <UrlsContextProvider state={state} dispatch={dispatch}>
        <ExistingUrlsProvider value={Object.keys(state.committed)}>
            <TabProvider>
                <LastInteractedProvider>
                    <UrlTabs
                        curren={
                            currentUrl ? (
                                <UrlsFilterScope activePageUrl={currentUrl.href}>
                                    <DraggableAccordion />
                                </UrlsFilterScope>
                            ) : (
                                <AccordionSkeleton />
                            )
                        }
                        all={<DraggableAccordion />}
                        currentFooter={
                            currentUrl ? (
                                <UrlsFilterScope activePageUrl={currentUrl.href}>
                                    <Footer handleRunCurrent={handleRunCurrent} handleRunAll={handleRunAll} />
                                </UrlsFilterScope>
                            ) : (
                                <Footer handleRunCurrent={handleRunCurrent} handleRunAll={handleRunAll} />
                            )
                        }
                        allFooter={<Footer handleRunCurrent={handleRunCurrent} handleRunAll={handleRunAll} />}
                    />
                </LastInteractedProvider>
            </TabProvider>
        </ExistingUrlsProvider>
    </UrlsContextProvider>
}

export default Popup
