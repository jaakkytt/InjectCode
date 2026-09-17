import React from 'react'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popper from '@mui/material/Popper'
import { Fab, Fade, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import JavascriptIcon from '@mui/icons-material/Javascript'
import CssIcon from '@mui/icons-material/Css'
import LinkIcon from '@mui/icons-material/Link'
import NewUrlDialog from '../NewUrlDialog'
import NewScriptDialog from '../NewScriptDialog'
import ActionFab from './ActionFab'
import { useExpandingActionButtonBehavior } from './ExpandingActionButton.behavior'
import { popperSx, stackSx } from './ExpandingActionButton.styles'

const ExpandingActionButton = () => {
    const { open, isUrlOpen, isJsOpen, isCssOpen, anchorRef, handlers } = useExpandingActionButtonBehavior()

    return (
        <>
            <div onMouseLeave={handlers.onMouseLeave}>
                <Fab
                    component="div"
                    size="small"
                    color="primary"
                    onClick={handlers.toggle}
                    ref={anchorRef}
                >
                    <AddIcon />
                </Fab>
                <Popper
                    sx={popperSx}
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
                                <ClickAwayListener onClickAway={handlers.onClickAway}>
                                    <Stack spacing={2} direction="row" sx={stackSx}>
                                        <ActionFab label="URL" icon={LinkIcon} onClick={handlers.openUrlDialog} />
                                        <ActionFab label="Style" icon={CssIcon} onClick={handlers.openCssDialog} />
                                        <ActionFab
                                            label="Script"
                                            icon={JavascriptIcon}
                                            onClick={handlers.openJsDialog}
                                        />
                                    </Stack>
                                </ClickAwayListener>
                            </div>
                        </Fade>
                    )}
                </Popper>
            </div>
            <NewUrlDialog isOpen={isUrlOpen} onClose={handlers.closeUrlDialog}/>
            <NewScriptDialog isOpen={isJsOpen} onClose={handlers.closeJsDialog} scriptType="js"/>
            <NewScriptDialog isOpen={isCssOpen} onClose={handlers.closeCssDialog} scriptType="css"/>
        </>
    )
}

export default ExpandingActionButton
