import React from 'react'
import { Props } from './BackupProvider.types'
import { backupContext } from './backupContext'
import { useBackupProviderBehavior } from './BackupProvider.behavior'

const BackupProvider = ({ children }: Props) => {
    const value = useBackupProviderBehavior()

    return (
        <backupContext.Provider value={value}>
            {children}
        </backupContext.Provider>
    )
}

export default BackupProvider
