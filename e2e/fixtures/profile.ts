import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { type BrowserContext, chromium } from '@playwright/test'

const EXTENSION_PATH = path.resolve(__dirname, '../../dist')
const PROFILE_TEMPLATE = path.join(os.tmpdir(), 'injectcode-e2e-profile')
const EXTENSION_ID_FILE = 'extension-id'
const POPUP_VIEWPORT = { width: 620, height: 600 }

export async function launchWithExtension(userDataDir: string): Promise<BrowserContext> {
    return chromium.launchPersistentContext(userDataDir, {
        channel: 'chromium',
        chromiumSandbox: false,
        viewport: POPUP_VIEWPORT,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
        ],
    })
}

export async function createProfileTemplate(): Promise<void> {
    fs.rmSync(PROFILE_TEMPLATE, { recursive: true, force: true })
    fs.mkdirSync(PROFILE_TEMPLATE, { recursive: true })

    const context = await launchWithExtension(PROFILE_TEMPLATE)
    const [existing] = context.serviceWorkers()
    const serviceWorker = existing ?? await context.waitForEvent('serviceworker')
    const extensionId = serviceWorker.url().split('/')[2]
    await context.close()

    allowUserScripts(PROFILE_TEMPLATE, extensionId)

    fs.writeFileSync(path.join(PROFILE_TEMPLATE, EXTENSION_ID_FILE), extensionId)
}

export function cloneProfileTemplate(): string {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'injectcode-e2e-'))

    fs.cpSync(PROFILE_TEMPLATE, userDataDir, { recursive: true })

    return userDataDir
}

export function removeProfile(userDataDir: string): void {
    fs.rmSync(userDataDir, { recursive: true, force: true })
}

export function templateExtensionId(): string {
    return fs.readFileSync(path.join(PROFILE_TEMPLATE, EXTENSION_ID_FILE), 'utf8')
}

function allowUserScripts(userDataDir: string, extensionId: string): void {
    const file = path.join(userDataDir, 'Default', 'Preferences')
    const preferences = JSON.parse(fs.readFileSync(file, 'utf8'))
    const extensionSettings = preferences.extensions?.settings?.[extensionId]

    if (!extensionSettings) {
        throw new Error(`No settings for extension ${extensionId} in ${file}`)
    }

    extensionSettings.user_scripts_enabled = true

    fs.writeFileSync(file, JSON.stringify(preferences))
}
