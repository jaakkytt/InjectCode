import { AccordionItemData, ItemsDataState, RunScope } from '../types'
import { USER_SCRIPT_ID } from '../constants'
import { urlPatternMatcher } from './urlPatternMatcher'

export interface ScriptApi {
    run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope): Promise<void>
}

export interface InjectionPayload {
    js: string[]
    css: string[]
}

export function selectItemsForUrl(scripts: ItemsDataState, url: string): AccordionItemData[] {
    return Object.entries(scripts)
        .filter(([pattern]) => {
            const matcher = urlPatternMatcher(pattern)
            return matcher.valid && matcher.match(url)
        })
        .flatMap(([, items]) => items)
}

export function buildInjectionPayload(items: AccordionItemData[], shared: AccordionItemData[]): InjectionPayload {
    const ordered = [...shared, ...items]
    return {
        js: ordered.filter(item => item.type === 'js').map(item => item.content),
        css: ordered.filter(item => item.type === 'css').map(item => item.content),
    }
}

function describeTab(tab: chrome.tabs.Tab) {
    return `tab ${tab.id ?? 'unknown'} (${tab.url ?? 'unknown url'})`
}

async function injectIntoTab(tab: chrome.tabs.Tab, payload: InjectionPayload) {
    if (!tab.id) {
        console.error(`Skipped injection: tab ID is not available for ${describeTab(tab)}`)
        return
    }

    try {
        if (payload.js.length > 0) {
            const [firstCode, ...restCode] = payload.js
            await chrome.userScripts.execute({
                target: { tabId: tab.id },
                worldId: USER_SCRIPT_ID,
                js: [{ code: firstCode }, ...restCode.map(code => ({ code }))],
            })
        }

        for (const css of payload.css) {
            await chrome.scripting.insertCSS({ target: { tabId: tab.id }, css })
        }
    } catch (err) {
        console.error(`Failed to run scripts on ${describeTab(tab)}:`, err)
    }
}

async function runOnTabsMatching(pattern: string, items: AccordionItemData[], shared: AccordionItemData[]) {
    const payload = buildInjectionPayload(items, shared)
    if (payload.js.length === 0 && payload.css.length === 0) {
        return
    }

    const tabs = await chrome.tabs.query({ url: pattern })
    await Promise.all(tabs.map(tab => injectIntoTab(tab, payload)))
}

async function runOnActiveTab(scripts: ItemsDataState, shared: AccordionItemData[]) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id || !tab.url) {
        console.error('No active tab found.')
        return
    }

    const items = selectItemsForUrl(scripts, tab.url)
    const payload = buildInjectionPayload(items, shared)
    if (payload.js.length === 0 && payload.css.length === 0) {
        return
    }

    await injectIntoTab(tab, payload)
}

export class ChromeScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope) {
        if (scope === 'global') {
            await Promise.all(
                Object.entries(scripts).map(([pattern, items]) => runOnTabsMatching(pattern, items, shared)),
            )
            return
        }

        await runOnActiveTab(scripts, shared)
    }
}

export class DummyScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.debug('DummyScriptAPI run', shared, scripts, scope)
    }
}

export const scriptApi: ScriptApi = typeof chrome !== 'undefined' && chrome.scripting ? new ChromeScriptAPI() : new DummyScriptAPI()
