import React from 'react'
import { useTab } from '../../providers/TabProvider'

export function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tab-panel-${index}`,
    }
}

export function useUrlTabsBehavior() {
    const { tabIndex, setTabIndex } = useTab()

    return {
        tabIndex,
        handlers: {
            change: (_event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue),
            settingsClick: (e: React.MouseEvent) => {
                e.preventDefault()
                chrome.runtime.openOptionsPage()
            },
        },
    }
}
