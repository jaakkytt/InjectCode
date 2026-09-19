import { useEffect, useRef, useState } from 'react'

const CLOSE_DELAY_MS = 500

export function useExpandingActionButtonBehavior() {
    const [open, setOpen] = useState(false)
    const [isUrlOpen, setUrlOpen] = useState(false)
    const [isJsOpen, setJsOpen] = useState(false)
    const [isCssOpen, setCssOpen] = useState(false)

    const anchorRef = useRef<HTMLDivElement>(null)
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function cancelScheduledClose() {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }
    }

    function scheduleClose() {
        cancelScheduledClose()
        closeTimerRef.current = setTimeout(() => {
            closeTimerRef.current = null
            setOpen(false)
        }, CLOSE_DELAY_MS)
    }

    function closeNow() {
        cancelScheduledClose()
        setOpen(false)
    }

    function toggle() {
        cancelScheduledClose()
        setOpen((prevOpen) => !prevOpen)
    }

    function onClickAway(event: Event) {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return
        }
        closeNow()
    }

    useEffect(() => cancelScheduledClose, [])

    return {
        open,
        isUrlOpen,
        isJsOpen,
        isCssOpen,
        anchorRef,
        handlers: {
            toggle,
            onClickAway,
            onMouseEnter: cancelScheduledClose,
            onMouseLeave: scheduleClose,
            openUrlDialog: () => setUrlOpen(true),
            openJsDialog: () => setJsOpen(true),
            openCssDialog: () => setCssOpen(true),
            closeUrlDialog: () => setUrlOpen(false),
            closeJsDialog: () => setJsOpen(false),
            closeCssDialog: () => setCssOpen(false),
        },
    }
}
