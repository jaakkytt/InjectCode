export interface AccordionItemData {
    id: string;
    title: string;
    secondaryText: string;
    content: string;
    active: boolean;
}

export type OnUpdateItem = (id: string, changes: Partial<AccordionItemData>) => void;
