import { FeedbackSeverity } from './index'
import { RunResult } from '../service/scriptApi'
import { s } from '../lib/text'

function describeRun(result: RunResult, timeoutSeconds: number): string {
    if (result.executed + result.failed + result.timedOut === 0) {
        return 'No matching tabs to run on'
    }

    const parts = [`Ran on ${result.executed} tab${s(result.executed)}`]

    if (result.timedOut > 0) {
        parts.push(`${result.timedOut} tab${s(result.timedOut)} did not respond within ${timeoutSeconds}s`)
    }

    if (result.failed > 0) {
        parts.push(`${result.failed} tab${s(result.failed)} failed`)
    }

    return parts.join(', ')
}

function runSeverity(result: RunResult): FeedbackSeverity {
    if (result.failed > 0) {
        return 'error'
    }

    if (result.timedOut > 0) {
        return 'warning'
    }

    return result.executed > 0 ? 'success' : 'info'
}

export class Message {
    readonly message: string
    readonly severity: FeedbackSeverity

    constructor(message: string, severity: FeedbackSeverity)
    constructor(result: RunResult, timeoutSeconds: number)
    constructor(messageOrResult: string | RunResult, severityOrTimeout: FeedbackSeverity | number) {
        if (typeof messageOrResult === 'string') {
            this.message = messageOrResult
            this.severity = severityOrTimeout as FeedbackSeverity
            return
        }

        this.message = describeRun(messageOrResult, severityOrTimeout as number)
        this.severity = runSeverity(messageOrResult)
    }
}
