import type { InputSelection } from 'prism-react-editor'
import { ViewRestoreMode } from '../../../shared/service/settings/viewRestoreMode'
import { withUrlBlockRenamed } from '../../lib/accordionState'
import { TabIndex } from '../../types'
import {
    AccordionState,
    BrowserTabLocation,
    EditorViewState,
    LastInteraction,
    LastUsedState,
    ViewRestoreCache,
    ViewRestoreEntry,
} from './viewRestore.types'

export const MAX_CACHE_ENTRIES = 20

export const DEFAULT_LAST_USED: LastUsedState = {
    view: TabIndex.Current,
    accordions: { openCodeBlock: null, closedUrlBlocks: [] },
}

const INTERACTION_KINDS = ['editor', 'codeBlock', 'urlBlock']
const SELECTION_DIRECTIONS = ['forward', 'backward', 'none']

export function cacheKeyFor(mode: ViewRestoreMode, { browserTabId, pageUrl }: BrowserTabLocation): string | null {
    if (mode === 'sameTab') {
        return browserTabId === undefined ? null : `tab:${browserTabId}`
    }
    if (mode === 'sameHost') {
        return pageUrl ? `host:${pageUrl.host || pageUrl.protocol}` : null
    }
    return null
}

export function emptyCache(mode: ViewRestoreMode, sessionId: string): ViewRestoreCache {
    return { mode, sessionId, lastUsed: DEFAULT_LAST_USED, entries: [] }
}

export function parseViewRestoreCache(raw: unknown, mode: ViewRestoreMode, sessionId: string): ViewRestoreCache {
    if (!isRecord(raw)) {
        return emptyCache(mode, sessionId)
    }

    const lastUsed = isLastUsedState(raw.lastUsed) ? raw.lastUsed : DEFAULT_LAST_USED
    const isSameContext = raw.mode === mode && raw.sessionId === sessionId
    const entries = isSameContext && Array.isArray(raw.entries) ? raw.entries.filter(isViewRestoreEntry) : []

    return { mode, sessionId, lastUsed, entries: entries.slice(0, MAX_CACHE_ENTRIES) }
}

export function findEntry(cache: ViewRestoreCache, key: string | null): ViewRestoreEntry {
    const existing = key === null ? undefined : cache.entries.find(entry => entry.key === key)

    return existing ?? { key: key ?? '', ...cache.lastUsed, lastInteraction: null }
}

export function withEntry(cache: ViewRestoreCache, entry: ViewRestoreEntry): ViewRestoreCache {
    const others = cache.entries.filter(existing => existing.key !== entry.key)

    return { ...cache, entries: [entry, ...others].slice(0, MAX_CACHE_ENTRIES) }
}

export function withLastUsed(cache: ViewRestoreCache, { view, accordions }: LastUsedState): ViewRestoreCache {
    return { ...cache, lastUsed: { view, accordions } }
}

export function renameUrlBlockInEntry(entry: ViewRestoreEntry, oldId: string, newId: string): ViewRestoreEntry {
    const rename = (id: string) => id === oldId ? newId : id
    const { lastInteraction } = entry

    return {
        ...entry,
        accordions: withUrlBlockRenamed(entry.accordions, oldId, newId),
        lastInteraction: lastInteraction && {
            ...lastInteraction,
            id: lastInteraction.kind === 'urlBlock' ? rename(lastInteraction.id) : lastInteraction.id,
            urlBlockId: rename(lastInteraction.urlBlockId),
        },
    }
}

function isViewRestoreEntry(value: unknown): value is ViewRestoreEntry {
    return isRecord(value)
        && typeof value.key === 'string'
        && isLastUsedState(value)
        && (value.lastInteraction === null || isLastInteraction(value.lastInteraction))
}

function isLastUsedState(value: unknown): value is LastUsedState {
    return isRecord(value)
        && (value.view === TabIndex.Current || value.view === TabIndex.All)
        && isAccordionState(value.accordions)
}

function isAccordionState(value: unknown): value is AccordionState {
    return isRecord(value)
        && (value.openCodeBlock === null || typeof value.openCodeBlock === 'string')
        && Array.isArray(value.closedUrlBlocks)
        && value.closedUrlBlocks.every(id => typeof id === 'string')
}

function isLastInteraction(value: unknown): value is LastInteraction {
    return isRecord(value)
        && INTERACTION_KINDS.includes(value.kind as string)
        && typeof value.id === 'string'
        && typeof value.urlBlockId === 'string'
        && typeof value.top === 'number'
        && (value.editor === null || isEditorViewState(value.editor))
}

function isEditorViewState(value: unknown): value is EditorViewState {
    return isRecord(value) && typeof value.scrollTop === 'number' && isSelection(value.selection)
}

function isSelection(value: unknown): value is InputSelection {
    return Array.isArray(value)
        && value.length === 3
        && typeof value[0] === 'number'
        && typeof value[1] === 'number'
        && SELECTION_DIRECTIONS.includes(value[2])
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
