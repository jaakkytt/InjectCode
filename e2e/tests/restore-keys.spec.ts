import { expect, test } from '../fixtures/extension'
import { SCRIPTS, SITE_B, TAB_A, TAB_A2, TAB_C } from '../fixtures/scripts'

const PAGE_SCROLL_Y = 150

test.describe('selected view and open blocks', () => {
    for (const mode of ['sameHost', 'sameTab'] as const) {
        test(`come back for the same browser tab, ${mode}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode(mode)

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView('All Scripts')
            await popup.toggleUrlBlock(SITE_B, false)
            await popup.openCodeBlock('Zeta')
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await expect(reopened.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
            await expect(reopened.urlBlockHeader(SITE_B)).toHaveAttribute('aria-expanded', 'false')
            await expect(reopened.codeBlockEditor('Zeta')).toBeVisible()
        })
    }
})

test.describe('cache keys', () => {
    test('sameTab keeps browser tabs on one host apart', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameTab')

        const first = await extension.openPopup(TAB_A)
        await first.selectView('All Scripts')
        await first.openCodeBlock('Alpha')
        await first.scrollPage(PAGE_SCROLL_Y)
        await first.close()

        const second = await extension.openPopup(TAB_A2)
        await expect(second.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
        await expect(second.codeBlockEditor('Alpha')).toBeVisible()
        expect(await second.pageScrollY()).toBe(0)
        await second.openCodeBlock('Delta')
        await second.close()

        const firstAgain = await extension.openPopup(TAB_A)
        await expect(firstAgain.codeBlockEditor('Alpha')).toBeVisible()
        await expect(firstAgain.codeBlockEditor('Delta')).toBeHidden()
        await firstAgain.close()

        const secondAgain = await extension.openPopup(TAB_A2)
        await expect(secondAgain.codeBlockEditor('Delta')).toBeVisible()
    })

    test('sameHost shares between browser tabs on one host only', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const first = await extension.openPopup(TAB_A)
        await first.selectView('All Scripts')
        await first.openCodeBlock('Alpha')
        await first.scrollPage(PAGE_SCROLL_Y)
        const savedTop = await first.headerTop(first.codeBlockHeader('Alpha'))
        await first.close()

        const sameHost = await extension.openPopup(TAB_A2)
        await expect(sameHost.codeBlockEditor('Alpha')).toBeVisible()
        expect(await sameHost.headerTop(sameHost.codeBlockHeader('Alpha'))).toBe(savedTop)
        await sameHost.close()

        const otherHost = await extension.openPopup(TAB_C)
        await expect(otherHost.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
        await expect(otherHost.codeBlockEditor('Alpha')).toBeVisible()
        expect(await otherHost.pageScrollY()).toBe(0)
    })

    test('off keeps the last used view and blocks, never scrolls', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('off')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.openCodeBlock('Alpha')
        await popup.scrollPage(PAGE_SCROLL_Y)
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
        await expect(reopened.codeBlockEditor('Alpha')).toBeVisible()
        expect(await reopened.pageScrollY()).toBe(0)
    })
})

test.describe('cache invalidation', () => {
    test('changing the restore mode drops the entry but keeps last used', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.openCodeBlock('Alpha')
        await popup.scrollPage(PAGE_SCROLL_Y)
        await popup.close()

        await extension.setRestoreMode('sameTab')
        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
        await expect(reopened.codeBlockEditor('Alpha')).toBeVisible()
        expect(await reopened.pageScrollY()).toBe(0)
    })

    test('a browser restart drops the entry but keeps last used', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.openCodeBlock('Alpha')
        await popup.scrollPage(PAGE_SCROLL_Y)
        await popup.close()

        await extension.restartBrowser()
        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.viewTab('All Scripts')).toHaveAttribute('aria-selected', 'true')
        await expect(reopened.codeBlockEditor('Alpha')).toBeVisible()
        expect(await reopened.pageScrollY()).toBe(0)
    })
})
