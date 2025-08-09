export type ScriptType = 'js' | 'css'

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
