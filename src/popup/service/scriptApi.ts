import { USER_SCRIPT_ID } from '../../shared/constants'
import { NO_INJECTION_TIMEOUT } from '../../shared/service/settings/injectionTimeout'
import { urlPatternMatcher } from '../../shared/service/urlPatternMatcher'
import { RunScope } from '../types'
import { Script, ScriptsByPattern } from '../../shared/types'

export interface ScriptApi {
    run(scripts: ScriptsByPattern, shared: Script[], scope: RunScope, timeoutMs: number): Promise<RunResult>
}

export type TabRunOutcome = 'executed' | 'failed' | 'timedOut'

export interface RunResult {
    executed: number
    failed: number
    timedOut: number
}

type InjectionStep =
    | { type: 'js', code: [string, ...string[]] }
    | { type: 'css', css: string }

export class ChromeScriptAPI implements ScriptApi {
    async run(scripts: ScriptsByPattern, shared: Script[], scope: RunScope, timeoutMs: number) {
        if (scope === 'global') {
            return runOnAllTabs(scripts, shared, timeoutMs)
        }

        return runOnActiveTab(scripts, shared, timeoutMs)
    }
}

export class DummyScriptAPI implements ScriptApi {
    async run(scripts: ScriptsByPattern, shared: Script[], scope: RunScope, timeoutMs: number) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.debug('DummyScriptAPI run', shared, scripts, scope, timeoutMs)
        return { executed: 1, failed: 0, timedOut: 0 }
    }
}

export const scriptApi: ScriptApi = typeof chrome !== 'undefined' && chrome.scripting
    ? new ChromeScriptAPI()
    : new DummyScriptAPI()

function selectItemsForUrl(scripts: ScriptsByPattern, url: string): Script[] {
    return Object.entries(scripts)
        .filter(([pattern]) => {
            const matcher = urlPatternMatcher(pattern)
            return matcher.valid && matcher.match(url)
        })
        .flatMap(([, items]) => items)
}

function buildInjectionSteps(items: Script[], shared: Script[]): InjectionStep[] {
    const steps: InjectionStep[] = []

    for (const item of [...shared, ...items]) {
        const previous = steps[steps.length - 1]

        if (item.type === 'css') {
            steps.push({ type: 'css', css: item.content })
        } else if (previous?.type === 'js') {
            previous.code.push(item.content)
        } else {
            steps.push({ type: 'js', code: [item.content] })
        }
    }

    return steps
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

async function injectIntoTab(tab: chrome.tabs.Tab, steps: InjectionStep[]): Promise<TabRunOutcome> {
    if (!tab.id) {
        console.error(`Skipped injection: tab ID is not available for ${describeTab(tab)}`)
        return 'failed'
    }

    try {
        for (const step of steps) {
            if (step.type === 'js') {
                const [firstCode, ...restCode] = step.code
                await chrome.userScripts.execute({
                    target: { tabId: tab.id },
                    worldId: USER_SCRIPT_ID,
                    js: [{ code: firstCode }, ...restCode.map(code => ({ code }))],
                })
            } else {
                await chrome.scripting.insertCSS({ target: { tabId: tab.id }, css: step.css })
            }
        }

        return 'executed'
    } catch (err) {
        console.error(`Failed to run scripts on ${describeTab(tab)}:`, err)
        return 'failed'
    }
}

async function injectWithTimeout(
    tab: chrome.tabs.Tab,
    steps: InjectionStep[],
    timeoutMs: number,
): Promise<TabRunOutcome> {
    if (timeoutMs === NO_INJECTION_TIMEOUT) {
        return injectIntoTab(tab, steps)
    }

    let timer: ReturnType<typeof setTimeout> | undefined

    const timeout = new Promise<TabRunOutcome>((resolve) => {
        timer = setTimeout(() => {
            console.warn(`Timed out after ${timeoutMs}ms on ${describeTab(tab)}`)
            resolve('timedOut')
        }, timeoutMs)
    })

    try {
        return await Promise.race([injectIntoTab(tab, steps), timeout])
    } finally {
        clearTimeout(timer)
    }
}

async function injectMatchingItems(
    tab: chrome.tabs.Tab,
    scripts: ScriptsByPattern,
    shared: Script[],
    timeoutMs: number,
): Promise<TabRunOutcome | null> {
    if (!tab.url) {
        return null
    }

    const items = selectItemsForUrl(scripts, tab.url)
    if (items.length === 0) {
        return null
    }

    const steps = buildInjectionSteps(items, shared)
    if (steps.length === 0) {
        return null
    }

    return injectWithTimeout(tab, steps, timeoutMs)
}

async function runOnActiveTab(scripts: ScriptsByPattern, shared: Script[], timeoutMs: number) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.id || !tab.url) {
        console.error('No active tab found.')
        return countOutcomes([])
    }

    return countOutcomes([await injectMatchingItems(tab, scripts, shared, timeoutMs)])
}

async function runOnAllTabs(scripts: ScriptsByPattern, shared: Script[], timeoutMs: number) {
    const tabs = await chrome.tabs.query({ discarded: false, frozen: false })

    const loadedTabs = tabs.filter(tab => tab.status !== 'unloaded')

    const outcomes = await Promise.all(loadedTabs.map(tab => injectMatchingItems(tab, scripts, shared, timeoutMs)))

    return countOutcomes(outcomes)
}
