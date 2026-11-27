import { STORAGE_VIEW_RESTORE_MODE } from '../../constants'
import { storage } from '../storageApi'

export const DEFAULT_VIEW_RESTORE_MODE: ViewRestoreMode = 'sameHost'

const VIEW_RESTORE_MODES: ViewRestoreMode[] = ['off', 'sameTab', 'sameHost']

export type ViewRestoreMode = 'off' | 'sameTab' | 'sameHost'

export function parseViewRestoreMode(value: unknown): ViewRestoreMode {
    return VIEW_RESTORE_MODES.find(mode => mode === value) ?? DEFAULT_VIEW_RESTORE_MODE
}

export async function readViewRestoreMode(): Promise<ViewRestoreMode> {
    return parseViewRestoreMode(await storage.getValue<unknown>(STORAGE_VIEW_RESTORE_MODE, DEFAULT_VIEW_RESTORE_MODE))
}

export function saveViewRestoreMode(mode: ViewRestoreMode): Promise<void> {
    return storage.setValue(STORAGE_VIEW_RESTORE_MODE, mode)
}
