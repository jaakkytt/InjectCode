import { createContext, useContext } from 'react'

import { requireContext } from '../../shared/lib/requireContext'
import { RestoreRegistry } from '../service/viewRestore/restoreRegistry'

export const restoreRegistryContext = createContext<RestoreRegistry | undefined>(undefined)

export function useRestoreRegistry(): RestoreRegistry {
    return requireContext(useContext(restoreRegistryContext), 'ViewRestoreProvider')
}
