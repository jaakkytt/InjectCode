import React, { useState } from 'react'
import { Switch } from '@mui/material'
import { areTooltipsEnabled, setTooltipsEnabled } from '../../service/tooltipPreferences'

const TooltipsToggle = () => {
    const [enabled, setEnabled] = useState(areTooltipsEnabled)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setTooltipsEnabled(event.target.checked)
        setEnabled(event.target.checked)
    }

    return <Switch checked={enabled} onChange={handleChange} />
}

export default TooltipsToggle
