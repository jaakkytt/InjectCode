import { Switch } from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import React from 'react'

const DarkModeToggle = () => {
    const { mode, setMode } = useColorScheme()

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMode(event.target.checked ? 'dark' : 'light')
    }

    return <Switch checked={mode === 'dark'} onChange={handleChange} />
}

export default DarkModeToggle
