import { STORAGE_FEEDBACK_AUTO_HIDE } from '../constants'
import { FeedbackSeverity } from '../types'
import { storage } from './storageApi'

export type FeedbackAutoHideMs = number | null

export type FeedbackAutoHideBySeverity = Record<FeedbackSeverity, FeedbackAutoHideMs>

export const DEFAULT_FEEDBACK_AUTO_HIDE: FeedbackAutoHideBySeverity = {
    success: 1000,
    info: 2000,
    warning: 10000,
    error: 10000,
}

function isAutoHideMs(value: unknown): value is FeedbackAutoHideMs {
    return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0)
}

function parseFeedbackAutoHide(value: unknown): FeedbackAutoHideBySeverity {
    const stored = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
    const severities = Object.keys(DEFAULT_FEEDBACK_AUTO_HIDE) as FeedbackSeverity[]

    return Object.fromEntries(severities.map(severity => [
        severity,
        isAutoHideMs(stored[severity]) ? stored[severity] : DEFAULT_FEEDBACK_AUTO_HIDE[severity],
    ])) as FeedbackAutoHideBySeverity
}

export async function readFeedbackAutoHide(): Promise<FeedbackAutoHideBySeverity> {
    const stored = await storage.getValue<unknown>(STORAGE_FEEDBACK_AUTO_HIDE, DEFAULT_FEEDBACK_AUTO_HIDE)
    return parseFeedbackAutoHide(stored)
}

export function saveFeedbackAutoHide(autoHide: FeedbackAutoHideBySeverity): Promise<void> {
    return storage.setValue(STORAGE_FEEDBACK_AUTO_HIDE, autoHide)
}
