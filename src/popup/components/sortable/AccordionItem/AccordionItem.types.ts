import React from 'react'
import { Script } from '../../../../shared/types'

export interface Props {
    containerId: string
    items: Script[]
    isExpanded: boolean
    onParentChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
    allowEditing: boolean
    onRename: (newKey: string) => void
    onRemove: () => void
    expandedPanel: string | false
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}
