import * as React from 'react'
import { Button, Stack } from '@mui/material'
import ExpandingActionButton from './ExpandingActionButton'
import { useRunScope } from '../../providers/RunScopeProvider'
import { IconSwitch } from './IconSwitch'
import { RunScope } from '../../types'
import { useUrls } from '../../providers/UrlsContextProvider'
import { usePlayControls } from '../usePlayControls'
import { PlayBadgeIcon } from '../PlayBadgeIcon'

const Footer = () => {

    const { scope, setScope } = useRunScope()
    const urls = useUrls()
    const play = usePlayControls(urls)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setScope(event.target.checked ? 'global' : 'current')
    }

    const renderTintedButton = (color: 'success' | 'warning', scopeValue: RunScope, label: string) => (
        <Button
            color={color}
            disableRipple={true}
            onClick={() => {
                if (scope !== scopeValue) {
                    setScope(scopeValue)
                }
            }}
            sx={{
                opacity: scope === scopeValue ? 1 : 0.5,
                cursor: scope === scopeValue ? 'default' : 'pointer',
                background: 'none',
            }}
        >{label}</Button>
    )

    return (
        <Stack direction="row" spacing={1} sx={{ pl: 1, pt: 0, pr: 1, pb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    startIcon={<PlayBadgeIcon count={play.activeCount} />}
                    variant="contained"
                    {...play.buttonProps}
                >Run all</Button>
                <Stack direction="row" spacing={0} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                    {renderTintedButton('success', 'current', 'current tab')}
                    <IconSwitch checked={scope === 'global'} onChange={handleChange} />
                    {renderTintedButton('warning', 'global', 'all tabs')}
                </Stack>
            </Stack>
            <ExpandingActionButton/>
        </Stack>
    )
}

export default Footer
