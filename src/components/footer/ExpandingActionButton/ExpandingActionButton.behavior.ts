import { useRef, useState } from 'react'

export function useExpandingActionButtonBehavior() {
    const [open, setOpen] = useState(false)
    const [isUrlOpen, setUrlOpen] = useState(false)
    const [isJsOpen, setJsOpen] = useState(false)
    const [isCssOpen, setCssOpen] = useState(false)

    const anchorRef = useRef<HTMLDivElement>(null)

    function onClickAway(event: Event) {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return
        }
        setOpen(false)
    }

    return {
        open,
        isUrlOpen,
        isJsOpen,
        isCssOpen,
        anchorRef,
        handlers: {
            toggle: () => setOpen((prevOpen) => !prevOpen),
            onMouseLeave: () => setOpen(false),
            onClickAway,
            openUrlDialog: () => setUrlOpen(true),
            openJsDialog: () => setJsOpen(true),
            openCssDialog: () => setCssOpen(true),
            closeUrlDialog: () => setUrlOpen(false),
            closeJsDialog: () => setJsOpen(false),
            closeCssDialog: () => setCssOpen(false),
        },
    }
}
