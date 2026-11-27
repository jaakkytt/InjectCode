import React, { useEffect, useState } from 'react'
import { styled, Switch, switchClasses, SwitchProps } from '@mui/material'

type OffColor = Exclude<SwitchProps['color'], 'default' | undefined>

interface Props {
    check: () => Promise<boolean>
    offColor?: OffColor
}

const POLL_INTERVAL_MS = 5000

const StyledSwitch = styled(Switch, {
    shouldForwardProp: (prop) => prop !== 'offColor',
})<{ offColor?: OffColor }>(({ theme, offColor }) => offColor && {
    [`& .${switchClasses.switchBase}:not(.${switchClasses.checked})`]: {
        color: theme.lighten(theme.palette[offColor].main, 0.62),
        [`& + .${switchClasses.track}`]: {
            backgroundColor: theme.palette[offColor].main,
        },
    },
})

const SetupToggle = ({ check, offColor }: Props) => {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function refresh() {
            const result = await check()
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

    return <StyledSwitch checked={enabled} offColor={offColor} disabled />
}

export default SetupToggle
