import { describe, expect, it } from 'vitest'

import { TabIndex } from '../../../../src/popup/types'
import { LastUsedState, ViewRestoreEntry } from '../../../../src/popup/service/viewRestore/viewRestore.types'
import {
    cacheKeyFor,
    editorScrollTopOf,
    MAX_CACHE_ENTRIES,
    MAX_EDITOR_SCROLLS,
    parseViewRestoreCache,
    withEditorScroll,
    withEntry,
} from '../../../../src/popup/service/viewRestore/viewRestoreCache'

const SESSION = 'session-1'

const LAST_USED: LastUsedState = {
    view: TabIndex.All,
    accordions: { openCodeBlock: 'js-1', closedUrlBlocks: ['Shared'] },
}

describe('cacheKeyFor', () => {
    it('uses the host with port for sameHost', () => {
        expect(cacheKeyFor('sameHost', { pageUrl: new URL('http://localhost:3000/a') })).toBe('host:localhost:3000')
    })

    it('shares one key for all file pages', () => {
        expect(cacheKeyFor('sameHost', { pageUrl: new URL('file:///tmp/a.html') })).toBe('host:file:')
    })
})

describe('parseViewRestoreCache', () => {
    it('skips malformed entries and falls back on garbage', () => {
        const entries = [{ key: 1 }, entry('host:a')]
        const raw = { mode: 'sameHost', sessionId: SESSION, lastUsed: LAST_USED, entries }

        expect(parseViewRestoreCache(raw, 'sameHost', SESSION).entries).toEqual([entry('host:a')])
        expect(parseViewRestoreCache('nope', 'sameHost', SESSION).entries).toEqual([])
    })

    it('keeps editor scrolls when the mode and session change', () => {
        const editorScrolls = [{ scriptId: 'js-1', scrollTop: 120 }]
        const entries = [entry('host:a')]
        const raw = { mode: 'sameHost', sessionId: SESSION, lastUsed: LAST_USED, editorScrolls, entries }

        const cache = parseViewRestoreCache(raw, 'off', 'session-2')

        expect(cache.entries).toEqual([])
        expect(editorScrollTopOf(cache, 'js-1')).toBe(120)
    })
})

describe('withEditorScroll', () => {
    it('remembers one scroll per code block and forgets it at the top', () => {
        let cache = parseViewRestoreCache({}, 'sameHost', SESSION)
        cache = withEditorScroll(cache, 'js-1', 120)
        cache = withEditorScroll(cache, 'js-2', 40)
        cache = withEditorScroll(cache, 'js-1', 0)

        expect(cache.editorScrolls).toEqual([{ scriptId: 'js-2', scrollTop: 40 }])
        expect(editorScrollTopOf(cache, 'js-1')).toBe(0)
    })

    it('evicts the least recently scrolled code block', () => {
        let cache = parseViewRestoreCache({}, 'sameHost', SESSION)
        for (let index = 0; index <= MAX_EDITOR_SCROLLS; index++) {
            cache = withEditorScroll(cache, `js-${index}`, 10)
        }

        expect(cache.editorScrolls).toHaveLength(MAX_EDITOR_SCROLLS)
        expect(editorScrollTopOf(cache, 'js-0')).toBe(0)
    })
})

describe('withEntry', () => {
    it('moves the entry to the front and evicts the oldest', () => {
        const keys = Array.from({ length: MAX_CACHE_ENTRIES }, (_, i) => `host:${i}`)
        let cache = parseViewRestoreCache({}, 'sameHost', SESSION)
        keys.forEach(key => cache = withEntry(cache, entry(key)))

        cache = withEntry(cache, entry('host:0'))
        cache = withEntry(cache, entry('host:new'))

        expect(cache.entries).toHaveLength(MAX_CACHE_ENTRIES)
        expect(cache.entries.slice(0, 2).map(e => e.key)).toEqual(['host:new', 'host:0'])
        expect(cache.entries.map(e => e.key)).not.toContain('host:1')
    })
})

function entry(key: string): ViewRestoreEntry {
    return {
        key,
        view: TabIndex.Current,
        accordions: { openCodeBlock: null, closedUrlBlocks: [] },
        lastInteraction: { kind: 'codeBlock', id: 'js-1', urlBlockId: '*://a/*', top: 42, selection: null },
    }
}
