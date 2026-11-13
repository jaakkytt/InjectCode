import { LOCAL_STORAGE_VIEW_RESTORE, SESSION_STORAGE_BROWSER_SESSION_ID } from '../../../shared/constants'
import { readViewRestoreMode } from '../../../shared/service/settings/viewRestoreMode'
import { ViewRestoreController, ViewRestoreEnvironment } from './viewRestoreController'
import { openViewRestoreStore, ViewRestorePorts } from './viewRestoreStore'
import { BrowserTabLocation, ViewRestoreCache } from './viewRestore.types'

const NO_SESSION = 'no-session'

export const browserStorePorts: ViewRestorePorts = {
    readMode: readViewRestoreMode,
    readSessionId: readBrowserSessionId,
    readCache: () => {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_VIEW_RESTORE) ?? 'null')
        } catch {
            return null
        }
    },
    writeCache: (cache: ViewRestoreCache) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_VIEW_RESTORE, JSON.stringify(cache))
        } catch (error) {
            console.error('Failed to save the popup view state:', error)
        }
    },
}

export const browserEnvironment: ViewRestoreEnvironment = {
    requestFrame: (callback) => requestAnimationFrame(callback),
    afterCurrentTask: (callback) => setTimeout(callback),
    popupHasFocus: () => document.hasFocus(),
    scrollPageBy: (deltaY) => window.scrollBy(0, deltaY),
}

export function openBrowserViewRestoreStore(location: BrowserTabLocation) {
    return openViewRestoreStore(location, browserStorePorts)
}

export function bindToDocument(controller: ViewRestoreController): () => void {
    function flushWhenHidden() {
        if (document.visibilityState === 'hidden') {
            controller.flush()
        }
    }

    document.addEventListener('visibilitychange', flushWhenHidden)

    return () => document.removeEventListener('visibilitychange', flushWhenHidden)
}

async function readBrowserSessionId(): Promise<string> {
    const session = typeof chrome !== 'undefined' ? chrome.storage?.session : undefined
    if (!session) {
        return NO_SESSION
    }

    const stored = (await session.get(SESSION_STORAGE_BROWSER_SESSION_ID))[SESSION_STORAGE_BROWSER_SESSION_ID]
    if (typeof stored === 'string') {
        return stored
    }

    const created = crypto.randomUUID()
    await session.set({ [SESSION_STORAGE_BROWSER_SESSION_ID]: created })

    return created
}
