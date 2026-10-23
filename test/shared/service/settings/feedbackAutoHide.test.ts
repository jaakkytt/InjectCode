import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    DEFAULT_FEEDBACK_AUTO_HIDE,
    readFeedbackAutoHide,
} from '../../../../src/shared/service/settings/feedbackAutoHide'

const { getValue } = vi.hoisted(() => ({ getValue: vi.fn() }))

vi.mock('../../../../src/shared/service/storageApi', () => ({ storage: { getValue } }))

describe('readFeedbackAutoHide', () => {
    beforeEach(() => {
        getValue.mockReset()
    })

    it('keeps stored durations, including 0 and null, per severity', async () => {
        const stored = { success: 0, info: 5000, warning: null, error: 2000 }
        getValue.mockResolvedValue(stored)

        expect(await readFeedbackAutoHide()).toEqual(stored)
    })

    it('falls back to the default per severity for missing or invalid values', async () => {
        getValue.mockResolvedValue({ success: '2s', info: -1, error: null })

        expect(await readFeedbackAutoHide()).toEqual({ ...DEFAULT_FEEDBACK_AUTO_HIDE, error: null })
    })

    it('falls back to all defaults when nothing usable is stored', async () => {
        getValue.mockResolvedValue(10000)

        expect(await readFeedbackAutoHide()).toEqual(DEFAULT_FEEDBACK_AUTO_HIDE)
    })
})
