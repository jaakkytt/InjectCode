import { STORAGE_ALWAYS_ON_TIMING } from '../constants'
import { storage } from './storageApi'

export type AlwaysOnTiming = chrome.extensionTypes.RunAt

export const DEFAULT_ALWAYS_ON_TIMING: AlwaysOnTiming = 'document_idle'

const ALWAYS_ON_TIMINGS: AlwaysOnTiming[] = ['document_start', 'document_end', 'document_idle']

export function parseAlwaysOnTiming(value: unknown): AlwaysOnTiming {
    return ALWAYS_ON_TIMINGS.find(timing => timing === value) ?? DEFAULT_ALWAYS_ON_TIMING
}

export async function readAlwaysOnTiming(): Promise<AlwaysOnTiming> {
    return parseAlwaysOnTiming(await storage.getValue<unknown>(STORAGE_ALWAYS_ON_TIMING, DEFAULT_ALWAYS_ON_TIMING))
}

export function saveAlwaysOnTiming(timing: AlwaysOnTiming): Promise<void> {
    return storage.setValue(STORAGE_ALWAYS_ON_TIMING, timing)
}
