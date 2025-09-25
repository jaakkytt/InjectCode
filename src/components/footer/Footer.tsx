import * as React from 'react'
import { Button, Stack } from '@mui/material'
import ExpandingActionButton from './ExpandingActionButton'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { useRunScope } from '../../providers/RunScopeProvider'
import { IconSwitch } from './IconSwitch'
import { RunScope } from '../../types'
import { useUrls } from '../../providers/UrlsContextProvider'
import { scriptApi } from '../../service/scriptApi'

const Footer = () => {

    const { scope, setScope } = useRunScope()
    const urls = useUrls()

    const handleClick = () => {
        // TODO: probably should use a dedicated play button component with its own state to reuse elsewhere
        // TODO: set up a spinner and disable the button while running
        scriptApi.run(urls, scope).catch((err) => {
            console.error('Error running scripts:', err)
            // TODO: show some error message to the user
        }).finally(() => {
            // TODO: remove spinner and re-enable the button
        })
    }

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
                    startIcon={<PlayCircleOutlineIcon />}
                    variant="contained"
                    onClick={handleClick}
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
