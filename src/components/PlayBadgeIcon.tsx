import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { Badge, badgeClasses, styled } from '@mui/material'
import { useMemo } from 'react'

export function PlayBadgeIcon({ count }: { count: number }) {
    const StyledBadge = useMemo(() => styled(Badge)`
        & .${badgeClasses.badge} {
            top: 2px;
            right: -1px;
            font-weight: bold;
        }
    `, [])

    return (
        <StyledBadge badgeContent={count} overlap="circular" aria-label="Run">
            <PlayCircleOutlineIcon />
        </StyledBadge>
    )
}
