import { SHARED_CODE } from '../../shared/constants'
import { ScriptsByPattern } from '../../shared/types'

export function orderUrlBlocks(scripts: ScriptsByPattern): ScriptsByPattern {
    const urlBlockIds = Object.keys(scripts).filter(id => id !== SHARED_CODE).sort()
    const orderedIds = SHARED_CODE in scripts ? [SHARED_CODE, ...urlBlockIds] : urlBlockIds

    return Object.fromEntries(orderedIds.map(id => [id, scripts[id]]))
}
