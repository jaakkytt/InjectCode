import React, {useEffect, useRef, useState} from 'react'
import EditIcon from '@mui/icons-material/Edit';
import {IconButton, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";

interface Props {
    value: string
    allowEditing: boolean
    onChange: (newValue: string) => void
}

export default function AccordionTitle({ value, allowEditing, onChange }: Props) {

    const [isEditing, setEditing] = useState(false)
    const textFieldRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && textFieldRef.current) {
            textFieldRef.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (textFieldRef.current) {
                textFieldRef.current.blur();
                setEditing(false);
            }
        }
    };

    return (
        allowEditing ? (
            isEditing ? (
                <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                    <TextField
                        fullWidth
                        required
                        variant="standard"
                        size="small"
                        value={value}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onChange(e.target.value)}
                        onBlur={() => setEditing(false)}
                        inputRef={textFieldRef}
                        onKeyDown={handleKeyDown}
                    />
                </Typography>
            ) : (
                <>
                    <Typography component="span" sx={{ flexGrow: 0, textWrap: 'auto' }}>
                        {value}
                    </Typography>
                    <Typography component="span" sx={{ flexGrow: 1, textAlign: 'left'}} style={{marginLeft: 4}}>
                        <IconButton
                            color="primary"
                            component="span"
                            aria-label="Edit"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                setEditing(true)
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Typography>
                </>
            )
        ) : (
            <Typography component="span" sx={{ flexGrow: 1, textWrap: 'auto' }}>
                {value}
            </Typography>
        )
    )
}
