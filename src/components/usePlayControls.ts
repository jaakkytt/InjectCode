import * as React from 'react'
import { ItemsDataState } from '../types'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRunScope } from '../providers/RunScopeProvider'
import { scriptApi } from '../service/scriptApi'
import { SHARED_CODE } from '../constants'
import { useUrls } from '../providers/UrlsContextProvider'

function deepCopyAndFilterInactive(data: ItemsDataState): ItemsDataState {
    const result: ItemsDataState = {}
    for (const [key, items] of Object.entries(data)) {
        if (key === SHARED_CODE) {
            continue
        }
        const filtered = items.filter(item => item.active)
        if (filtered.length > 0) {
            result[key] = filtered.map(item => ({ ...item }))
        }
    }
    return result
}

export function usePlayControls(urls: ItemsDataState) {

    const [loading, setLoading] = useState(false)
    const { scope } = useRunScope()
    const mountedRef = useRef(true)
    const urlsContext = useUrls()

    useEffect(() => () => {
        mountedRef.current = false
    }, [])

    const active = useMemo(() => (
        deepCopyAndFilterInactive(urls)
    ), [urls])

    const activeCount = Object.values(active).flat().length
    const disabled = activeCount === 0

    const onClick = useCallback(
        async (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            if (disabled || loading) {
                return
            }

            const shared = (urlsContext?.[SHARED_CODE] ?? []).filter(item => item.active)

            setLoading(true)

            scriptApi.run(active, shared, scope).catch((err) => {
                console.error('Error running scripts:', err)
                // TODO: show some error message to the user
            }).finally(() => {
                if (mountedRef.current) {
                    setLoading(false)
                }
            })
        },
        [disabled, active],
    )

    const buttonProps = { disabled, onClick, loading } as const

    return { activeCount, disabled, onClick, buttonProps }
}
