import React from 'react'

export interface Props {
    value: string
    allowEditing: boolean
    onChange: (newValue: string) => void
    inputValidator?: (input: string) => Promise<string | undefined>
    inputTransformer?: (input: string) => string
    children?: React.ReactNode
}

export type AccordionTitleBehaviorProps =
    Pick<Props, 'value' | 'onChange' | 'inputTransformer'>
    & { inputValidator: NonNullable<Props['inputValidator']> }
