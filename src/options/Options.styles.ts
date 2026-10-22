import { Alert, Container } from '@mui/material'
import { styled } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'

export const TopBarIcon = styled(SettingsIcon)(({ theme }) => ({
    marginRight: theme.spacing(1.5),
}))

export const PageTitle = styled('h1')(({ theme }) => ({
    ...theme.typography.h6,
    margin: 0,
    color: 'inherit',
}))

export const Page = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
}))

export const Sections = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}))

export const Section = styled('section')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
}))

export const SectionHeading = styled('h2')(({ theme }) => ({
    ...theme.typography.h6,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    margin: 0,
    marginBottom: theme.spacing(2),
}))

export const SectionIcon = styled('span')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.primary.main,
}))

export const SectionText = styled('p')(({ theme }) => ({
    ...theme.typography.body2,
    margin: 0,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    '&:last-child': {
        marginBottom: 0,
    },
}))

export const Settings = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}))

export const Setting = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
}))

export const SettingTitle = styled('h3')(({ theme }) => ({
    ...theme.typography.subtitle2,
    margin: 0,
}))

export const SettingText = styled('p')(({ theme }) => ({
    ...theme.typography.body2,
    margin: 0,
    color: theme.palette.text.secondary,
}))

export const SettingWarning = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
}))

export const ButtonRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}))

export const Topics = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}))

export const Topic = styled('div')({})

export const TopicHeading = styled('h3')(({ theme }) => ({
    ...theme.typography.subtitle2,
    margin: 0,
    marginBottom: theme.spacing(0.5),
}))

export const TopicText = styled('p')(({ theme }) => ({
    ...theme.typography.body2,
    margin: 0,
    '& + &, ul + &, li > &': {
        marginTop: theme.spacing(1),
    },
}))

export const TopicList = styled('ul')(({ theme }) => ({
    ...theme.typography.body2,
    margin: 0,
    paddingLeft: theme.spacing(2.5),
    'p + &': {
        marginTop: theme.spacing(1),
    },
    '& li + li': {
        marginTop: theme.spacing(0.5),
    },
}))
