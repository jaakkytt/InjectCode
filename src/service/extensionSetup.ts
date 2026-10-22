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

export function openExtensionSettings() {
    return chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` })
}
