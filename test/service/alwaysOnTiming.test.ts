import { describe, expect, it } from 'vitest'
import { DEFAULT_ALWAYS_ON_TIMING, parseAlwaysOnTiming } from '../../src/service/alwaysOnTiming'

describe('parseAlwaysOnTiming', () => {
    it('keeps each supported timing as is', () => {
        expect(parseAlwaysOnTiming('document_start')).toBe('document_start')
        expect(parseAlwaysOnTiming('document_end')).toBe('document_end')
        expect(parseAlwaysOnTiming('document_idle')).toBe('document_idle')
    })

    it('falls back to the default for anything else', () => {
        expect(DEFAULT_ALWAYS_ON_TIMING).toBe('document_idle')
        expect(parseAlwaysOnTiming('document_later')).toBe(DEFAULT_ALWAYS_ON_TIMING)
        expect(parseAlwaysOnTiming(undefined)).toBe(DEFAULT_ALWAYS_ON_TIMING)
        expect(parseAlwaysOnTiming(42)).toBe(DEFAULT_ALWAYS_ON_TIMING)
    })
})
