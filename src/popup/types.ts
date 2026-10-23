import { Script, ScriptsByPattern, ScriptType } from '../shared/types'

export type RunScope = 'global' | 'current'

export enum TabIndex {
    Current = 0,
    All = 1,
}

export type StoreState = {
    committed: ScriptsByPattern
    working: ScriptsByPattern | null
    isDirty: boolean
}

export type ScriptPatch = Partial<Script>

export type Action =
    | { name: 'hydrate'; payload: ScriptsByPattern }
    | { name: 'dragStart' }
    | {
        name: 'dragAcrossContainer'
        itemId: string
        fromId: string
        fromIndex: number
        toId: string
        toIndex: number
    }
    | {
        name: 'dragWithinContainer'
        containerId: string
        fromIndex: number
        toIndex: number
    }
    | { name: 'dragDrop' }
    | { name: 'dragCancel' }
    | { name: 'added'; id: string }
    | { name: 'renamed'; id: string; title: string }
    | { name: 'deleted'; id: string }
    | { name: 'scriptAdd'; containerId: string; type: ScriptType; title: string; }
    | { name: 'scriptUpdate'; containerId: string; scriptId: string; patch: ScriptPatch }
    | { name: 'scriptDelete'; containerId: string; scriptId: string }
