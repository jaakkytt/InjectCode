import React from 'react'
import { AccordionItemData } from '../../../types'

export interface Props {
    containerId: string
    items: AccordionItemData[]
    isExpanded: boolean
    onParentChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
    allowEditing: boolean
    onRename: (newKey: string) => void
    onRemove: () => void
    expandedPanel: string | false
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}
