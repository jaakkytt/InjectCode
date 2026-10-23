import { STORAGE_INJECTION_TIMEOUT } from '../../constants'
import { storage } from '../storageApi'

export const DEFAULT_INJECTION_TIMEOUT_SECONDS = 5

const MAX_TIMER_MS = 2_147_483_647

export function parseInjectionTimeout(value: unknown): number | null {
    const seconds = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
    return typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

export function injectionTimeoutMs(seconds: number): number {
    return Math.min(seconds * 1000, MAX_TIMER_MS)
}

export async function readInjectionTimeout(): Promise<number> {
    const stored = await storage.getValue<unknown>(STORAGE_INJECTION_TIMEOUT, DEFAULT_INJECTION_TIMEOUT_SECONDS)
    return parseInjectionTimeout(stored) ?? DEFAULT_INJECTION_TIMEOUT_SECONDS
}

export function saveInjectionTimeout(seconds: number): Promise<void> {
    return storage.setValue(STORAGE_INJECTION_TIMEOUT, seconds)
}
