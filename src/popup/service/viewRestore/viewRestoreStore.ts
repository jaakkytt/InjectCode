import { ViewRestoreMode } from '../../../shared/service/settings/viewRestoreMode'
import { BrowserTabLocation, ViewRestoreCache, ViewRestoreChange, ViewRestoreEntry } from './viewRestore.types'
import {
    cacheKeyFor,
    editorScrollTopOf,
    emptyCache,
    findEntry,
    parseViewRestoreCache,
    withEditorScroll,
    withEntry,
    withLastUsed,
} from './viewRestoreCache'

const DEFERRED_WRITE_DELAY_MS = 200

export interface ViewRestorePorts {
    readMode(): Promise<ViewRestoreMode>
    readSessionId(): Promise<string>
    readCache(): unknown
    writeCache(cache: ViewRestoreCache): void
}

export interface ViewRestoreStore {
    readonly entry: ViewRestoreEntry
    editorScrollTop(scriptId: string): number
    update(change: ViewRestoreChange): void
    updateDeferred(change: ViewRestoreChange): void
    updateEditorScrollDeferred(scriptId: string, scrollTop: number): void
    flush(): void
}

export async function openViewRestoreStore(
    location: BrowserTabLocation,
    ports: ViewRestorePorts,
): Promise<ViewRestoreStore> {
    try {
        const [mode, sessionId] = await Promise.all([ports.readMode(), ports.readSessionId()])
        const cache = parseViewRestoreCache(ports.readCache(), mode, sessionId)

        return createViewRestoreStore(cache, cacheKeyFor(mode, location), ports.writeCache)
    } catch (error) {
        console.error('Failed to open the popup view state, using defaults:', error)

        return createViewRestoreStore(emptyCache('off', ''), null, () => undefined)
    }
}

function createViewRestoreStore(
    initialCache: ViewRestoreCache,
    key: string | null,
    writeCache: (cache: ViewRestoreCache) => void,
): ViewRestoreStore {
    let cache = initialCache
    let entry = findEntry(cache, key)
    let hasPendingWrite = false
    let hasPendingLastUsed = false
    let deferredTimer: ReturnType<typeof setTimeout> | undefined

    function apply(change: ViewRestoreChange) {
        entry = { ...entry, ...change }
        hasPendingWrite = true
        hasPendingLastUsed ||= 'view' in change || 'accordions' in change
    }

    function scheduleFlush() {
        deferredTimer ??= setTimeout(flush, DEFERRED_WRITE_DELAY_MS)
    }

    function flush() {
        clearTimeout(deferredTimer)
        deferredTimer = undefined

        if (!hasPendingWrite) {
            return
        }

        if (hasPendingLastUsed) {
            cache = withLastUsed(cache, entry)
        }
        if (key !== null) {
            cache = withEntry(cache, entry)
        }

        hasPendingWrite = false
        hasPendingLastUsed = false

        writeCache(cache)
    }

    return {
        get entry() {
            return entry
        },
        editorScrollTop: (scriptId: string) => editorScrollTopOf(cache, scriptId),
        update: (change: ViewRestoreChange) => {
            apply(change)
            flush()
        },
        updateDeferred: (change: ViewRestoreChange) => {
            apply(change)
            scheduleFlush()
        },
        updateEditorScrollDeferred: (scriptId: string, scrollTop: number) => {
            cache = withEditorScroll(cache, scriptId, scrollTop)
            hasPendingWrite = true

            scheduleFlush()
        },
        flush,
    }
}
