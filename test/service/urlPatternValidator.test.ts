import { describe, expect, it } from 'vitest'
import { SHARED_CODE } from '../../src/constants'
import { urlPatternValidator } from '../../src/service/urlPatternValidator'

describe('urlPatternValidator', () => {
    it('accepts http, https and wildcard scheme patterns', () => {
        expect(urlPatternValidator('http://example.com/*', [])).toBeUndefined()
        expect(urlPatternValidator('https://example.com/*', [])).toBeUndefined()
        expect(urlPatternValidator('*://example.com/*', [])).toBeUndefined()
    })

    it('accepts a file pattern without consulting chrome', () => {
        expect(urlPatternValidator('file:///home/user/*', [])).toBeUndefined()
    })

    it('rejects a file pattern without a path', () => {
        expect(urlPatternValidator('file:///', [])).toBe('Pattern must also include a path')
    })

    it('rejects a malformed file scheme', () => {
        expect(urlPatternValidator('file://home/*', [])).toBe('A file scheme must start with "file:///"')
    })

    it('rejects an unknown scheme', () => {
        expect(urlPatternValidator('ws://example.com/*', [])).toMatch(/^Pattern must start with a scheme/)
    })

    it('rejects an empty pattern', () => {
        expect(urlPatternValidator('  ', [])).toBe('Pattern must follow the structure <scheme>://<host>/<path>')
    })

    it('rejects the reserved shared code key', () => {
        expect(urlPatternValidator(SHARED_CODE, [])).toBe(`"${SHARED_CODE}" is reserved and cannot be used`)
    })

    it('rejects a pattern that already exists', () => {
        expect(urlPatternValidator('https://example.com/*', ['https://example.com/*']))
            .toBe('"https://example.com/*" already exists')
    })

    it('rejects a host without a dot', () => {
        expect(urlPatternValidator('https://example/*', [])).toBe('Host must be a valid domain name or IP address')
    })
})
