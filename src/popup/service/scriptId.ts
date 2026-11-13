import { ScriptType } from '../../shared/types'

export function createScriptId(type: ScriptType): string {
    const dateTimeStringAsTitle = new Date().toLocaleString()
    return `${type}-${dateTimeStringAsTitle}-${Math.random().toString(36).substring(2, 10)}`
}
