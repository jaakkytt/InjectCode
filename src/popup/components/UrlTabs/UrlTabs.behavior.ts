import React from 'react'

import { TabIndex } from '../../types'
import { useView, useViewDispatch } from '../../providers/ViewProvider'

export function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tab-panel-${index}`,
    }
}

export function useUrlTabsBehavior() {
    const view = useView()
    const { selectView } = useViewDispatch()

    return {
        tabIndex: view,
        handlers: {
            change: (_event: React.SyntheticEvent, newValue: TabIndex) => selectView(newValue),
            settingsClick: (e: React.MouseEvent) => {
                e.preventDefault()
                chrome.runtime.openOptionsPage()
            },
        },
    }
}
