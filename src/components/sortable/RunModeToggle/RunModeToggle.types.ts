import { ScriptRunMode } from '../../../types'

export interface Props {
    mode: ScriptRunMode
    onModeChange: (mode: ScriptRunMode) => void
    warning?: boolean
}
