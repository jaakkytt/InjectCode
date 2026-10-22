import { useState } from 'react'
import { SHARED_CODE, STORAGE_SCRIPTS } from '../../../constants'
import { storage } from '../../../service/storageApi'
import { downloadTextFile } from '../../../service/fileDownload'
import {
    backupFileName,
    countScripts,
    createBackup,
    ImportSummary,
    mergeScripts,
    parseBackup,
    serializeBackup,
} from '../../../service/backup'
import { BackupValue, Notice } from './BackupProvider.types'

const s = (count: number) => (count === 1 ? '' : 's')

function describeImport({ added, overwritten, skipped }: ImportSummary): Notice {
    const details: string[] = []
    if (skipped > 0) {
        details.push(`${skipped} script${s(skipped)} already existed and ${skipped === 1 ? 'was' : 'were'} skipped.`)
    }

    if (added === 0 && overwritten === 0) {
        return { severity: 'info', text: 'Nothing new to import.', details }
    }

    const parts = [
        added > 0 ? `Imported ${added} new script${s(added)}.` : '',
        overwritten > 0 ? `Overwrote ${overwritten} existing script${s(overwritten)}.` : '',
    ]
    return { severity: 'success', text: parts.filter(Boolean).join(' '), details }
}

function describeFailure(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

async function readStoredScripts() {
    return storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] })
}

export function useBackupProviderBehavior(): BackupValue {
    const [notice, setNotice] = useState<Notice | null>(null)

    async function exportBackup() {
        try {
            const scripts = await readStoredScripts()
            const now = new Date()
            const fileName = backupFileName(now)

            downloadTextFile(fileName, serializeBackup(createBackup(scripts, now)))
            setNotice({
                severity: 'success',
                text: `Exported script${s(countScripts(scripts))} to ${fileName}.`,
                details: [],
            })
        } catch (error) {
            setNotice({ severity: 'error', text: `Export failed: ${describeFailure(error)}`, details: [] })
        }
    }

    async function importBackup(file: File) {
        try {
            const parsed = await parseBackup(await file.text())
            if (!parsed.ok) {
                setNotice({
                    severity: 'error',
                    text: 'This file could not be imported. Nothing was changed.',
                    details: parsed.errors,
                })
                return
            }

            const { scripts, summary } = mergeScripts(await readStoredScripts(), parsed.scripts)
            await storage.set(STORAGE_SCRIPTS, scripts)
            setNotice(describeImport(summary))
        } catch (error) {
            setNotice({ severity: 'error', text: `Import failed: ${describeFailure(error)}`, details: [] })
        }
    }

    return {
        notice,
        actions: {
            exportBackup,
            importBackup,
            dismissNotice: () => setNotice(null),
        },
    }
}
