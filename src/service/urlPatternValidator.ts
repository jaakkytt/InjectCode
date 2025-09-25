import { matchPattern, presets } from 'browser-extension-url-match'
import { RESERVED_URL } from '../constants'

const checkScheme = (value: string) : string | undefined => {
    if (value[0] === 'h') {
        return value.startsWith('http://') || value.startsWith('https://') ? undefined : 'A http(s) scheme must start with "http://" or "https://"'
    }
    if (value[0] === '*') {
        return value.startsWith('*://') ? undefined : 'A wildcard scheme must start with "*://"'
    }
    if (value[0] === 'f') {
        return value.startsWith('file:///') ? undefined : 'A file scheme must start with "file:///"'
    }
    return 'Pattern must start with a scheme "http://", "https://", "*://", or "file:///"'
}

const checkHost = (value: string) : string | undefined => {
    if (value.startsWith('file:///')) {
        return undefined
    }

    const urlParts = value.split('/')
    if (urlParts.length < 4) {
        return 'Pattern must include a host and a path'
    }

    const hostPart = urlParts[2]
    if (hostPart === 'localhost') {
        return undefined
    }

    if (!hostPart.includes('.') || hostPart.endsWith('.')) {
        return 'Host must be a valid domain name or IP address'
    }
    return undefined
}

const patchWildcardError = (value: string, originalError: string) => {
    const asHttp = value.replace(/^\*:/, 'http:')
    const matcher = matchPattern(asHttp, presets.chrome)

    if (matcher.valid) {
        return originalError
    }

    return matcher.error.message.replaceAll('http:', '*:')
}

export const urlPatternValidator = async (value: string, existing: string[]) => {
    if (value.trim() === '') {
        return 'Pattern must follow the structure <scheme>://<host>/<path>'
    }

    if (value === RESERVED_URL) {
        return `"${RESERVED_URL}" is reserved and cannot be used`
    }

    // Error message by matchPattern is too generic for this case
    const schemeError = checkScheme(value)
    if (schemeError !== undefined) {
        return schemeError
    }

    // Error message by matchPattern is too generic for this case
    if (value.endsWith('://')) {
        return 'Pattern must also include a host and a path'
    }

    // matchPattern does not check file path presence
    if (value.endsWith(':///')) {
        return 'Pattern must also include a path'
    }

    if (existing.includes(value)) {
        return `"${value}" already exists`
    }

    const matcher = matchPattern(value, presets.chrome)
    if (matcher.valid) {
        if (value.startsWith('file:///')) {
            const isAllowed = await chrome.extension?.isAllowedFileSchemeAccess()
            if (!isAllowed) {
                return 'File scheme access is not allowed. Please enable it in the extension settings.'
            }
        }

        const hostError = checkHost(value)
        if (hostError !== undefined) {
            return hostError
        }

        return undefined
    }

    // See https://github.com/clearlylocal/browser-extension-url-match/issues/4
    if (value.startsWith('*://') && matcher.error.message === `Pattern "${value}" is invalid`) {
        return patchWildcardError(value, matcher.error.message)
    }

    return matcher.error.message
}
