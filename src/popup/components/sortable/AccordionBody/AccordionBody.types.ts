export type Status = 'idle' | 'upToDate' | 'unsaved' | 'saved'

export type ScriptLanguage = 'javascript' | 'css'

export interface Props {
    scriptId: string
    urlBlockId: string
    value: string
    language: ScriptLanguage
    onChange: (newValue: string) => void
    onFocusChange?: (focused: boolean) => void
}
