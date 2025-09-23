import * as React from 'react'
import { Stack } from '@mui/material'
import './UrlTabs.css'
import Skeleton from '@mui/material/Skeleton'
import Paper from '@mui/material/Paper'

const AccordionSkeleton = () => {
    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={1} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton height={16} sx={{ flexGrow: 1 }} />
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton variant="circular" width={30} height={30} />
            </Stack>
        </Paper>
    )
}

export default AccordionSkeleton
