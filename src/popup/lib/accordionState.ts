export interface AccordionState {
    openCodeBlock: string | null
    closedUrlBlocks: string[]
}

export function withUrlBlockOpen(state: AccordionState, urlBlockId: string, isOpen: boolean): AccordionState {
    const closed = new Set(state.closedUrlBlocks)
    if (isOpen) {
        closed.delete(urlBlockId)
    } else {
        closed.add(urlBlockId)
    }
    return { ...state, closedUrlBlocks: [...closed] }
}

export function withCodeBlockOpen(state: AccordionState, scriptId: string, isOpen: boolean): AccordionState {
    return { ...state, openCodeBlock: isOpen ? scriptId : null }
}

export function withUrlBlockRenamed(state: AccordionState, oldId: string, newId: string): AccordionState {
    return { ...state, closedUrlBlocks: state.closedUrlBlocks.map(id => id === oldId ? newId : id) }
}
