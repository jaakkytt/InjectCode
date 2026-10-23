import { ScriptsByPattern } from '../../shared/types'
import { isFileAccessEnabled } from './extensionSetup'

interface DisabledFilePatternScripts {
    scripts: ScriptsByPattern
    disabled: number
}

export async function disableFilePatternScripts(scripts: ScriptsByPattern): Promise<DisabledFilePatternScripts> {
    if (await isFileAccessEnabled()) {
        return { scripts, disabled: 0 }
    }

    let disabled = 0

    const next = Object.fromEntries(Object.entries(scripts).map(([pattern, items]) => {
        if (!pattern.startsWith('file:///')) {
            return [pattern, items]
        }

        return [pattern, items.map(item => {
            if (item.runMode === 'disabled') {
                return item
            }

            disabled += 1
            return { ...item, runMode: 'disabled' as const }
        })]
    }))

    return { scripts: next, disabled }
}
