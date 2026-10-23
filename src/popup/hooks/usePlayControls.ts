import * as React from 'react'
import { Script, ScriptsByPattern } from '../../shared/types'
import { RunScope } from '../types'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRunScope } from '../providers/RunScopeProvider'
import { scriptApi } from '../service/scriptApi'
import { SHARED_CODE } from '../../shared/constants'
import { useUrls } from '../providers/urlsContext'
import { useFeedbackDispatch } from '../providers/FeedbackProvider'
import { Message } from '../service/Message'
import { injectionTimeoutMs, readInjectionTimeout } from '../../shared/service/settings/injectionTimeout'

function deepCopyAndFilterRunnable(data: ScriptsByPattern): ScriptsByPattern {
    const result: ScriptsByPattern = {}
    for (const [key, items] of Object.entries(data)) {
        if (key === SHARED_CODE) {
            continue
        }
        const filtered = items.filter(item => item.runMode !== 'disabled')
        if (filtered.length > 0) {
            result[key] = filtered.map(item => ({ ...item }))
        }
    }
    return result
}

async function runWithTimeout(active: ScriptsByPattern, shared: Script[], scope: RunScope) {
    const timeoutSeconds = await readInjectionTimeout()
    const result = await scriptApi.run(active, shared, scope, injectionTimeoutMs(timeoutSeconds))
    return { result, timeoutSeconds }
}

export function usePlayControls(urls: ScriptsByPattern) {

    const [loading, setLoading] = useState(false)
    const { scope } = useRunScope()
    const mountedRef = useRef(true)
    const urlsContext = useUrls()
    const { show } = useFeedbackDispatch()

    useEffect(() => () => {
        mountedRef.current = false
    }, [])

    const active = useMemo(() => (
        deepCopyAndFilterRunnable(urls)
    ), [urls])

    const activeCount = Object.values(active).flat().length
    const disabled = activeCount === 0

    const onClick = useCallback(
        async (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            if (disabled || loading) {
                return
            }

            const shared = (urlsContext?.[SHARED_CODE] ?? []).filter(item => item.runMode !== 'disabled')

            setLoading(true)

            runWithTimeout(active, shared, scope).then(({ result, timeoutSeconds }) => {
                show(new Message(result, timeoutSeconds))
            }).catch((err) => {
                console.error('Error running scripts:', JSON.stringify(err))
                show(new Message('Error running scripts', 'error'))
            }).finally(() => {
                if (mountedRef.current) {
                    setLoading(false)
                }
            })
        },
        [disabled, active, scope, urlsContext, show],
    )

    const buttonProps = { disabled, onClick, loading } as const

    return { activeCount, disabled, onClick, buttonProps }
}
