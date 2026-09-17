import React from 'react'
import { Button, Stack } from '@mui/material'
import ExpandingActionButton from '../ExpandingActionButton'
import { IconSwitch } from '../IconSwitch'
import { PlayBadgeIcon } from '../../PlayBadgeIcon'
import { useFooterBehavior } from './Footer.behavior'
import { rootStackSx, leftStackSx, scopeStackSx } from './Footer.styles'
import TintedScopeButton from './TintedScopeButton'

const Footer = () => {
    const { scope, play, handlers } = useFooterBehavior()

    return (
        <Stack direction="row" spacing={1} sx={rootStackSx}>
            <Stack direction="row" spacing={2} sx={leftStackSx}>
                <Button
                    startIcon={<PlayBadgeIcon count={play.activeCount} />}
                    variant="contained"
                    {...play.buttonProps}
                >Run all</Button>
                <Stack direction="row" spacing={0} sx={scopeStackSx}>
                    <TintedScopeButton
                        color="success"
                        label="current tab"
                        active={scope === 'current'}
                        onClick={handlers.selectCurrentScope}
                    />
                    <IconSwitch checked={scope === 'global'} onChange={handlers.handleChange} />
                    <TintedScopeButton
                        color="warning"
                        label="all tabs"
                        active={scope === 'global'}
                        onClick={handlers.selectGlobalScope}
                    />
                </Stack>
            </Stack>
            <ExpandingActionButton/>
        </Stack>
    )
}

export default Footer
