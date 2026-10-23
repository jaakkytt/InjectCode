export type Status = 'idle' | 'upToDate' | 'unsaved' | 'saved'

export type ScriptLanguage = 'javascript' | 'css'

export interface Props {
    value: string
    language: ScriptLanguage
    onChange: (newValue: string) => void
    onFocusChange?: (focused: boolean) => void
}
