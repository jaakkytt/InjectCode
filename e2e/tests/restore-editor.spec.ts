import { expect, test } from '../fixtures/extension'
import { SCRIPTS, TAB_A } from '../fixtures/scripts'
import type { ViewName } from '../pages/PopupPage'

const VIEWS: ViewName[] = ['All Scripts', 'Currently Matching']
const EDITOR_SCROLL_TOP = 120
const PAGE_SCROLL_Y = 80

test.describe('editor restore, sameHost', () => {
    for (const view of VIEWS) {
        test(`focused editor comes back with cursor, scroll and offset, ${view}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode('sameHost')

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView(view)
            await popup.openCodeBlock('Beta')
            await popup.focusEditorEnd('Beta')
            await popup.page.keyboard.press('ArrowUp')
            await popup.page.keyboard.press('ArrowUp')
            await popup.scrollEditor('Beta', EDITOR_SCROLL_TOP)
            await popup.scrollPage(PAGE_SCROLL_Y)

            const savedEditor = await popup.editorState('Beta')
            const savedTop = await popup.headerTop(popup.codeBlockHeader('Beta'))
            expect(savedEditor.scrollTop).toBe(EDITOR_SCROLL_TOP)
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await expect(reopened.viewTab(view)).toHaveAttribute('aria-selected', 'true')
            await expect(reopened.codeBlockEditor('Beta')).toBeFocused()
            expect(await reopened.editorState('Beta')).toEqual(savedEditor)
            expect(await reopened.headerTop(reopened.codeBlockHeader('Beta'))).toBe(savedTop)
        })
    }

    test('editor left by clicking inside the popup comes back unfocused', async ({ extension }) => {
        await extension.seedScripts(SCRIPTS)
        await extension.setRestoreMode('sameHost')

        const popup = await extension.openPopup(TAB_A)
        await popup.selectView('All Scripts')
        await popup.openCodeBlock('Beta')
        await popup.focusEditorEnd('Beta')
        await popup.viewTab('All Scripts').click()
        await expect(popup.codeBlockEditor('Beta')).not.toBeFocused()
        await popup.scrollPage(PAGE_SCROLL_Y)

        const savedTop = await popup.headerTop(popup.codeBlockHeader('Beta'))
        await popup.close()

        const reopened = await extension.openPopup(TAB_A)
        await expect(reopened.codeBlockEditor('Beta')).toBeVisible()
        await expect(reopened.codeBlockEditor('Beta')).not.toBeFocused()
        expect(await reopened.headerTop(reopened.codeBlockHeader('Beta'))).toBe(savedTop)
    })
})
