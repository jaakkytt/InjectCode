import React, { createContext, ReactNode, useContext, useState } from 'react'
import { SHARED_CODE, STORAGE_SCRIPTS } from '../../shared/constants'
import { FeedbackSeverity } from '../../shared/types'
import { storage } from '../../shared/service/storageApi'
import { downloadTextFile } from '../service/fileDownload'
import { disableFilePatternScripts } from '../service/filePatternScripts'
import {
    backupFileName,
    countScripts,
    createBackup,
    ImportSummary,
    mergeScripts,
    parseBackup,
    serializeBackup,
} from '../service/backup'
import { s } from '../../shared/lib/text'

interface Notice {
    severity: FeedbackSeverity
    text: string
    details: string[]
}

interface BackupValue {
    notice: Notice | null
    actions: {
        exportBackup: () => Promise<void>
        importBackup: (file: File) => Promise<void>
        dismissNotice: () => void
    }
}

interface BackupProviderProps {
    children: ReactNode
}

const backupContext = createContext<BackupValue | undefined>(undefined)

export function useBackup() {
    const context = useContext(backupContext)
    if (!context) {
        throw new Error('useBackup must be used within <BackupProvider>')
    }
    return context
}

function describeImport({ added, overwritten, skipped }: ImportSummary, disabled: number): Notice {
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
        disabled > 0
            ? `${disabled} script${s(disabled)} on file URLs ${disabled === 1 ? 'was' : 'were'} disabled because `
                + 'file URL access is off in the extension settings.'
            : '',
    ]

    return { severity: disabled > 0 ? 'warning' : 'success', text: parts.filter(Boolean).join(' '), details }
}

function describeFailure(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

async function readStoredScripts() {
    return storage.get(STORAGE_SCRIPTS, { [SHARED_CODE]: [] })
}

function useBackupProviderBehavior(): BackupValue {
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
            const parsed = parseBackup(await file.text())

            if (!parsed.ok) {
                setNotice({
                    severity: 'error',
                    text: 'This file could not be imported. Nothing was changed.',
                    details: parsed.errors,
                })

                return
            }

            const { scripts: incoming, disabled } = await disableFilePatternScripts(parsed.scripts)
            const { scripts, summary } = mergeScripts(await readStoredScripts(), incoming)

            await storage.set(STORAGE_SCRIPTS, scripts)

            setNotice(describeImport(summary, disabled))
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

export const BackupProvider = ({ children }: BackupProviderProps) => {
    const value = useBackupProviderBehavior()

    return (
        <backupContext.Provider value={value}>
            {children}
        </backupContext.Provider>
    )
}
