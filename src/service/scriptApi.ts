import { ItemsDataState, RunScope } from '../types'
// import { USER_SCRIPT_ID } from '../constants'

export interface ScriptApi {
    run(scripts: ItemsDataState, scope: RunScope): Promise<void>
}

export class ChromeScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, scope: RunScope) {
        console.debug('ChromeScriptAPI run', scripts, scope)
    }
}

export class DummyScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, scope: RunScope) {
        console.debug('DummyScriptAPI run', scripts, scope)
    }
}

export const scriptApi: ScriptApi = typeof chrome !== 'undefined' && chrome.scripting ? new ChromeScriptAPI() : new DummyScriptAPI()

// async function runMatching(pattern: string, sourceCode: string, scriptId: string) {
//     const tabs = await chrome.tabs.query({ url: pattern })
//     for (const tab of tabs) {
//         if (!tab.id) {
//             console.error('Tab ID is not available.')
//             continue
//         }
//         await chrome.userScripts.execute({
//             target: { tabId: tab.id },
//             worldId: scriptId,
//             js: [{ code: sourceCode }],
//         })
//     }
// }
//
// async function runActive(sourceCode: string, scriptId: string) {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
//     if (!tab || !tab.id) {
//         console.error('No active tab found.')
//         return
//     }
//     await chrome.userScripts.execute({
//         target: { tabId: tab.id },
//         worldId: scriptId,
//         js: [{ code: sourceCode }],
//     })
// }
//
// const handleRunAll = async () => {
//     console.log('Running script on all tabs matching pattern...')
//     const pat = 'https://github.com/*'
//     const { script } = await chrome.storage.local.get({
//         script: 'alert(\'hi1\');',
//     })
//     await runMatching(pat, script, USER_SCRIPT_ID)
// }
//
// const handleRunCurrent = async () => {
//     console.log('Running script on current tab...')
//     const { script } = await chrome.storage.local.get({
//         script: 'alert(\'hi2\');',
//     })
//     await runActive(script, USER_SCRIPT_ID)
// }
