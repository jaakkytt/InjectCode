import { createContext, useContext } from 'react'
import { RestoreRegistry } from '../service/viewRestore/restoreRegistry'
import { requireContext } from '../../shared/lib/requireContext'

export const restoreRegistryContext = createContext<RestoreRegistry | undefined>(undefined)

export function useRestoreRegistry(): RestoreRegistry {
    return requireContext(useContext(restoreRegistryContext), 'ViewRestoreProvider')
}
