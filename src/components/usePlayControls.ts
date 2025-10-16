import * as React from 'react'
import { ItemsDataState } from '../types'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRunScope } from '../providers/RunScopeProvider'
import { scriptApi } from '../service/scriptApi'
import { BACKGROUND_URL } from '../constants'

function deepCopyAndFilterInactive(data: ItemsDataState): ItemsDataState {
    const result: ItemsDataState = {}
    for (const [key, items] of Object.entries(data)) {
        const filtered = items.filter(item => item.active)
        if (filtered.length > 0) {
            result[key] = filtered.map(item => ({ ...item }))
        }
    }
    return result
}

export function usePlayControls(urls: ItemsDataState) {

    const [loading, setLoading] = useState(false)
    const mountedRef = useRef(true)
    const { scope } = useRunScope()

    useEffect(() => () => {
        mountedRef.current = false
    }, [])

    const active = useMemo(() => (
        deepCopyAndFilterInactive(urls)
    ), [urls])

    const activeCount = Object.entries(active).reduce((sum, [key, items]) =>
        key === BACKGROUND_URL ? sum : sum + items.length
    , 0)

    const disabled = activeCount === 0

    const onClick = useCallback(
        async (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            if (disabled || loading) {
                return
            }

            setLoading(true)

            scriptApi.run(active, scope).catch((err) => {
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
