import { matchPattern, presets } from 'browser-extension-url-match'
import { ALL_URL, BACKGROUND_URL } from '../constants'
import { MatcherOrInvalid } from 'browser-extension-url-match/dist/types'

export const urlPatternMatcher = (pattern: string): MatcherOrInvalid => {
    return matchPattern(pattern === BACKGROUND_URL ? ALL_URL : pattern, presets.chrome)
}
