import { describe, expect, it } from 'vitest'

import { orderUrlBlocks } from '../../../src/popup/lib/urlBlockOrder'

describe('orderUrlBlocks', () => {
    it('puts Shared first and sorts the other URL blocks', () => {
        const chromeStorageOrder = { '*://test.com/': [], '<all_urls>': [], Shared: [], 'https://a.com/*': [] }

        expect(Object.keys(orderUrlBlocks(chromeStorageOrder))).toEqual([
            'Shared',
            '*://test.com/',
            '<all_urls>',
            'https://a.com/*',
        ])
    })
})
