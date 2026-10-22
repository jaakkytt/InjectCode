import React, { ReactNode } from 'react'
import { Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { useBackup } from './BackupProvider'

export interface Props {
    children: ReactNode
}

const ExportButton = ({ children }: Props) => {
    const { actions } = useBackup()

    return (
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => actions.exportBackup()}>
            {children}
        </Button>
    )
}

export default ExportButton
