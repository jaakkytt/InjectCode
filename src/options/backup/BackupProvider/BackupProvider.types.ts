import { ReactNode } from 'react'

export interface Notice {
    severity: 'success' | 'info' | 'error'
    text: string
    details: string[]
}

export interface BackupValue {
    notice: Notice | null
    actions: {
        exportBackup: () => Promise<void>
        importBackup: (file: File) => Promise<void>
        dismissNotice: () => void
    }
}

export interface Props {
    children: ReactNode
}
