import { describe, expect, it } from 'vitest'
import { AccordionItemData, StoreState } from '../../src/types'
import { urlsRootReducer } from '../../src/providers/urlsReducer'

function makeItem(overrides: Partial<AccordionItemData> = {}): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? 'original content',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}

function stateWith(item: AccordionItemData): StoreState {
    return {
        committed: { 'https://example.com/*': [item] },
        working: null,
        isDirty: false,
    }
}

function itemAfter(state: StoreState, containerId = 'https://example.com/*', scriptId = 'item-id') {
    return state.committed[containerId].find(i => i.id === scriptId)!
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
