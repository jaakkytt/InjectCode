import { test as base, type BrowserContext } from '@playwright/test'
import type { ScriptsByPattern } from '../../src/shared/types'
import type { ViewRestoreMode } from '../../src/shared/service/settings/viewRestoreMode'
import { STORAGE_SCRIPTS, STORAGE_VIEW_RESTORE_MODE } from '../../src/shared/constants'
import { PopupPage } from '../pages/PopupPage'
import { cloneProfileTemplate, launchWithExtension, removeProfile, templateExtensionId } from './profile'

export interface BrowserTab {
    id: number
    url: string
}

interface ExtensionFixtures {
    extension: Extension
}

export const test = base.extend<ExtensionFixtures>({
    extension: async ({}, use) => {
        const extension = await Extension.launch()
        await use(extension)
        await extension.dispose()
    },
})

export const expect = test.expect

export class Extension {
    private userDataDir: string
    private context: BrowserContext
    private extensionId: string

    private constructor(userDataDir: string, context: BrowserContext, extensionId: string) {
        this.userDataDir = userDataDir
        this.context = context
        this.extensionId = extensionId
    }

    static async launch(): Promise<Extension> {
        const userDataDir = cloneProfileTemplate()
        const context = await launchWithExtension(userDataDir)
        return new Extension(userDataDir, context, templateExtensionId())
    }

    async dispose(): Promise<void> {
        await this.context.close()
        removeProfile(this.userDataDir)
    }

    async restartBrowser(): Promise<void> {
        await this.context.close()
        this.context = await launchWithExtension(this.userDataDir)
    }

    async seedScripts(scripts: ScriptsByPattern): Promise<void> {
        await this.setStorage(STORAGE_SCRIPTS, scripts)
    }

    async setRestoreMode(mode: ViewRestoreMode): Promise<void> {
        await this.setStorage(STORAGE_VIEW_RESTORE_MODE, mode)
    }

    async openPopup(browserTab: BrowserTab): Promise<PopupPage> {
        const page = await this.context.newPage()
        await page.addInitScript(stubActiveTab, browserTab)
        await page.goto(`chrome-extension://${this.extensionId}/popup.html`)

        const popup = new PopupPage(page)
        await popup.waitForLists()
        return popup
    }

    private async setStorage(key: string, value: unknown): Promise<void> {
        const [existing] = this.context.serviceWorkers()
        const serviceWorker = existing ?? await this.context.waitForEvent('serviceworker')
        await serviceWorker.evaluate(([k, v]) => chrome.storage.local.set({ [k]: v }), [key, value] as const)
    }
}

function stubActiveTab(browserTab: BrowserTab) {
    const activeTab = { id: browserTab.id, url: browserTab.url, active: true } as chrome.tabs.Tab
    chrome.tabs.query = async () => [activeTab]
}
