import { AccordionItemData, ItemsDataState } from '../types'
import { SHARED_CODE, USER_SCRIPT_ID } from '../constants'
import { urlPatternMatcher } from './urlPatternMatcher'

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
    let hash = 0
    for (let i = 0; i < pattern.length; i++) {
        hash = (hash * 31 + pattern.charCodeAt(i)) | 0
    }
    return `always-${(hash >>> 0).toString(36)}`
}

export function computeDesiredRegistrations(scripts: ItemsDataState): chrome.userScripts.RegisteredUserScript[] {
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
                world: 'USER_SCRIPT',
                worldId: USER_SCRIPT_ID,
                js: toScriptSources([...sharedAlways, ...ownAlways]),
            }]
        })
}

export async function syncPersistentScripts(scripts: ItemsDataState): Promise<void> {
    const desired = computeDesiredRegistrations(scripts)
    try {
        await chrome.userScripts.unregister()
        if (desired.length > 0) {
            await chrome.userScripts.register(desired)
        }
    } catch (err) {
        console.error('Failed to sync persistent (always on) scripts:', err)
    }
}
