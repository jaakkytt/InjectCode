export type ScriptType = 'js' | 'css'

export type RunScope = 'global' | 'current'

export enum TabIndex {
    Current = 0,
    All = 1,
}

export interface AccordionItemData {
    id: string;
    title: string;
    secondaryText: string;
    content: string;
    active: boolean;
    type: ScriptType;
}

export type OnUpdateItem = (id: string, changes: Partial<AccordionItemData>) => void;

export type ItemsDataState = Record<string, AccordionItemData[]>;

export type StoreState = {
    committed: ItemsDataState
    working: ItemsDataState | null
    isDirty: boolean
}

export type ScriptPatch = Partial<AccordionItemData>

export type Action =
    | { name: 'hydrate'; payload: ItemsDataState }
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
