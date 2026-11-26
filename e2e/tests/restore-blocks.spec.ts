import type { Locator } from '@playwright/test'

import type { ViewName } from '../pages/PopupPage'
import { expect, test } from '../fixtures/extension'
import { SCRIPTS, SITE_A_PAGE, SITE_B, SITE_C, TAB_A } from '../fixtures/scripts'

const VIEWS: ViewName[] = ['All Scripts', 'Currently Matching']
const NEW_SITE = '*://d.example/*'
const RENAMED_SITE = '*://renamed.example/*'

test.describe('code block and URL block restore, sameHost', () => {
    for (const view of VIEWS) {
        test(`opened code block is scrolled to, ${view}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode('sameHost')

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView(view)
            await popup.openCodeBlock('Filler 5')
            await popup.scrollToMiddle(popup.codeBlockHeader('Filler 5'))
            const savedTop = await popup.headerTop(popup.codeBlockHeader('Filler 5'))
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await expect(reopened.codeBlockEditor('Filler 5')).toBeVisible()
            await expect(reopened.codeBlockEditor('Filler 5')).not.toBeFocused()
            expect(await reopened.headerTop(reopened.codeBlockHeader('Filler 5'))).toBe(savedTop)
        })

        test(`closed code block is scrolled to, ${view}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode('sameHost')

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView(view)
            await popup.openCodeBlock('Filler 5')
            await popup.closeCodeBlock('Filler 5')
            await popup.scrollToMiddle(popup.codeBlockHeader('Filler 5'))
            const savedTop = await popup.headerTop(popup.codeBlockHeader('Filler 5'))
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await expect(reopened.codeBlockHeader('Filler 5')).toBeVisible()
            await expect(reopened.codeBlockEditor('Filler 5')).toBeHidden()
            expect(await reopened.headerTop(reopened.codeBlockHeader('Filler 5'))).toBe(savedTop)
        })

        test(`closed URL block is scrolled to, ${view}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode('sameHost')

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView(view)
            await popup.openCodeBlock('Beta')
            await popup.toggleUrlBlock(SITE_A_PAGE, false)
            await popup.scrollToMiddle(popup.urlBlockHeader(SITE_A_PAGE))
            const savedTop = await popup.headerTop(popup.urlBlockHeader(SITE_A_PAGE))
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await expect(reopened.urlBlockHeader(SITE_A_PAGE)).toHaveAttribute('aria-expanded', 'false')
            expect(await reopened.headerTop(reopened.urlBlockHeader(SITE_A_PAGE))).toBe(savedTop)
        })
    }

    test('new URL block is scrolled to', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.createUrlBlock(NEW_SITE)
        await popup.scrollToMiddle(popup.urlBlockHeader(NEW_SITE))
        const savedTop = await popup.headerTop(popup.urlBlockHeader(NEW_SITE))
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.urlBlockHeader(NEW_SITE)).toBeVisible()
        expect(await reopened.headerTop(reopened.urlBlockHeader(NEW_SITE))).toBe(savedTop)
    })

    test('new code block is scrolled to', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.createCodeBlock('Omega', SITE_C)
        await popup.scrollToMiddle(popup.codeBlockHeader('Omega'))
        const savedTop = await popup.headerTop(popup.codeBlockHeader('Omega'))
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.codeBlockHeader('Omega')).toBeVisible()
        expect(await reopened.headerTop(reopened.codeBlockHeader('Omega'))).toBe(savedTop)
    })

    test('dragged code block is scrolled to', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.dragCodeBlockBelow('Delta', 'Epsilon')
        await expect.poll(() => isBelow(popup.codeBlockHeader('Delta'), popup.codeBlockHeader('Epsilon'))).toBe(true)
        await popup.scrollToMiddle(popup.codeBlockHeader('Delta'))
        const savedTop = await popup.headerTop(popup.codeBlockHeader('Delta'))
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        expect(await isBelow(reopened.codeBlockHeader('Delta'), reopened.codeBlockHeader('Epsilon'))).toBe(true)
        expect(await reopened.headerTop(reopened.codeBlockHeader('Delta'))).toBe(savedTop)
    })

    test('deleted code block falls back to its URL block', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.openCodeBlock('Zeta')
        await popup.scrollToMiddle(popup.codeBlockHeader('Zeta'))
        const savedTop = await popup.headerTop(popup.codeBlockHeader('Zeta'))
        await popup.deleteCodeBlock('Zeta')
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.urlBlockHeader(SITE_C)).toBeVisible()
        expect(await reopened.headerTop(reopened.urlBlockHeader(SITE_C))).toBe(savedTop)
    })

    test('renamed URL block is still scrolled to', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.toggleUrlBlock(SITE_B, false)
        await popup.toggleUrlBlock(SITE_B, true)
        await popup.renameUrlBlock(SITE_B, RENAMED_SITE)
        await popup.scrollToMiddle(popup.urlBlockHeader(RENAMED_SITE))
        const savedTop = await popup.headerTop(popup.urlBlockHeader(RENAMED_SITE))
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.urlBlockHeader(RENAMED_SITE)).toBeVisible()
        expect(await reopened.headerTop(reopened.urlBlockHeader(RENAMED_SITE))).toBe(savedTop)
    })
})

async function isBelow(first: Locator, second: Locator): Promise<boolean> {
    const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()])
    return !!firstBox && !!secondBox && firstBox.y > secondBox.y
}
