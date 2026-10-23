import { ScriptType } from '../../../../shared/types'

export interface Props {
    isOpen: boolean
    scriptType: ScriptType
    onClose: () => void
}
