import { ScriptRunMode } from '../../../../shared/types'

export interface Props {
    mode: ScriptRunMode
    onModeChange: (mode: ScriptRunMode) => void
    warning?: boolean
}
