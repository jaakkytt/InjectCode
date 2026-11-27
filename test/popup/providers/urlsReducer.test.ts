import { describe, expect, it } from 'vitest'

import { urlsRootReducer } from '../../../src/popup/providers/urlsReducer'
import { Script } from '../../../src/shared/types'
import { Action, StoreState } from '../../../src/popup/types'

const contentUpdate: Action = {
    name: 'scriptUpdate',
    containerId: 'https://example.com/*',
    scriptId: 'item-id',
    patch: { content: 'new content' },
}

describe('urlsRootReducer scriptUpdate - always-on edit downgrade guard', () => {
    it('downgrades an always-on item to active when its content changes', () => {
        const state = stateWith(makeItem({ runMode: 'always' }))

        const next = urlsRootReducer(state, {
            name: 'scriptUpdate',
            containerId: 'https://example.com/*',
            scriptId: 'item-id',
            patch: { content: 'new content' },
        })

        const item = itemAfter(next)

        expect(item.runMode).toBe('active')
        expect(item.content).toBe('new content')
    })

    it('does not downgrade when the content patch is identical to the current content', () => {
        const state = stateWith(makeItem({ runMode: 'always', content: 'same' }))

        const next = urlsRootReducer(state, {
            name: 'scriptUpdate',
            containerId: 'https://example.com/*',
            scriptId: 'item-id',
            patch: { content: 'same' },
        })

        expect(itemAfter(next).runMode).toBe('always')
    })

    it('does not downgrade on a title-only patch', () => {
        const state = stateWith(makeItem({ runMode: 'always' }))

        const next = urlsRootReducer(state, {
            name: 'scriptUpdate',
            containerId: 'https://example.com/*',
            scriptId: 'item-id',
            patch: { title: 'renamed' },
        })

        const item = itemAfter(next)

        expect(item.runMode).toBe('always')
        expect(item.title).toBe('renamed')
    })

    it('leaves active/disabled items alone on a content change', () => {
        const state = stateWith(makeItem({ runMode: 'active' }))

        const next = urlsRootReducer(state, {
            name: 'scriptUpdate',
            containerId: 'https://example.com/*',
            scriptId: 'item-id',
            patch: { content: 'new content' },
        })

        expect(itemAfter(next).runMode).toBe('active')
    })

    it('defers to an explicit runMode included in the same patch instead of auto-downgrading', () => {
        const state = stateWith(makeItem({ runMode: 'always' }))

        const next = urlsRootReducer(state, {
            name: 'scriptUpdate',
            containerId: 'https://example.com/*',
            scriptId: 'item-id',
            patch: { content: 'new content', runMode: 'disabled' },
        })

        expect(itemAfter(next).runMode).toBe('disabled')
    })
})

describe('urlsRootReducer script edits during a drag', () => {
    it('keeps an edit saved during a drag after the drag is cancelled', () => {
        const next = reduceAll(stateWith(makeItem()), [{ name: 'dragStart' }, contentUpdate, { name: 'dragCancel' }])

        expect(itemAfter(next).content).toBe('new content')
    })

    it('keeps an edit saved during a drag after the drop', () => {
        const next = reduceAll(stateWith(makeItem()), [{ name: 'dragStart' }, contentUpdate, { name: 'dragDrop' }])

        expect(itemAfter(next).content).toBe('new content')
    })
})

describe('urlsRootReducer URL block order', () => {
    it('adds a URL block at its alphabetical place below Shared', () => {
        const next = urlsRootReducer(stateWithUrlBlocks(['Shared', 'https://a.com/*']), {
            name: 'added',
            id: '*://test.com/',
        })

        expect(Object.keys(next.committed)).toEqual(['Shared', '*://test.com/', 'https://a.com/*'])
    })

    it('moves Shared first on rename even when it was not first', () => {
        const next = urlsRootReducer(stateWithUrlBlocks(['*://test.com/', 'Shared', 'https://a.com/*']), {
            name: 'renamed',
            id: 'https://a.com/*',
            title: 'https://b.com/*',
        })

        expect(Object.keys(next.committed)).toEqual(['Shared', '*://test.com/', 'https://b.com/*'])
    })
})

function makeItem(overrides: Partial<Script> = {}): Script {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? 'original content',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}

function stateWith(item: Script): StoreState {
    return {
        committed: { 'https://example.com/*': [item] },
        working: null,
        isDirty: false,
        isHydrated: true,
    }
}

function stateWithUrlBlocks(urlBlockIds: string[]): StoreState {
    return {
        committed: Object.fromEntries(urlBlockIds.map(id => [id, []])),
        working: null,
        isDirty: false,
        isHydrated: true,
    }
}

function itemAfter(state: StoreState, containerId = 'https://example.com/*', scriptId = 'item-id') {
    return state.committed[containerId].find(i => i.id === scriptId)!
}

function reduceAll(state: StoreState, actions: Action[]): StoreState {
    return actions.reduce(urlsRootReducer, state)
}
