import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFakeLocalStorage } from '../../../fakes/localStorage'
import {
    areTooltipsEnabled,
    countTooltipShown,
    isTooltipExhausted,
    resetTooltipCounters,
    setTooltipsEnabled,
} from '../../../../src/shared/service/settings/tooltipPreferences'

const TITLE = 'Delete script'

beforeEach(() => {
    vi.stubGlobal('localStorage', createFakeLocalStorage())
})

describe('areTooltipsEnabled', () => {
    it('is enabled by default and follows setTooltipsEnabled', () => {
        expect(areTooltipsEnabled()).toBe(true)

        setTooltipsEnabled(false)
        expect(areTooltipsEnabled()).toBe(false)

        setTooltipsEnabled(true)
        expect(areTooltipsEnabled()).toBe(true)
    })
})

describe('tooltip counters', () => {
    it('exhausts a tooltip after 30 shows, per title', () => {
        showTimes(TITLE, 29)
        expect(isTooltipExhausted(TITLE)).toBe(false)

        showTimes(TITLE, 1)
        expect(isTooltipExhausted(TITLE)).toBe(true)
        expect(isTooltipExhausted('Other')).toBe(false)
    })

    it('stops counting at the limit', () => {
        showTimes(TITLE, 40)
        expect(JSON.parse(localStorage.getItem('tooltipCounters')!)[TITLE]).toBe(30)
    })

    it('starts over after a reset', () => {
        showTimes(TITLE, 30)
        resetTooltipCounters()
        expect(isTooltipExhausted(TITLE)).toBe(false)
    })
})

function showTimes(title: string, times: number) {
    for (let i = 0; i < times; i++) {
        countTooltipShown(title)
    }
}
