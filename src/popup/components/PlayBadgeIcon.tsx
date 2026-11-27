import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import { Badge, badgeClasses, styled } from '@mui/material'

const StyledBadge = styled(Badge)`
    & .${badgeClasses.badge} {
        top: 2px;
        right: -1px;
        font-weight: bold;
    }
`

export function PlayBadgeIcon({ count }: { count: number }) {
    return (
        <StyledBadge badgeContent={count} overlap="circular" aria-label="Run">
            <PlayCircleOutlineIcon />
        </StyledBadge>
    )
}
