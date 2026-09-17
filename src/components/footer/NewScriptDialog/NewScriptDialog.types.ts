import { ScriptType } from '../../../types'

export interface Props {
    isOpen: boolean
    scriptType: ScriptType
    onClose: () => void
}
