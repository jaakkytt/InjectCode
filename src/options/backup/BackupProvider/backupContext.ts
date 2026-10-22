import { createContext, useContext } from 'react'
import { BackupValue } from './BackupProvider.types'

export const backupContext = createContext<BackupValue | undefined>(undefined)

export function useBackup() {
    const context = useContext(backupContext)
    if (!context) {
        throw new Error('useBackup must be used within <BackupProvider>')
    }
    return context
}
