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

    function handleSettingsClick(e: React.MouseEvent) {
        e.preventDefault()
        chrome.runtime.openOptionsPage()
    }

    return {
        tabIndex,
        handlers: {
            handleChange: (_event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue),
            handleSettingsClick,
        },
    }
}
