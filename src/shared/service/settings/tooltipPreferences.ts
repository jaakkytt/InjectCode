import { LOCAL_STORAGE_TOOLTIP_COUNTERS, LOCAL_STORAGE_TOOLTIP_DISABLED } from '../../constants'

const TOOLTIP_SHOW_LIMIT = 30

function readTooltipCounters(): Record<string, number> {
    const stored = localStorage.getItem(LOCAL_STORAGE_TOOLTIP_COUNTERS)
    return stored !== null ? JSON.parse(stored) : {}
}

export function areTooltipsEnabled(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_TOOLTIP_DISABLED) !== 'true'
}

export function setTooltipsEnabled(enabled: boolean) {
    if (enabled) {
        localStorage.removeItem(LOCAL_STORAGE_TOOLTIP_DISABLED)
    } else {
        localStorage.setItem(LOCAL_STORAGE_TOOLTIP_DISABLED, 'true')
    }
}

export function isTooltipExhausted(key: string): boolean {
    return (readTooltipCounters()[key] ?? 0) >= TOOLTIP_SHOW_LIMIT
}

export function countTooltipShown(key: string) {
    const counters = readTooltipCounters()
    const currentCount = counters[key] ?? 0

    if (currentCount < TOOLTIP_SHOW_LIMIT) {
        counters[key] = currentCount + 1
        localStorage.setItem(LOCAL_STORAGE_TOOLTIP_COUNTERS, JSON.stringify(counters))
    }
}

export function resetTooltipCounters() {
    localStorage.removeItem(LOCAL_STORAGE_TOOLTIP_COUNTERS)
}
