export async function isUserScriptsEnabled(): Promise<boolean> {
    try {
        await chrome.userScripts.getScripts()
        return true
    } catch {
        return false
    }
}
