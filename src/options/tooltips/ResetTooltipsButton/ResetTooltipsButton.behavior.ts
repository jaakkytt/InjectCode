import { useState } from 'react'
import { resetTooltipCounters } from '../../../service/tooltipPreferences'

export function useResetTooltipsButtonBehavior() {
    const [wasReset, setWasReset] = useState(false)

    return {
        wasReset,
        handlers: {
            reset: () => {
                resetTooltipCounters()
                setWasReset(true)
            },
        },
    }
}
