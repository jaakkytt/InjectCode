import React, { ReactNode } from 'react'
import { Link } from '@mui/material'

const ExternalLink = ({ children, href }: { children: ReactNode, href?: string | undefined }) => (
    <Link
        href={href}
        target="_blank"
        underline="hover"
        rel="noreferrer"
        title="opens in new tab"
    >
        {children}
    </Link>
)

export default ExternalLink
