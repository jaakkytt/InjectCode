import { describe, expect, it } from 'vitest'

import {
    DEFAULT_VIEW_RESTORE_MODE,
    parseViewRestoreMode,
} from '../../../../src/shared/service/settings/viewRestoreMode'

describe('parseViewRestoreMode', () => {
    it('keeps each supported mode as is', () => {
        expect(parseViewRestoreMode('off')).toBe('off')
        expect(parseViewRestoreMode('sameTab')).toBe('sameTab')
        expect(parseViewRestoreMode('sameHost')).toBe('sameHost')
    })

    it('falls back to sameHost for anything else', () => {
        expect(DEFAULT_VIEW_RESTORE_MODE).toBe('sameHost')
        expect(parseViewRestoreMode('sameSite')).toBe(DEFAULT_VIEW_RESTORE_MODE)
        expect(parseViewRestoreMode(undefined)).toBe(DEFAULT_VIEW_RESTORE_MODE)
    })
})
