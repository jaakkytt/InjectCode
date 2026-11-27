import { expect, test } from '../fixtures/extension'
import type { PopupPage, ViewName } from '../pages/PopupPage'
import { SCRIPTS, SHARED, SITE_A, TAB_A } from '../fixtures/scripts'

const VIEWS: ViewName[] = ['All Scripts', 'Currently Matching']
const NEW_SITE = '*://test.example/'
const OFF_SCREEN_SITE = '*://z.example/*'

test.describe('URL block order', () => {
    test('Shared stays first after adding a URL block and reopening', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.createUrlBlock(NEW_SITE)
        expect(await isAbove(popup, SHARED, NEW_SITE)).toBe(true)
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await reopened.selectView('All Scripts')
        expect(await isAbove(reopened, SHARED, SITE_A)).toBe(true)
        expect(await isAbove(reopened, SHARED, NEW_SITE)).toBe(true)
    })

    for (const view of VIEWS) {
        test(`URL block added off-screen is scrolled into view, ${view}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView(view)
            await popup.createUrlBlock(OFF_SCREEN_SITE)

            await expect(popup.urlBlockHeader(OFF_SCREEN_SITE)).toBeInViewport({ ratio: 1 })
            expect(await popup.pageScrollY()).toBeGreaterThan(0)
        })
    }
})

async function isAbove(popup: PopupPage, pattern: string, belowPattern: string): Promise<boolean> {
    const [top, belowTop] = await Promise.all([
        popup.headerTop(popup.urlBlockHeader(pattern)),
        popup.headerTop(popup.urlBlockHeader(belowPattern)),
    ])

    return top < belowTop
}
