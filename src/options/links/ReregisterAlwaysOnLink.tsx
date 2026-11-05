import React, { ReactNode, useState } from 'react'
import { Box, Link } from '@mui/material'
import { requestAlwaysOnResync } from '../service/extensionSetup'

export interface Props {
    children: ReactNode
}

type Result = 'reregistered' | 'notAllowed' | 'failed'

const RESULT_TEXT: Record<Result, string> = {
    reregistered: 'Re-registered. Reload the pages you want them on.',
    notAllowed: 'Turn on "Allow User Scripts" first.',
    failed: 'Re-registering failed, see Finding errors above.',
}

const RESULT_COLOR: Record<Result, string> = {
    reregistered: 'success.main',
    notAllowed: 'warning.main',
    failed: 'error.main',
}

const ReregisterAlwaysOnLink = ({ children }: Props) => {
    const [result, setResult] = useState<Result | null>(null)

    async function handleReregister() {
        try {
            setResult(await requestAlwaysOnResync() ? 'reregistered' : 'notAllowed')
        } catch (err) {
            console.error('Failed to re-register Always on scripts:', err)
            setResult('failed')
        }
    }

    return (
        <>
            <Link component="button" underline="hover" sx={{ verticalAlign: 'baseline' }} onClick={handleReregister}>
                {children}
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

export default ReregisterAlwaysOnLink
