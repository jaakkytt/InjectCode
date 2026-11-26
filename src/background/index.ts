import { storage } from '../shared/service/storageApi'
import { createSerializedPersistentScriptsSync } from './service/persistentScripts'
import { readAlwaysOnTiming } from '../shared/service/settings/alwaysOnTiming'
import { MESSAGE_RESYNC_ALWAYS_ON, SHARED_CODE, STORAGE_ALWAYS_ON_TIMING, STORAGE_SCRIPTS } from '../shared/constants'

const resyncPersistentScripts = createSerializedPersistentScriptsSync(async () => ({
    scripts: await storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] }),
    runAt: await readAlwaysOnTiming(),
}))

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
    const isFromV1 = reason == chrome.runtime.OnInstalledReason.UPDATE && previousVersion?.startsWith('1.')

    if (reason == chrome.runtime.OnInstalledReason.INSTALL || isFromV1) {
        chrome.runtime.openOptionsPage()
    }

    resyncPersistentScripts()
})

chrome.runtime.onStartup.addListener(() => {
    resyncPersistentScripts()
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (STORAGE_SCRIPTS in changes || STORAGE_ALWAYS_ON_TIMING in changes)) {
        resyncPersistentScripts()
    }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message !== MESSAGE_RESYNC_ALWAYS_ON) {
        return false
    }

    resyncPersistentScripts().then(succeeded => sendResponse(succeeded))
    return true
})
