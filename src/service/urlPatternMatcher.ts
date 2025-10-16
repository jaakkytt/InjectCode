import { matchPattern, presets } from 'browser-extension-url-match'
import { ALL_URL, SHARED_CODE } from '../constants'
import { MatcherOrInvalid } from 'browser-extension-url-match/dist/types'

export const urlPatternMatcher = (pattern: string): MatcherOrInvalid => {
    return matchPattern(pattern === SHARED_CODE ? ALL_URL : pattern, presets.chrome)
}
