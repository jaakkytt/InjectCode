import React from 'react'
import { AccordionItemData } from '../../../types'

export interface Props {
    item: AccordionItemData
    parentId: string
    expandedPanel: string | false
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}
