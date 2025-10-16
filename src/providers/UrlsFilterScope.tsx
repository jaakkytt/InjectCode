import React, { useMemo } from 'react'
import { AccordionItemData, ItemsDataState } from '../types'
import { UrlsContext, useUrls } from './UrlsContextProvider'
import { urlPatternMatcher } from '../service/urlPatternMatcher'

type UrlsFilter = (containerId: string, items: AccordionItemData[]) => boolean

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
        const out: ItemsDataState = {}
        for (const [id, items] of Object.entries(all)) {
            if (filter(id, items)) out[id] = items
        }
        return out
    }, [all, filter])

    return <UrlsContext.Provider value={filtered}>{children}</UrlsContext.Provider>
}
