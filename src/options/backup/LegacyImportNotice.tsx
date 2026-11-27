import { Alert } from '@mui/material'
import React, { ReactNode, useEffect, useState } from 'react'

import { importLegacyScriptsOnce, LegacyImportResult } from '../service/legacyImport'

const LegacyImportNotice = ({ imported, failed }: { imported: ReactNode, failed: ReactNode }) => {
    const [result, setResult] = useState<LegacyImportResult | null>(null)

    useEffect(() => {
        importLegacyScriptsOnce().then(setResult)
    }, [])

    if (result === null || result.status === 'nothing') {
        return null
    }

    if (result.status === 'failed') {
        return <Alert severity="error">{failed}</Alert>
    }

    return <Alert severity="info">{imported} {result.summary.added}</Alert>
}

export default LegacyImportNotice
