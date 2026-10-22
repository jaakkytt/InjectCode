import React from 'react'
import { Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useBackup } from './BackupProvider'

const NoticeAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(2),
}))

const Details = styled('ul')(({ theme }) => ({
    margin: 0,
    paddingLeft: theme.spacing(2.5),
}))

const BackupNotice = () => {
    const { notice, actions } = useBackup()

    return notice ? (
        <NoticeAlert severity={notice.severity} onClose={() => actions.dismissNotice()}>
            {notice.text}
            {notice.details.length > 0 && (
                <Details>
                    {notice.details.map(detail => <li key={detail}>{detail}</li>)}
                </Details>
            )}
        </NoticeAlert>
    ) : null
}

export default BackupNotice
