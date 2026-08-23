import { storage } from './service/storageApi'
import { syncPersistentScripts } from './service/persistentScripts'
import { SHARED_CODE, STORAGE_SCRIPTS } from './constants'

async function resyncPersistentScripts() {
    try {
        const data = await storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] })
        await syncPersistentScripts(data)
    } catch (err) {
        console.error('Failed to read scripts for persistent-script resync:', err)
    }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage()
    }
    resyncPersistentScripts()
})

chrome.runtime.onStartup.addListener(() => {
    resyncPersistentScripts()
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && STORAGE_SCRIPTS in changes) {
        resyncPersistentScripts()
    }
})

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage()
})
