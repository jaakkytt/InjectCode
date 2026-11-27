export type ScriptType = 'js' | 'css'

export type ScriptRunMode = 'disabled' | 'active' | 'always'

export type FeedbackSeverity = 'success' | 'info' | 'warning' | 'error'

export interface Script {
    id: string;
    title: string;
    secondaryText: string;
    content: string;
    runMode: ScriptRunMode;
    type: ScriptType;
}

export type ScriptsByPattern = Record<string, Script[]>;
