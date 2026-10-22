import React, { ReactNode } from 'react'
import { AlwaysOnTiming } from '../../service/alwaysOnTiming'
import { useAlwaysOnTiming } from './AlwaysOnTimingProvider'

export interface Props {
    start: ReactNode
    end: ReactNode
    idle: ReactNode
}

const AlwaysOnTimingText = ({ start, end, idle }: Props) => {
    const { timing } = useAlwaysOnTiming()

    const textByTiming: Record<AlwaysOnTiming, ReactNode> = {
        document_start: start,
        document_end: end,
        document_idle: idle,
    }

    return <>{timing ? textByTiming[timing] : null}</>
}

export default AlwaysOnTimingText
