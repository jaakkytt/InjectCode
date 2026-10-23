import { AccordionItemData, ItemsDataState, RunScope } from '../types'
import { USER_SCRIPT_ID } from '../constants'
import { urlPatternMatcher } from './urlPatternMatcher'

export interface ScriptApi {
    run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope, timeoutMs: number): Promise<RunResult>
}

export type TabRunOutcome = 'executed' | 'failed' | 'timedOut'

export interface RunResult {
    executed: number
    failed: number
    timedOut: number
}

interface InjectionPayload {
    js: string[]
    css: string[]
}

function selectItemsForUrl(scripts: ItemsDataState, url: string): AccordionItemData[] {
    return Object.entries(scripts)
        .filter(([pattern]) => {
            const matcher = urlPatternMatcher(pattern)
            return matcher.valid && matcher.match(url)
        })
        .flatMap(([, items]) => items)
}

function buildInjectionPayload(items: AccordionItemData[], shared: AccordionItemData[]): InjectionPayload {
    const ordered = [...shared, ...items]
    return {
        js: ordered.filter(item => item.type === 'js').map(item => item.content),
        css: ordered.filter(item => item.type === 'css').map(item => item.content),
    }
}

function describeTab(tab: chrome.tabs.Tab) {
    return `tab ${tab.id ?? 'unknown'} (${tab.url ?? 'unknown url'})`
}

function countOutcomes(outcomes: (TabRunOutcome | null)[]): RunResult {
    return {
        executed: outcomes.filter(outcome => outcome === 'executed').length,
        failed: outcomes.filter(outcome => outcome === 'failed').length,
        timedOut: outcomes.filter(outcome => outcome === 'timedOut').length,
    }
}

async function injectIntoTab(tab: chrome.tabs.Tab, payload: InjectionPayload): Promise<TabRunOutcome> {
    if (!tab.id) {
        console.error(`Skipped injection: tab ID is not available for ${describeTab(tab)}`)
        return 'failed'
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

        return 'executed'
    } catch (err) {
        console.error(`Failed to run scripts on ${describeTab(tab)}:`, err)
        return 'failed'
    }
}

async function injectWithTimeout(
    tab: chrome.tabs.Tab,
    payload: InjectionPayload,
    timeoutMs: number,
): Promise<TabRunOutcome> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<TabRunOutcome>((resolve) => {
        timer = setTimeout(() => {
            console.warn(`Timed out after ${timeoutMs}ms on ${describeTab(tab)}`)
            resolve('timedOut')
        }, timeoutMs)
    })

    try {
        return await Promise.race([injectIntoTab(tab, payload), timeout])
    } finally {
        clearTimeout(timer)
    }
}

async function injectMatchingItems(
    tab: chrome.tabs.Tab,
    scripts: ItemsDataState,
    shared: AccordionItemData[],
    timeoutMs: number,
): Promise<TabRunOutcome | null> {
    if (!tab.url) {
        return null
    }

    const items = selectItemsForUrl(scripts, tab.url)
    if (items.length === 0) {
        return null
    }

    const payload = buildInjectionPayload(items, shared)
    if (payload.js.length === 0 && payload.css.length === 0) {
        return null
    }

    return injectWithTimeout(tab, payload, timeoutMs)
}

async function runOnActiveTab(scripts: ItemsDataState, shared: AccordionItemData[], timeoutMs: number) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id || !tab.url) {
        console.error('No active tab found.')
        return countOutcomes([])
    }

    return countOutcomes([await injectMatchingItems(tab, scripts, shared, timeoutMs)])
}

async function runOnAllTabs(scripts: ItemsDataState, shared: AccordionItemData[], timeoutMs: number) {
    const tabs = await chrome.tabs.query({ discarded: false, frozen: false })
    return countOutcomes(await Promise.all(tabs.map(tab => injectMatchingItems(tab, scripts, shared, timeoutMs))))
}

export class ChromeScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope, timeoutMs: number) {
        if (scope === 'global') {
            return runOnAllTabs(scripts, shared, timeoutMs)
        }

        return runOnActiveTab(scripts, shared, timeoutMs)
    }
}

export class DummyScriptAPI implements ScriptApi {
    async run(scripts: ItemsDataState, shared: AccordionItemData[], scope: RunScope, timeoutMs: number) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.debug('DummyScriptAPI run', shared, scripts, scope, timeoutMs)
        return { executed: 1, failed: 0, timedOut: 0 }
    }
}

export const scriptApi: ScriptApi = typeof chrome !== 'undefined' && chrome.scripting
    ? new ChromeScriptAPI()
    : new DummyScriptAPI()
