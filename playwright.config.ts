import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: 'e2e/tests',
    globalSetup: './e2e/fixtures/globalSetup.ts',
    outputDir: 'development/.artifacts/e2e-results',
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    forbidOnly: !!process.env.CI,
    reporter: 'list',
})
