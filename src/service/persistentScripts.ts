import { AccordionItemData, ItemsDataState } from '../types'
import { SHARED_CODE, USER_SCRIPT_ID } from '../constants'
import { urlPatternMatcher } from './urlPatternMatcher'
import { cyrb53 } from '../lib/hash/cyrb53'
import { AlwaysOnTiming, DEFAULT_ALWAYS_ON_TIMING } from './alwaysOnTiming'

export interface PersistentScriptsState {
    scripts: ItemsDataState
    runAt: AlwaysOnTiming
}

export function wrapCssAsUserScript(css: string): string {
    return `(() => {
        const s = document.createElement('style');
        s.textContent = ${JSON.stringify(css)};
        document.head.appendChild(s);
    })();`
}

function toScriptSources(items: AccordionItemData[]): chrome.userScripts.ScriptSource[] {
    return items.map(item => ({
        code: item.type === 'css' ? wrapCssAsUserScript(item.content) : item.content,
    }))
}

function idForPattern(pattern: string): string {
    return `always-${cyrb53(pattern).toString(36)}`
}

export function computeDesiredRegistrations(
    scripts: ItemsDataState,
    runAt: AlwaysOnTiming = DEFAULT_ALWAYS_ON_TIMING,
): chrome.userScripts.RegisteredUserScript[] {
    const sharedAlways = (scripts[SHARED_CODE] ?? []).filter(item => item.runMode === 'always')

    return Object.entries(scripts)
        .filter(([containerId]) => containerId !== SHARED_CODE)
        .flatMap(([pattern, items]): chrome.userScripts.RegisteredUserScript[] => {
            const ownAlways = items.filter(item => item.runMode === 'always')
            if (ownAlways.length === 0) {
                return []
            }

            const matcher = urlPatternMatcher(pattern)
            if (!matcher.valid) {
                return []
            }

            return [{
                id: idForPattern(pattern),
                matches: [pattern],
                runAt,
                world: 'USER_SCRIPT',
                worldId: USER_SCRIPT_ID,
                js: toScriptSources([...sharedAlways, ...ownAlways]),
            }]
        })
}

export async function syncPersistentScripts(
    scripts: ItemsDataState,
    runAt: AlwaysOnTiming = DEFAULT_ALWAYS_ON_TIMING,
): Promise<void> {
    const desired = computeDesiredRegistrations(scripts, runAt)
    try {
        await chrome.userScripts.unregister()
        if (desired.length > 0) {
            await chrome.userScripts.register(desired)
        }
    } catch (err) {
        console.error('Failed to sync persistent (always on) scripts:', err)
    }
}

export function createSerializedPersistentScriptsSync(
    readState: () => Promise<PersistentScriptsState>,
): () => Promise<void> {
    let running: Promise<void> | null = null
    let rerunRequested = false

    async function syncLatest() {
        try {
            const { scripts, runAt } = await readState()
            await syncPersistentScripts(scripts, runAt)
        } catch (err) {
            console.error('Failed to read scripts for persistent-script resync:', err)
        }
    }

    async function drain() {
        do {
            rerunRequested = false
            await syncLatest()
        } while (rerunRequested)

        running = null
    }

    return function requestSync() {
        if (running) {
            rerunRequested = true
            return running
        }

        running = drain()
        return running
    }
}
