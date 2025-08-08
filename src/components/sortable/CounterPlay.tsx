import React, { useEffect, useState } from 'react'
import { Badge, badgeClasses, IconButton, styled } from '@mui/material'
import Typography from '@mui/material/Typography'
import { AccordionItemData } from '../../types'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'

interface Props {
    items: AccordionItemData[];
    onClick: () => void;
}

export default function CounterPlay({ items, onClick }: Props) {

    const [activeCount, setActiveCount] = useState(items.filter(item => item.active).length)

    useEffect(() => setActiveCount(items.filter(item => item.active).length), [items])

    const StyledBadge = styled(Badge)`
        & .${badgeClasses.badge} {
            top: -12px;
            right: 0;
            font-weight: bold;
        }
    `

    return (
        <Typography component="span" onClick={(e) => {
            if (activeCount > 0) {
                onClick()
            }
            e.stopPropagation()
        }}>
            <IconButton component="span" disabled={activeCount < 1} color="primary" aria-label="play">
                <PlayCircleOutlineIcon />
                <StyledBadge badgeContent={activeCount} color="default" overlap="circular" />
            </IconButton>
        </Typography>
    )
}
