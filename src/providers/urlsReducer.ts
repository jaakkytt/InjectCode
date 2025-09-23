import { Action, ItemsDataState, StoreState } from '../types'

function arrayMove<T>(arr: readonly T[], from: number, to: number): T[] {
    if (from === to) return arr.slice()
    const copy = arr.slice()
    const [itm] = copy.splice(from, 1)
    copy.splice(to, 0, itm)
    return copy
}

function applyScriptAction(state: ItemsDataState, action: Action): ItemsDataState {
    switch (action.name) {
        case 'scriptAdd': {
            const dateTimeStringAsTitle = new Date().toLocaleString()
            const newItemId = `${action.type}-${dateTimeStringAsTitle}-${Math.random().toString(36).substring(2, 10)}`
            const script = {
                id: newItemId,
                title: action.title,
                secondaryText: '',
                content: '',
                active: true,
                type: action.type,
            }

            const arr = state[action.containerId] ?? []
            return { ...state, [action.containerId]: [...arr, script] }
        }
        case 'scriptUpdate': {
            const { containerId, scriptId, patch } = action
            const arr = state[containerId] ?? []
            const next = arr.map((s) => (s.id === scriptId ? { ...s, ...patch } : s))
            return { ...state, [containerId]: next }
        }
        case 'scriptDelete': {
            const arr = state[action.containerId] ?? []
            const next = arr.filter((s) => s.id !== action.scriptId)
            return { ...state, [action.containerId]: next }
        }
        default:
            return state
    }
}

function ensureWorking(state: StoreState): StoreState {
    return state.working
        ? state
        : { committed: state.committed, working: { ...state.committed }, isDirty: true }
}

function applyNormalAction(state: ItemsDataState, action: Action): ItemsDataState {
    switch (action.name) {
        case 'added': {
            return { ...state, [action.id]: [] }
        }
        case 'renamed': {
            const { id, title } = action
            const { [id]: old, ...rest } = state
            if (!old) {
                return state
            }

            const updated = { ...rest, [title]: old }

            const [first, ...others] = Object.keys(updated)

            return [first, ...others.sort()].reduce((acc, k) => {
                acc[k] = updated[k]
                return acc
            }, {} as ItemsDataState)
        }
        case 'deleted': {
            const copy = { ...state }
            delete copy[action.id]
            return copy
        }
        default:
            return state
    }
}

export function urlsRootReducer(state: StoreState, action: Action): StoreState {
    switch (action.name) {
        case 'hydrate': {
            if (state.isDirty) {
                return state
            }
            return { ...state, committed: action.payload }
        }

        case 'dragStart': {
            if (state.isDirty) {
                return state
            }
            return { committed: state.committed, working: { ...state.committed }, isDirty: true }
        }
        case 'dragWithinContainer': {
            const s = ensureWorking(state)
            const { containerId, fromIndex, toIndex } = action
            const arr = s.working![containerId] ?? []
            return {
                ...s,
                working: { ...s.working!, [containerId]: arrayMove(arr, fromIndex, toIndex) },
            }
        }
        case 'dragAcrossContainer': {
            const s = ensureWorking(state)

            const { fromId, fromIndex, toId, toIndex, itemId } = action
            const fromArr = s.working![fromId] ?? []
            const toArr = s.working![toId] ?? []
            const moving = fromArr[fromIndex]

            if (!moving || moving.id !== itemId) return s
            if (fromId === toId && fromIndex === toIndex) return s

            const newFrom = fromArr.slice()
            newFrom.splice(fromIndex, 1)
            const newTo = toArr.slice()
            newTo.splice(toIndex, 0, moving)
            return {
                ...s,
                working: { ...s.working!, [fromId]: newFrom, [toId]: newTo },
            }
        }
        case 'dragDrop': {
            if (!state.working) return { ...state, isDirty: false }
            return { committed: state.working, working: null, isDirty: false }
        }
        case 'dragCancel': {
            return { committed: state.committed, working: null, isDirty: false }
        }

        case 'added':
        case 'renamed':
        case 'deleted': {
            if (state.working) {
                return { ...state, working: applyNormalAction(state.working, action) }
            }
            return { ...state, committed: applyNormalAction(state.committed, action) }
        }

        case 'scriptAdd':
        case 'scriptUpdate':
        case 'scriptDelete': {
            const target = state.working ?? state.committed
            const next = applyScriptAction(target, action)
            return state.working ? { ...state, working: next } : { ...state, committed: next }
        }

        default:
            return state
    }
}
