import React from 'react'
import { useRunScope } from '../../../providers/RunScopeProvider'
import { useUrls } from '../../../providers/urlsContext'
import { usePlayControls } from '../../usePlayControls'
import { RunScope } from '../../../types'

export function useFooterBehavior() {
    const { scope, setScope } = useRunScope()
    const urls = useUrls()
    const play = usePlayControls(urls)

    function selectScope(scopeValue: RunScope) {
        if (scope !== scopeValue) {
            setScope(scopeValue)
        }
    }

    return {
        scope,
        play,
        handlers: {
            handleChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                setScope(event.target.checked ? 'global' : 'current')
            },
            selectCurrentScope: () => selectScope('current'),
            selectGlobalScope: () => selectScope('global'),
        },
    }
}
