import { AccordionItemData, ItemsDataState, ScriptRunMode, ScriptType } from '../types'
import { SHARED_CODE } from '../constants'
import { urlPatternValidator } from './urlPatternValidator'

export const BACKUP_FORMAT = 'injectcode-backup'
export const BACKUP_VERSION = 1

const RUN_MODES: ScriptRunMode[] = ['disabled', 'active', 'always']
const SCRIPT_TYPES: ScriptType[] = ['js', 'css']
const MAX_REPORTED_ERRORS = 5

export interface Backup {
    format: string
    version: number
    exportedAt: string
    scripts: ItemsDataState
}

export type ParsedBackup =
    | { ok: true, scripts: ItemsDataState }
    | { ok: false, errors: string[] }

export interface ImportSummary {
    added: number
    overwritten: number
    skipped: number
}

export interface MergeResult {
    scripts: ItemsDataState
    summary: ImportSummary
}

type IdGenerator = (type: ScriptType) => string

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function padded(value: number): string {
    return String(value).padStart(2, '0')
}

export function backupFileName(date: Date): string {
    const day = `${date.getFullYear()}-${padded(date.getMonth() + 1)}-${padded(date.getDate())}`
    return `injectcode-backup-${day}.json`
}

export function createBackup(scripts: ItemsDataState, exportedAt: Date): Backup {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: exportedAt.toISOString(),
        scripts,
    }
}

export function serializeBackup(backup: Backup): string {
    return JSON.stringify(backup, null, 2)
}

export function countScripts(scripts: ItemsDataState): number {
    return Object.values(scripts).reduce((total, items) => total + items.length, 0)
}

function parseItem(raw: unknown, where: string, errors: string[]): AccordionItemData | undefined {
    if (!isPlainObject(raw)) {
        errors.push(`${where} is not an object`)
        return undefined
    }

    const { id, title, secondaryText, content, runMode, type } = raw
    const problems: string[] = []

    if (typeof id !== 'string' || id === '') {
        problems.push('id must be a non-empty text')
    }
    if (typeof title !== 'string') {
        problems.push('title must be text')
    }
    if (typeof content !== 'string') {
        problems.push('content must be text')
    }
    if (!RUN_MODES.includes(runMode as ScriptRunMode)) {
        problems.push(`runMode must be one of ${RUN_MODES.join(', ')}`)
    }
    if (!SCRIPT_TYPES.includes(type as ScriptType)) {
        problems.push(`type must be one of ${SCRIPT_TYPES.join(', ')}`)
    }

    if (problems.length > 0) {
        errors.push(`${where}: ${problems.join('; ')}`)
        return undefined
    }

    return {
        id: id as string,
        title: title as string,
        secondaryText: typeof secondaryText === 'string' ? secondaryText : '',
        content: content as string,
        runMode: runMode as ScriptRunMode,
        type: type as ScriptType,
    }
}

function parseContainer(pattern: string, rawItems: unknown, errors: string[]): AccordionItemData[] | undefined {
    if (pattern !== SHARED_CODE) {
        const patternError = urlPatternValidator(pattern, [])
        if (patternError) {
            errors.push(`"${pattern}": ${patternError}`)
            return undefined
        }
    }

    if (!Array.isArray(rawItems)) {
        errors.push(`"${pattern}": scripts must be a list`)
        return undefined
    }

    const items = rawItems.map((raw, index) => parseItem(raw, `"${pattern}" script ${index + 1}`, errors))

    return items.every(item => item !== undefined) ? items as AccordionItemData[] : undefined
}

function findIdProblems(scripts: ItemsDataState): string[] {
    const containerKeys = new Set(Object.keys(scripts))
    const seen = new Set<string>()
    const problems: string[] = []

    Object.values(scripts).flat().forEach(item => {
        if (seen.has(item.id)) {
            problems.push(`script id "${item.id}" is used more than once`)
        } else if (containerKeys.has(item.id)) {
            problems.push(
                `script id "${item.id}" is the same as a URL pattern; script ids must differ from all URL patterns`,
            )
        }
        seen.add(item.id)
    })

    return problems
}

function cappedErrors(errors: string[]): string[] {
    if (errors.length <= MAX_REPORTED_ERRORS) {
        return errors
    }
    const hidden = errors.length - MAX_REPORTED_ERRORS
    return [...errors.slice(0, MAX_REPORTED_ERRORS), `and ${hidden} more ${hidden === 1 ? 'problem' : 'problems'}`]
}

export function parseBackup(text: string): ParsedBackup {
    let raw: unknown
    try {
        raw = JSON.parse(text)
    } catch {
        return { ok: false, errors: ['The file is not valid JSON'] }
    }

    if (!isPlainObject(raw) || raw.format !== BACKUP_FORMAT) {
        return { ok: false, errors: ['The file is not an InjectCode backup'] }
    }

    if (raw.version !== BACKUP_VERSION) {
        const isNewer = typeof raw.version === 'number' && raw.version > BACKUP_VERSION
        return {
            ok: false,
            errors: [isNewer ? 'The backup was made by a newer version of InjectCode' : 'Unsupported backup version'],
        }
    }

    if (!isPlainObject(raw.scripts)) {
        return { ok: false, errors: ['The backup does not contain any scripts data'] }
    }

    const errors: string[] = []
    const scripts: ItemsDataState = {}

    for (const [pattern, rawItems] of Object.entries(raw.scripts)) {
        const items = parseContainer(pattern, rawItems, errors)
        if (items) {
            scripts[pattern] = items
        }
    }

    if (errors.length === 0) {
        errors.push(...findIdProblems(scripts))
    }

    return errors.length > 0 ? { ok: false, errors: cappedErrors(errors) } : { ok: true, scripts }
}

function createImportedId(type: ScriptType): string {
    return `${type}-imported-${Math.random().toString(36).substring(2, 10)}`
}

function isSameScript(a: AccordionItemData, b: AccordionItemData): boolean {
    return a.id === b.id
        && a.type === b.type
        && a.title === b.title
        && a.secondaryText === b.secondaryText
        && a.content === b.content
}

export function mergeScripts(
    existing: ItemsDataState,
    incoming: ItemsDataState,
    generateId: IdGenerator = createImportedId,
): MergeResult {
    const merged: ItemsDataState = { [SHARED_CODE]: [] }

    Object.entries(existing).forEach(([pattern, items]) => {
        merged[pattern] = [...items]
    })

    const usedIds = new Set<string>(Object.keys(merged))
    const locations = new Map<string, { pattern: string, index: number }>()

    Object.entries(merged).forEach(([pattern, items]) => items.forEach((item, index) => {
        usedIds.add(item.id)
        locations.set(item.id, { pattern, index })
    }))

    const summary: ImportSummary = { added: 0, overwritten: 0, skipped: 0 }

    Object.entries(incoming).forEach(([pattern, items]) => {
        const target = merged[pattern] ?? []
        merged[pattern] = target
        usedIds.add(pattern)

        items.forEach(item => {
            const location = locations.get(item.id)

            if (location) {
                const container = merged[location.pattern]
                if (isSameScript(container[location.index], item)) {
                    summary.skipped += 1
                } else {
                    container[location.index] = { ...item }
                    summary.overwritten += 1
                }
                return
            }

            let id = item.id

            while (usedIds.has(id)) {
                id = generateId(item.type)
            }

            usedIds.add(id)

            target.push({ ...item, id })
            locations.set(id, { pattern, index: target.length - 1 })
            summary.added += 1
        })
    })

    return { scripts: merged, summary }
}
