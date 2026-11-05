import React, { useState } from 'react'
import { Box, Link } from '@mui/material'
import { requestAlwaysOnResync } from '../service/extensionSetup'

type Result = 'applied' | 'notAllowed' | 'failed'

const RESULT_TEXT: Record<Result, string> = {
    applied: 'Done. Reload the pages you want them on.',
    notAllowed: 'Turn on "Allow User Scripts" first.',
    failed: 'Applying failed, see Finding errors below.',
}

const RESULT_COLOR: Record<Result, string> = {
    applied: 'success.main',
    notAllowed: 'warning.main',
    failed: 'error.main',
}

const ApplyAlwaysOnLink = () => {
    const [result, setResult] = useState<Result | null>(null)

    async function handleApply() {
        try {
            setResult(await requestAlwaysOnResync() ? 'applied' : 'notAllowed')
        } catch (err) {
            console.error('Failed to apply Always on scripts:', err)
            setResult('failed')
        }
    }

    return (
        <>
            <Link component="button" underline="hover" sx={{ verticalAlign: 'baseline' }} onClick={handleApply}>
                Apply Always on scripts
            </Link>
            {result && (
                <>
                    {' '}
                    <Box component="span" role="status" sx={{ color: RESULT_COLOR[result] }}>
                        {RESULT_TEXT[result]}
                    </Box>
                </>
            )}
        </>
    )
}

export default ApplyAlwaysOnLink
