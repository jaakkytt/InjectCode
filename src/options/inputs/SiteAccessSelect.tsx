import { MenuItem, Select } from '@mui/material'
import React, { ReactNode, useEffect, useState } from 'react'

import { onSiteAccessChange, readSiteAccess, SiteAccess } from '../service/extensionSetup'

export interface Props {
    allSites: ReactNode
    specificSites: ReactNode
    onClick: ReactNode
}

const SiteAccessSelect = ({ allSites, specificSites, onClick }: Props) => {
    const [access, setAccess] = useState<SiteAccess | null>(null)

    useEffect(() => {
        let isMounted = true

        async function refresh() {
            const result = await readSiteAccess()
            if (isMounted) {
                setAccess(result)
            }
        }

        refresh()
        const unsubscribe = onSiteAccessChange(refresh)

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    return (
        <Select size="small" value={access ?? ''} disabled sx={{ minWidth: 180 }}>
            <MenuItem value="allSites">{allSites}</MenuItem>
            <MenuItem value="specificSites">{specificSites}</MenuItem>
            <MenuItem value="onClick">{onClick}</MenuItem>
        </Select>
    )
}

export default SiteAccessSelect
