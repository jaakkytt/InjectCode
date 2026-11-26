import { Script } from '../../shared/types'
import {
    LOCAL_STORAGE_LEGACY_IMPORT_FAILED,
    LOCAL_STORAGE_LEGACY_SCOPE,
    LOCAL_STORAGE_LEGACY_SCRIPTS,
    SHARED_CODE,
    STORAGE_SCRIPTS,
} from '../../shared/constants'
import { storage } from '../../shared/service/storageApi'
import { cyrb53 } from '../../shared/lib/hash/cyrb53'
import { isPlainObject } from '../../shared/lib/isPlainObject'
import { ImportSummary, mergeScripts } from './backup'

export type LegacyImportResult =
    | { status: 'nothing' }
    | { status: 'failed' }
    | { status: 'imported', summary: ImportSummary }

function stableId(index: number, name: unknown, code: string): string {
    return `js-imported-${cyrb53(JSON.stringify([index, name, code])).toString(36)}`
}

export function parseLegacyScripts(raw: string): Script[] {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
        throw new Error(`Expected ${LOCAL_STORAGE_LEGACY_SCRIPTS} to hold a JSON list of 1.x scripts`)
    }

    return parsed.flatMap((item: unknown, index): Script[] => {
        if (!isPlainObject(item) || typeof item.code !== 'string' || item.code.trim() === '') {
            return []
        }

        const title = typeof item.name === 'string' && item.name.trim() !== ''
            ? item.name
            : `InjectCode 1.x script ${index + 1}`

        return [{
            id: stableId(index, item.name, item.code),
            title,
            secondaryText: '',
            content: item.code,
            runMode: 'disabled',
            type: 'js',
        }]
    })
}

async function addToShared(legacy: Script[]): Promise<LegacyImportResult> {
    if (legacy.length === 0) {
        return { status: 'nothing' }
    }

    const existing = await storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] })
    const existingIds = new Set(Object.values(existing).flat().map(item => item.id))
    const notYetImported = legacy.filter(item => !existingIds.has(item.id))

    if (notYetImported.length === 0) {
        return { status: 'nothing' }
    }

    const { scripts, summary } = mergeScripts(existing, { [SHARED_CODE]: notYetImported })
    const alreadyImported = legacy.length - notYetImported.length

    await storage.set(STORAGE_SCRIPTS, scripts)

    return { status: 'imported', summary: { ...summary, skipped: summary.skipped + alreadyImported } }
}

export async function importLegacyScripts(): Promise<LegacyImportResult> {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEGACY_SCRIPTS)

    if (raw === null) {
        localStorage.removeItem(LOCAL_STORAGE_LEGACY_IMPORT_FAILED)

        return { status: 'nothing' }
    }

    if (localStorage.getItem(LOCAL_STORAGE_LEGACY_IMPORT_FAILED) !== null) {
        return { status: 'failed' }
    }

    let result: LegacyImportResult
    try {
        result = await addToShared(parseLegacyScripts(raw))
    } catch (error) {
        console.error('Failed to import the InjectCode 1.x scripts, they stay in localStorage:', error)
        localStorage.setItem(LOCAL_STORAGE_LEGACY_IMPORT_FAILED, 'true')

        return { status: 'failed' }
    }

    localStorage.removeItem(LOCAL_STORAGE_LEGACY_SCRIPTS)
    localStorage.removeItem(LOCAL_STORAGE_LEGACY_SCOPE)

    return result
}

let pending: Promise<LegacyImportResult> | undefined

export function importLegacyScriptsOnce(): Promise<LegacyImportResult> {
    pending ??= importLegacyScripts()

    return pending
}
