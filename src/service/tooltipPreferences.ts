import { LOCAL_STORAGE_TOOLTIP_COUNTERS, LOCAL_STORAGE_TOOLTIP_DISABLED } from '../constants'

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

export function resetTooltipCounters() {
    localStorage.removeItem(LOCAL_STORAGE_TOOLTIP_COUNTERS)
}
