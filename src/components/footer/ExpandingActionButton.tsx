import * as React from 'react'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popper from '@mui/material/Popper'
import { Fab, Fade, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import JavascriptIcon from '@mui/icons-material/Javascript'
import CssIcon from '@mui/icons-material/Css'
import LinkIcon from '@mui/icons-material/Link'
import NewUrlDialog from './NewUrlDialog'
import NewScriptDialog from './NewScriptDialog'

const ExpandingActionButton = () => {

    const [open, setOpen] = React.useState(false)
    const [isUrlOpen, setUrlOpen] = useState(false)
    const [isJsOpen, setJsOpen] = useState(false)
    const [isCssOpen, setCssOpen] = useState(false)

    const anchorRef = React.useRef<HTMLDivElement>(null)

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return
        }
        setOpen(false)
    }

    return (
        <>
            <div onMouseLeave={() => setOpen(false)}>
                <Fab
                    component="div"
                    size="small"
                    color="primary"
                    onClick={handleToggle}
                    ref={anchorRef}
                >
                    <AddIcon />
                </Fab>
                <Popper
                    sx={{ zIndex: 1 }}
                    open={open}
                    placement={'left'}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} >
                            <div>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <Stack spacing={2} direction="row" sx={{ mr: 2, alignItems: 'flex-end' }}>
                                        <Fab variant="circular" size="small" color="primary" onClick={() => { setUrlOpen(true) }}>
                                            <span style={{ display: 'none' }}>URL</span>
                                            <LinkIcon sx={{ ml: 0 }} />
                                        </Fab>

                                        <Fab variant="circular" size="small" color="primary" onClick={() => { setCssOpen(true) }}>
                                            <span style={{ display: 'none' }}>Style</span>
                                            <CssIcon sx={{ ml: 0 }} />
                                        </Fab>

                                        <Fab variant="circular" size="small" color="primary" onClick={() => { setJsOpen(true) }}>
                                            <span style={{ display: 'none' }}>Script</span>
                                            <JavascriptIcon sx={{ ml: 0 }} />
                                        </Fab>
                                    </Stack>
                                </ClickAwayListener>
                            </div>
                        </Fade>
                    )}
                </Popper>
            </div>
            <NewUrlDialog isOpen={isUrlOpen} onClose={() => setUrlOpen(false)}/>
            <NewScriptDialog isOpen={isJsOpen} onClose={() => setJsOpen(false)} scriptTye="js"/>
            <NewScriptDialog isOpen={isCssOpen} onClose={() => setCssOpen(false)} scriptTye="css"/>
        </>
    )
}

export default ExpandingActionButton
