import React, { useMemo } from 'react'
import { Script, ScriptsByPattern } from '../../shared/types'
import { UrlsContext, useUrls } from './urlsContext'
import { urlPatternMatcher } from '../../shared/service/urlPatternMatcher'

type UrlsFilter = (containerId: string, items: Script[]) => boolean

interface Props {
    children?: React.ReactNode
    activePageUrl: string
}

export function UrlsFilterScope({ children, activePageUrl }: Props) {
    const all = useUrls()

    const filter = useMemo<UrlsFilter>(() => {
        const byContainerId: UrlsFilter = (containerId) => {
            const matcher = urlPatternMatcher(containerId)
            if (!matcher.valid) {
                return false
            }
            return matcher.match(activePageUrl)
        }

        return byContainerId
    }, [activePageUrl])

    const filtered = useMemo(() => {
        const out: ScriptsByPattern = {}
        for (const [id, items] of Object.entries(all)) {
            if (filter(id, items)) out[id] = items
        }
        return out
    }, [all, filter])

    return <UrlsContext.Provider value={filtered}>{children}</UrlsContext.Provider>
}
