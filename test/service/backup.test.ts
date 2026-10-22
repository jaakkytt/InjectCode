import { describe, expect, it } from 'vitest'
import { AccordionItemData, ItemsDataState } from '../../src/types'
import { SHARED_CODE } from '../../src/constants'
import {
    BACKUP_FORMAT,
    BACKUP_VERSION,
    backupFileName,
    countScripts,
    createBackup,
    mergeScripts,
    parseBackup,
    serializeBackup,
} from '../../src/service/backup'

describe('backupFileName', () => {
    it('uses the local calendar date with zero padding', () => {
        expect(backupFileName(new Date(2026, 0, 5))).toBe('injectcode-backup-2026-01-05.json')
    })
})

describe('createBackup and serializeBackup', () => {
    it('round trips through parseBackup unchanged', () => {
        const scripts: ItemsDataState = {
            [SHARED_CODE]: [makeItem({ id: 's1', runMode: 'always' })],
            'https://github.com/*': [makeItem({ id: 'g1', type: 'css', secondaryText: 'note' })],
        }

        const text = serializeBackup(createBackup(scripts, new Date('2026-09-19T10:00:00Z')))

        expect(parseBackup(text)).toEqual({ ok: true, scripts })
    })
})

describe('countScripts', () => {
    it('adds up the scripts of every container', () => {
        expect(countScripts({ a: [makeItem(), makeItem({ id: 'b' })], c: [makeItem({ id: 'c' })], d: [] })).toBe(3)
    })
})

describe('parseBackup', () => {
    it('rejects text that is not JSON', () => {
        expect(parseBackup('{nope')).toEqual({ ok: false, errors: ['The file is not valid JSON'] })
    })

    it('rejects JSON that is not an InjectCode backup', () => {
        const result = parseBackup(JSON.stringify({ hello: 'world' }))

        expect(result).toEqual({ ok: false, errors: ['The file is not an InjectCode backup'] })
    })

    it('rejects a backup made by a newer version', () => {
        const result = parseBackup(backupText({}, { version: BACKUP_VERSION + 1 }))

        expect(result).toEqual({ ok: false, errors: ['The backup was made by a newer version of InjectCode'] })
    })

    it('rejects a backup without a scripts object', () => {
        const result = parseBackup(backupText([]))

        expect(result).toEqual({ ok: false, errors: ['The backup does not contain any scripts data'] })
    })

    it('rejects a container whose pattern is invalid', () => {
        const result = parseBackup(backupText({ 'not a pattern': [] }))

        expect(result.ok).toBe(false)
        expect(result.ok === false && result.errors[0]).toContain('"not a pattern"')
    })

    it('rejects an item with a bad run mode and names its position', () => {
        const bad = { ...makeItem(), runMode: 'sometimes' }
        const result = parseBackup(backupText({ 'https://a.com/*': [makeItem({ id: 'ok' }), bad] }))

        expect(result.ok === false && result.errors).toEqual([
            '"https://a.com/*" script 2: runMode must be one of disabled, active, always',
        ])
    })

    it('rejects an item that is missing required fields', () => {
        const result = parseBackup(backupText({ 'https://a.com/*': [{ id: 'x' }] }))

        expect(result.ok === false && result.errors[0]).toContain('title must be text')
    })

    it('defaults a missing secondaryText to an empty string', () => {
        const { secondaryText, ...withoutSecondary } = makeItem({ id: 'x' })
        const result = parseBackup(backupText({ 'https://a.com/*': [withoutSecondary] }))

        expect(secondaryText).toBe('')
        expect(result.ok && result.scripts['https://a.com/*'][0].secondaryText).toBe('')
    })

    it('drops unknown fields from items', () => {
        const item = { ...makeItem({ id: 'x' }), extra: 'should not survive' }
        const result = parseBackup(backupText({ 'https://a.com/*': [item] }))

        expect(result.ok && result.scripts['https://a.com/*'][0]).toEqual(makeItem({ id: 'x' }))
    })

    it('rejects an id that is used twice', () => {
        const scripts = { 'https://a.com/*': [makeItem({ id: 'dup' })], 'https://b.com/*': [makeItem({ id: 'dup' })] }

        const result = parseBackup(backupText(scripts))

        expect(result.ok === false && result.errors).toEqual(['script id "dup" is used more than once'])
    })

    it('rejects an id that equals a container key', () => {
        const result = parseBackup(backupText({ 'https://a.com/*': [makeItem({ id: 'https://a.com/*' })] }))

        expect(result.ok === false && result.errors).toEqual([
            'script id "https://a.com/*" is the same as a URL pattern; script ids must differ from all URL patterns',
        ])
    })

    it('reports at most five problems and counts the rest', () => {
        const items = Array.from({ length: 8 }, (_, index) => ({ id: `i${index}` }))
        const result = parseBackup(backupText({ 'https://a.com/*': items }))

        expect(result.ok === false && result.errors).toHaveLength(6)
        expect(result.ok === false && result.errors[5]).toBe('and 3 more problems')
    })
})

describe('mergeScripts', () => {
    it('adds scripts to an existing container after the ones already there', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'old' })] }
        const incoming = { 'https://a.com/*': [makeItem({ id: 'new' })] }

        const { scripts, summary } = mergeScripts(existing, incoming)

        expect(scripts['https://a.com/*'].map(item => item.id)).toEqual(['old', 'new'])
        expect(summary).toEqual({ added: 1, overwritten: 0, skipped: 0 })
    })

    it('creates containers that do not exist yet, including empty ones', () => {
        const incoming = { 'https://a.com/*': [], 'https://b.com/*': [] }

        const { scripts } = mergeScripts({ [SHARED_CODE]: [] }, incoming)

        expect(Object.keys(scripts)).toEqual([SHARED_CODE, 'https://a.com/*', 'https://b.com/*'])
    })

    it('keeps Shared first and present even when nothing exists yet', () => {
        const { scripts } = mergeScripts({}, { 'https://a.com/*': [makeItem()] })

        expect(Object.keys(scripts)[0]).toBe(SHARED_CODE)
    })

    it('does not mutate the existing scripts', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'old', content: 'old' })] }

        const incoming = { 'https://a.com/*': [makeItem({ id: 'old', content: 'new' }), makeItem({ id: 'new' })] }

        mergeScripts(existing, incoming)

        expect(existing['https://a.com/*']).toEqual([makeItem({ id: 'old', content: 'old' })])
    })

    it('imports every run mode exactly as it is in the file', () => {
        const incoming = {
            'https://a.com/*': [
                makeItem({ id: 'd', runMode: 'disabled' }),
                makeItem({ id: 'a', runMode: 'active' }),
                makeItem({ id: 'w', runMode: 'always' }),
            ],
        }

        const { scripts } = mergeScripts({ [SHARED_CODE]: [] }, incoming)

        expect(scripts['https://a.com/*'].map(item => item.runMode)).toEqual(['disabled', 'active', 'always'])
    })

    it('overwrites a script with the same id in place, keeping its position', () => {
        const before = [makeItem({ id: 'first' }), makeItem({ id: 'a1', content: 'old' }), makeItem({ id: 'last' })]
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': before }
        const incoming = { 'https://a.com/*': [makeItem({ id: 'a1', content: 'new', title: 'renamed' })] }

        const { scripts, summary } = mergeScripts(existing, incoming)

        expect(scripts['https://a.com/*'].map(item => item.id)).toEqual(['first', 'a1', 'last'])
        expect(scripts['https://a.com/*'][1]).toEqual(makeItem({ id: 'a1', content: 'new', title: 'renamed' }))
        expect(summary).toEqual({ added: 0, overwritten: 1, skipped: 0 })
    })

    it('overwrites a script that now lives in another container, without moving it', () => {
        const existing = {
            [SHARED_CODE]: [],
            'https://a.com/*': [],
            'https://b.com/*': [makeItem({ id: 'moved', content: 'old' })],
        }

        const incoming = { 'https://a.com/*': [makeItem({ id: 'moved', content: 'new' })] }

        const { scripts } = mergeScripts(existing, incoming)

        expect(scripts['https://a.com/*']).toEqual([])
        expect(scripts['https://b.com/*'].map(item => item.content)).toEqual(['new'])
    })

    it('replaces the whole script when only the type differs', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'a1', type: 'js' })] }
        const incoming = { 'https://a.com/*': [makeItem({ id: 'a1', type: 'css' })] }

        const { scripts } = mergeScripts(existing, incoming)

        expect(scripts['https://a.com/*'].map(item => item.type)).toEqual(['css'])
    })

    it('takes the run mode from the file when overwriting', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'a1', content: 'old' })] }
        const incoming = { 'https://a.com/*': [makeItem({ id: 'a1', content: 'new', runMode: 'always' })] }

        const { scripts } = mergeScripts(existing, incoming)

        expect(scripts['https://a.com/*'][0].runMode).toBe('always')
    })

    it('skips an identical script, so importing the same file twice changes nothing', () => {
        const scripts = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'a1' })] }

        const { scripts: merged, summary } = mergeScripts(scripts, scripts)

        expect(merged).toEqual(scripts)
        expect(summary).toEqual({ added: 0, overwritten: 0, skipped: 1 })
    })

    it('leaves an identical script untouched, including its run mode', () => {
        const armed = makeItem({ id: 'a1', runMode: 'always' })
        const scripts = { [SHARED_CODE]: [], 'https://a.com/*': [armed] }

        const { scripts: merged } = mergeScripts(scripts, { 'https://a.com/*': [{ ...armed, runMode: 'active' }] })

        expect(merged['https://a.com/*'][0].runMode).toBe('always')
    })

    it('gives a new id to a script whose id clashes with a container key', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [] }
        const incoming = { 'https://b.com/*': [makeItem({ id: 'https://a.com/*' })] }

        const { scripts } = mergeScripts(existing, incoming, sequentialIds())

        expect(scripts['https://b.com/*'][0].id).toBe('generated-0')
    })

    it('keeps generating until the new id is unused', () => {
        const existing = { [SHARED_CODE]: [], 'https://a.com/*': [makeItem({ id: 'generated-0' })] }
        const incoming = { 'https://b.com/*': [makeItem({ id: 'https://a.com/*' })] }

        const { scripts } = mergeScripts(existing, incoming, sequentialIds())

        expect(scripts['https://b.com/*'][0].id).toBe('generated-1')
    })
})

function makeItem(overrides: Partial<AccordionItemData> = {}): AccordionItemData {
    return {
        id: overrides.id ?? 'item-id',
        title: overrides.title ?? 'item-title',
        secondaryText: overrides.secondaryText ?? '',
        content: overrides.content ?? 'run()',
        runMode: overrides.runMode ?? 'active',
        type: overrides.type ?? 'js',
    }
}

function backupText(scripts: unknown, overrides: Record<string, unknown> = {}): string {
    return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: 'now', scripts, ...overrides })
}

function sequentialIds() {
    let next = 0
    return () => `generated-${next++}`
}
