import React from 'react'
import { Script } from '../../../../shared/types'

export interface Props {
    item: Script
    parentId: string
    expandedPanel: string | false
    onAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}
