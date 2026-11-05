import { ALL_URL, MESSAGE_RESYNC_ALWAYS_ON } from '../../shared/constants'
import { isUserScriptsEnabled } from '../../shared/service/userScripts'

export async function requestAlwaysOnResync(): Promise<boolean> {
    if (!await isUserScriptsEnabled()) {
        return false
    }

    await chrome.runtime.sendMessage(MESSAGE_RESYNC_ALWAYS_ON)
    return true
}

export async function isFileAccessEnabled(): Promise<boolean> {
    try {
        return await chrome.extension.isAllowedFileSchemeAccess()
    } catch {
        return false
    }
}

export type SiteAccess = 'allSites' | 'specificSites' | 'onClick'

function siteAccessFromOrigins(origins: string[]): SiteAccess {
    const siteOrigins = origins.filter(origin => !origin.startsWith('file:'))

    if (siteOrigins.includes(ALL_URL)) {
        return 'allSites'
    }

    return siteOrigins.length > 0 ? 'specificSites' : 'onClick'
}

export async function readSiteAccess(): Promise<SiteAccess> {
    const { origins = [] } = await chrome.permissions.getAll()
    return siteAccessFromOrigins(origins)
}

export function onSiteAccessChange(listener: () => void): () => void {
    chrome.permissions.onAdded.addListener(listener)
    chrome.permissions.onRemoved.addListener(listener)

    return () => {
        chrome.permissions.onAdded.removeListener(listener)
        chrome.permissions.onRemoved.removeListener(listener)
    }
}

export function openExtensionSettings() {
    return chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` })
}

export function openExtensionErrors() {
    return chrome.tabs.create({ url: `chrome://extensions/?errors=${chrome.runtime.id}` })
}
