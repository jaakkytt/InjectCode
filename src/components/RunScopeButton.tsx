import * as React from 'react'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { Fade, ListItemIcon, ListItemText } from '@mui/material'
import { ReactNode } from 'react'

interface Props {
    options: string[]
    icons: ReactNode[]
    onClick: (index: number) => void
    onChange: (index: number) => void
}

const RunScopeButton = ({ options, icons, onClick, onChange } : Props) => {

    const [open, setOpen] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const anchorRef = React.useRef<HTMLDivElement>(null)

    const handleClick = () => {
        onClick(selectedIndex)
    }

    const handleMenuItemClick = (
        _event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index)
        setOpen(false)
        onChange(index)
    }

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
        <div onMouseLeave={() => setOpen(false)}>
            <ButtonGroup
                variant="contained"
                ref={anchorRef}
            >
                <Button startIcon={<PlayCircleOutlineIcon />} onClick={handleClick}>{options[selectedIndex]}</Button>
                <Button
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{ zIndex: 1 }}
                open={open}
                placement={'bottom-end'}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            <ListItemIcon>{icons[index]}</ListItemIcon>
                                            <ListItemText>{option}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </div>
    )
}

export default RunScopeButton
