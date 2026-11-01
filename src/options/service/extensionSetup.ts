import { ALL_URL } from '../../shared/constants'

export async function isUserScriptsEnabled(): Promise<boolean> {
    try {
        await chrome.userScripts.getScripts()
        return true
    } catch {
        return false
    }
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
