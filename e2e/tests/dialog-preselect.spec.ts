import { expect, test } from '../fixtures/extension'
import { SCRIPTS, SITE_C, TAB_A } from '../fixtures/scripts'

test.describe('new script dialog preselect', () => {
    for (const mode of ['off', 'sameTab', 'sameHost'] as const) {
        test(`preselects the last interacted URL block, ${mode}`, async ({ extension }) => {
            await extension.seedScripts(SCRIPTS)
            await extension.setRestoreMode(mode)

            const popup = await extension.openPopup(TAB_A)
            await popup.selectView('All Scripts')
            await popup.toggleUrlBlock(SITE_C, false)
            await popup.toggleUrlBlock(SITE_C, true)
            await popup.openNewScriptDialog()
            await expect(popup.newScriptUrlSelect()).toHaveText(SITE_C)
            await popup.close()

            const reopened = await extension.openPopup(TAB_A)
            await reopened.openNewScriptDialog()
            await expect(reopened.newScriptUrlSelect()).toHaveText(SITE_C)
        })
    }
})
