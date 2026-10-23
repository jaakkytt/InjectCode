import React, { useState } from 'react'
import { Box, Link } from '@mui/material'
import { resetTooltipCounters } from '../../service/tooltipPreferences'

const ResetTooltipsLink = () => {
    const [wasReset, setWasReset] = useState(false)

    function handleReset() {
        resetTooltipCounters()
        setWasReset(true)
    }

    return (
        <>
            <Link component="button" underline="hover" sx={{ verticalAlign: 'baseline' }} onClick={handleReset}>
                Reset tooltip counters
            </Link>
            {wasReset && (
                <>
                    {' '}
                    <Box component="span" role="status" sx={{ color: 'success.main' }}>
                        Done. Hints will show again the next time you open the popup.
                    </Box>
                </>
            )}
        </>
    )
}

export default ResetTooltipsLink
