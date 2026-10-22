import { storage } from './service/storageApi'
import { createSerializedPersistentScriptsSync } from './service/persistentScripts'
import { readAlwaysOnTiming } from './service/alwaysOnTiming'
import { SHARED_CODE, STORAGE_ALWAYS_ON_TIMING, STORAGE_SCRIPTS } from './constants'

const resyncPersistentScripts = createSerializedPersistentScriptsSync(async () => ({
    scripts: await storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] }),
    runAt: await readAlwaysOnTiming(),
}))

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
    if (areaName === 'local' && (STORAGE_SCRIPTS in changes || STORAGE_ALWAYS_ON_TIMING in changes)) {
        resyncPersistentScripts()
    }
})
