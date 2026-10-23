import { describe, expect, it } from 'vitest'
import { Message } from '../../src/types/Message'

const TIMEOUT_SECONDS = 5

describe('Message', () => {
    it('keeps a given message and severity as is', () => {
        expect(new Message('Saved', 'success')).toEqual({ message: 'Saved', severity: 'success' })
    })
})

describe('Message from a run result', () => {
    it('reports info when no tab matched', () => {
        expect(new Message({ executed: 0, failed: 0, timedOut: 0 }, TIMEOUT_SECONDS))
            .toEqual({ message: 'No matching tabs to run on', severity: 'info' })
    })

    it('reports success when every matching tab ran', () => {
        expect(new Message({ executed: 3, failed: 0, timedOut: 0 }, TIMEOUT_SECONDS))
            .toEqual({ message: 'Ran on 3 tabs', severity: 'success' })
    })

    it('uses the singular for a single tab', () => {
        expect(new Message({ executed: 1, failed: 0, timedOut: 0 }, TIMEOUT_SECONDS).message).toBe('Ran on 1 tab')
    })

    it('warns about timed out tabs with the timeout in seconds', () => {
        expect(new Message({ executed: 2, failed: 0, timedOut: 1 }, TIMEOUT_SECONDS))
            .toEqual({ message: 'Ran on 2 tabs, 1 tab did not respond within 5s', severity: 'warning' })
    })

    it('reports an error when a tab failed, even if another timed out', () => {
        expect(new Message({ executed: 0, failed: 2, timedOut: 1 }, TIMEOUT_SECONDS)).toEqual({
            message: 'Ran on 0 tabs, 1 tab did not respond within 5s, 2 tabs failed',
            severity: 'error',
        })
    })
})
