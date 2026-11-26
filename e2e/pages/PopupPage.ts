import { expect, type Locator, type Page } from '@playwright/test'

const DRAG_STEPS = 12

export type ViewName = 'Currently Matching' | 'All Scripts'

export interface EditorState {
    selectionStart: number
    selectionEnd: number
    scrollTop: number
}

export class PopupPage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    viewTab(name: ViewName): Locator {
        return this.page.getByRole('tab', { name })
    }

    urlBlockHeader(pattern: string): Locator {
        return this.page.getByRole('button', { name: pattern })
    }

    codeBlockHeader(title: string): Locator {
        return this.page.getByRole('button', { name: title })
    }

    codeBlockBody(title: string): Locator {
        return this.page.getByRole('region', { name: title })
    }

    codeBlockEditor(title: string): Locator {
        return this.codeBlockBody(title).getByRole('textbox')
    }

    newScriptUrlSelect(): Locator {
        return this.page.getByRole('dialog').getByRole('combobox')
    }

    async waitForLists(): Promise<void> {
        await expect(this.viewTab('Currently Matching')).toBeVisible()
    }

    async selectView(name: ViewName): Promise<void> {
        await this.viewTab(name).click()
        await expect(this.viewTab(name)).toHaveAttribute('aria-selected', 'true')
    }

    async openCodeBlock(title: string): Promise<void> {
        await this.codeBlockHeader(title).click()
        await expect(this.codeBlockEditor(title)).toBeVisible()
        await this.settleLayout()
    }

    async closeCodeBlock(title: string): Promise<void> {
        await this.codeBlockHeader(title).click()
        await expect(this.codeBlockEditor(title)).toBeHidden()
        await this.settleLayout()
    }

    async toggleUrlBlock(pattern: string, expanded: boolean): Promise<void> {
        await this.urlBlockHeader(pattern).click()
        await expect(this.urlBlockHeader(pattern)).toHaveAttribute('aria-expanded', String(expanded))
        await this.settleLayout()
    }

    async focusEditorEnd(title: string): Promise<void> {
        await this.codeBlockEditor(title).click()
        await this.page.keyboard.press('Control+End')
        await expect(this.codeBlockEditor(title)).toBeFocused()
    }

    async createUrlBlock(pattern: string): Promise<void> {
        await this.openActionMenu()
        await this.page.getByRole('button').filter({ hasText: 'URL' }).click()
        const dialog = this.page.getByRole('dialog')
        await dialog.getByRole('textbox').fill(pattern)
        await dialog.getByRole('button', { name: 'Add' }).click()
        await expect(this.urlBlockHeader(pattern)).toBeVisible()
    }

    async openNewScriptDialog(): Promise<void> {
        await this.openActionMenu()
        await this.page.getByRole('button').filter({ hasText: 'Script' }).click()
        await expect(this.page.getByRole('dialog')).toBeVisible()
    }

    async createCodeBlock(title: string, pattern: string): Promise<void> {
        await this.openNewScriptDialog()
        const dialog = this.page.getByRole('dialog')
        await dialog.getByRole('textbox').fill(title)
        await this.newScriptUrlSelect().click()
        await this.page.getByRole('option', { name: pattern }).click()
        await dialog.getByRole('button', { name: 'Add' }).click()
        await expect(this.codeBlockHeader(title)).toBeVisible()
    }

    async dragCodeBlockBelow(title: string, belowTitle: string): Promise<void> {
        const handle = this.codeBlockHeader(title).getByRole('button', { name: 'drag' }).first()
        await handle.hover()
        const from = await centerOf(handle)
        const to = await centerOf(this.codeBlockHeader(belowTitle))

        await this.page.mouse.down()
        await this.page.mouse.move(from.x, from.y + 10, { steps: 2 })
        await this.page.mouse.move(to.x, to.y + 20, { steps: DRAG_STEPS })
        await this.page.mouse.up()
        await expect(this.codeBlockHeader(title)).toHaveCount(1)
    }

    async deleteCodeBlock(title: string): Promise<void> {
        const header = this.codeBlockHeader(title)
        await header.getByRole('button', { name: 'Delete' }).click()
        await header.getByRole('button', { name: 'Confirm' }).click()
        await expect(this.codeBlockHeader(title)).toBeHidden()
    }

    async renameUrlBlock(pattern: string, newPattern: string): Promise<void> {
        const header = this.urlBlockHeader(pattern)
        await header.getByRole('button', { name: 'Edit' }).click()
        await header.getByRole('textbox').fill(newPattern)
        await this.page.keyboard.press('Enter')
        await expect(this.urlBlockHeader(newPattern)).toBeVisible()
    }

    async headerTop(header: Locator): Promise<number> {
        return header.evaluate(element => Math.round(element.getBoundingClientRect().top))
    }

    async editorState(title: string): Promise<EditorState> {
        return this.codeBlockBody(title).evaluate(body => {
            const textarea = body.querySelector('textarea')
            const container = body.querySelector('.prism-code-editor')
            if (!textarea || !container) {
                throw new Error('No editor rendered in the code block')
            }
            return {
                selectionStart: textarea.selectionStart,
                selectionEnd: textarea.selectionEnd,
                scrollTop: container.scrollTop,
            }
        })
    }

    async scrollEditor(title: string, scrollTop: number): Promise<void> {
        await this.codeBlockBody(title)
            .locator('.prism-code-editor')
            .evaluate((container, top) => new Promise<void>(resolve => {
                container.addEventListener('scroll', () => resolve(), { once: true })
                container.scrollTop = top
            }), scrollTop)
    }

    async scrollToMiddle(header: Locator): Promise<void> {
        await header.evaluate(element => element.scrollIntoView({ block: 'center' }))
        await expect.poll(() => this.pageScrollY()).toBeGreaterThan(0)
    }

    async scrollPage(scrollY: number): Promise<void> {
        await this.page.evaluate(top => window.scrollTo(0, top), scrollY)
        await expect.poll(() => this.pageScrollY()).toBeGreaterThan(0)
    }

    async pageScrollY(): Promise<number> {
        return this.page.evaluate(() => window.scrollY)
    }

    async close(): Promise<void> {
        await this.page.close()
    }

    private async settleLayout(): Promise<void> {
        await this.page.waitForFunction(() => new Promise(resolve => {
            const height = document.documentElement.scrollHeight
            setTimeout(() => resolve(document.documentElement.scrollHeight === height), 100)
        }))
    }

    private async openActionMenu(): Promise<void> {
        await this.page.locator('.MuiFab-root').first().click()
        await expect(this.page.getByRole('button').filter({ hasText: 'URL' })).toBeVisible()
    }
}

async function centerOf(locator: Locator): Promise<{ x: number, y: number }> {
    const box = await locator.boundingBox()
    if (!box) {
        throw new Error('Element has no bounding box')
    }
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}
