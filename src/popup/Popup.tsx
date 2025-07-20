import React from 'react'
import UserScripts from '../components/UserScripts'

const USER_SCRIPT_ID = 'default'

const Popup = () => {

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
        const pat = 'https://github.com/*'
        const { script } = await chrome.storage.local.get({
            script: 'alert(\'hi\');',
        })
        await runMatching(pat, script, USER_SCRIPT_ID)
    }

    const handleRunCurrent = async () => {
        const { script } = await chrome.storage.local.get({
            script: 'alert(\'hi\');',
        })
        await runActive(script, USER_SCRIPT_ID)
    }

    return <>
        <button type="button" onClick={handleRunAll}>Run on all tabs</button>
        <button type="button" onClick={handleRunCurrent}>Run on current tab</button>
        <UserScripts />
    </>
}

export default Popup
