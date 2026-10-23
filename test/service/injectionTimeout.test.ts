import { describe, expect, it } from 'vitest'
import { injectionTimeoutMs, parseInjectionTimeout } from '../../src/service/injectionTimeout'

describe('parseInjectionTimeout', () => {
    it('accepts positive numbers and numeric strings', () => {
        expect(parseInjectionTimeout(5)).toBe(5)
        expect(parseInjectionTimeout('0.5')).toBe(0.5)
        expect(parseInjectionTimeout('3600')).toBe(3600)
    })

    it('rejects zero, negatives and anything not a number', () => {
        expect(parseInjectionTimeout(0)).toBeNull()
        expect(parseInjectionTimeout('-1')).toBeNull()
        expect(parseInjectionTimeout('')).toBeNull()
        expect(parseInjectionTimeout('abc')).toBeNull()
        expect(parseInjectionTimeout(undefined)).toBeNull()
        expect(parseInjectionTimeout(Infinity)).toBeNull()
    })
})

describe('injectionTimeoutMs', () => {
    it('converts seconds to milliseconds', () => {
        expect(injectionTimeoutMs(5)).toBe(5000)
    })

    it('caps at the largest delay setTimeout supports', () => {
        expect(injectionTimeoutMs(1e9)).toBe(2_147_483_647)
    })
})
