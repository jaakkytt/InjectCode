export type Status = 'idle' | 'upToDate' | 'unsaved' | 'saved'

export interface Props {
    value: string
    onChange: (newValue: string) => void
    onFocusChange?: (focused: boolean) => void
}
