import React, { ReactNode } from 'react'
import { Button } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { useBackup } from '../providers/BackupProvider'

export interface Props {
    children: ReactNode
}

const ImportButton = ({ children }: Props) => {
    const { actions } = useBackup()

    async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (file) {
            await actions.importBackup(file)
        }
    }

    return (
        <Button component="label" variant="outlined" startIcon={<FileUploadIcon />}>
            {children}
            <input hidden type="file" accept=".json,application/json" onChange={handleFileSelected} />
        </Button>
    )
}

export default ImportButton
