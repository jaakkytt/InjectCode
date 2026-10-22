import React, { useEffect, useState } from 'react'
import { Switch } from '@mui/material'
import { isFileAccessEnabled, isUserScriptsEnabled } from '../../service/extensionSetup'

export type SetupCheck = 'userScripts' | 'fileAccess'

export interface Props {
    check: SetupCheck
}

const POLL_INTERVAL_MS = 5000

const CHECKS: Record<SetupCheck, () => Promise<boolean>> = {
    userScripts: isUserScriptsEnabled,
    fileAccess: isFileAccessEnabled,
}

const SetupToggle = ({ check }: Props) => {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function refresh() {
            const result = await CHECKS[check]()
            if (isMounted) {
                setEnabled(result)
            }
        }

        refresh()
        const interval = setInterval(refresh, POLL_INTERVAL_MS)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [check])

    return <Switch checked={enabled} disabled />
}

export default SetupToggle
