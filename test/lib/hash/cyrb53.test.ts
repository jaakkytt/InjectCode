import { describe, expect, it } from 'vitest'
import { cyrb53 } from '../../../src/lib/hash/cyrb53'

describe('cyrb53', () => {
    it('matches reference outputs of the canonical implementation', () => {
        expect(cyrb53('a')).toBe(7929297801672961)
        expect(cyrb53('https://github.com/*')).toBe(parseInt('1zb9jfumq2a', 36))
    })

    it('stays within the safe integer range', () => {
        expect(Number.isSafeInteger(cyrb53('*://*/*'))).toBe(true)
    })

    it('matches the canonical output for a non-default seed', () => {
        expect(cyrb53('a', 1)).toBe(5368154436228575)
    })
})
