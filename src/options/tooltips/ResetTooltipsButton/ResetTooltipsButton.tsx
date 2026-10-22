import React from 'react'
import { Button } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { Props } from './ResetTooltipsButton.types'
import { useResetTooltipsButtonBehavior } from './ResetTooltipsButton.behavior'
import { Confirmation, Row } from './ResetTooltipsButton.styles'

const ResetTooltipsButton = ({ children, confirmation }: Props) => {
    const { wasReset, handlers } = useResetTooltipsButtonBehavior()

    return (
        <Row>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handlers.reset}>
                {children}
            </Button>
            {wasReset && <Confirmation role="status">{confirmation}</Confirmation>}
        </Row>
    )
}

export default ResetTooltipsButton
