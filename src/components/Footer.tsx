import * as React from 'react'
import { Button, Stack, Switch } from '@mui/material'
import './UrlTabs.css'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PublicIcon from '@mui/icons-material/Public'
import ExpandingActionButton from './ExpandingActionButton'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { useRunScope } from '../providers/RunScopeProvider'

interface Props {
    handleRunAll: () => void;
    handleRunCurrent: () => void;
}

const Footer = ({ handleRunAll, handleRunCurrent } : Props) => {

    const { scope, setScope } = useRunScope()

    const handleClick = () => {
        if (scope === 'current') {
            handleRunCurrent()
        } else {
            handleRunAll()
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setScope(event.target.checked ? 'global' : 'current')
    }

    return (
        <Stack direction="row" spacing={1} sx={{ pl: 1, pt: 0, pr: 1, pb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    startIcon={<PlayCircleOutlineIcon />}
                    variant="contained"
                    onClick={handleClick}
                >Run all</Button>
                <Stack direction="row" spacing={0} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button component="span" endIcon={<LocationOnIcon />} disabled>current tab</Button>
                    <Switch size="small" checked={scope === 'global'} onChange={handleChange} color="warning" />
                    <Button component="span" startIcon={<PublicIcon />} disabled>all tabs</Button>
                </Stack>
            </Stack>
            <ExpandingActionButton/>
        </Stack>
    )
}

export default Footer
