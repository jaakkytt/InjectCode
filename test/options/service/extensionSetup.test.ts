import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readSiteAccess } from '../../../src/options/service/extensionSetup'

describe('readSiteAccess', () => {
    let grantedOrigins: string[]

    beforeEach(() => {
        grantedOrigins = []
        vi.stubGlobal('chrome', { permissions: { getAll: () => Promise.resolve({ origins: grantedOrigins }) } })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('reports all sites when <all_urls> is granted', async () => {
        grantedOrigins = ['<all_urls>']
        expect(await readSiteAccess()).toBe('allSites')
    })

    it('reports specific sites when only some sites are granted', async () => {
        grantedOrigins = ['http://jaak.kytt.ee/*']
        expect(await readSiteAccess()).toBe('specificSites')
    })

    it('reports on click when no site is granted', async () => {
        expect(await readSiteAccess()).toBe('onClick')
    })

    it('ignores file URL access when deciding site access', async () => {
        grantedOrigins = ['file:///*']
        expect(await readSiteAccess()).toBe('onClick')
    })
})
