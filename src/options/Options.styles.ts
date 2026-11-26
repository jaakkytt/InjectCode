import AdsClickIcon from '@mui/icons-material/AdsClick'
import BoltIcon from '@mui/icons-material/Bolt'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import PublicIcon from '@mui/icons-material/Public'
import { CSSObject, styled } from '@mui/material/styles'
import { Accordion, accordionClasses, AccordionSummary, accordionSummaryClasses, Container } from '@mui/material'

export const Warning = styled('b')(({ theme }) => ({
    color: theme.palette.warning.main,
    fontStyle: 'italic',
}))

export const Primary = styled('b')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontStyle: 'italic',
}))

export const Disabled = styled('b')(({ theme }) => ({
    color: theme.palette.action.active,
    fontStyle: 'italic',
}))

export const Success = styled('b')(({ theme }) => ({
    color: theme.palette.success.main,
    fontStyle: 'italic',
}))

export const TopBarLogo = styled('img')(({ theme }) => ({
    width: 24,
    height: 24,
    marginRight: theme.spacing(1.5),
}))

export const RunIcon = styled(PlayCircleOutlineIcon)(({ theme }) => ({
    verticalAlign: 'middle',
    color: theme.palette.primary.main,
}))

export const DisabledModeIcon = styled(PowerSettingsNewIcon)(({ theme }) => ({
    ...thumbIcon(theme.palette.grey[50], theme.palette.action.active),
    boxShadow: theme.shadows[1],
}))

export const ActiveModeIcon = styled(AdsClickIcon)(({ theme }) => ({
    ...thumbIcon(theme.palette.primary.main, theme.palette.primary.contrastText),
    boxShadow: theme.shadows[1],
}))

export const AlwaysOnModeIcon = styled(BoltIcon)(({ theme }) => ({
    ...thumbIcon(theme.palette.warning.main, theme.palette.warning.contrastText),
    boxShadow: theme.shadows[1],
}))

export const CurrentTabScopeIcon = styled(LocationOnIcon)(({ theme }) => ({
    ...thumbIcon(theme.palette.success.main, theme.palette.common.white),
    boxShadow: theme.shadows[1],
}))

export const AllTabsScopeIcon = styled(PublicIcon)(({ theme }) => ({
    ...thumbIcon(theme.palette.warning.main, theme.palette.common.white),
    boxShadow: theme.shadows[1],
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
    '& > .MuiInputBase-root, & > .MuiFormControl-root': {
        width: 180,
        flexShrink: 0,
    },
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

export const TroubleshootingTopics = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
}))

export const TroubleshootingTopic = styled(Accordion)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: 'inherit',
    boxShadow: 'none',
    borderRadius: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&::before': {
        display: 'none',
    },
    [`&.${accordionClasses.expanded}`]: {
        margin: 0,
    },
    [`& .${accordionClasses.region}`]: {
        paddingBottom: theme.spacing(2),
    },
}))

export const TroubleshootingHeading = styled(AccordionSummary)(({ theme }) => ({
    ...theme.typography.subtitle2,
    minHeight: 0,
    padding: 0,
    [`&.${accordionSummaryClasses.expanded}`]: {
        minHeight: 0,
    },
    [`& .${accordionSummaryClasses.content}`]: {
        display: 'block',
        margin: theme.spacing(1.5, 0),
    },
    [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
        margin: theme.spacing(1.5, 0),
    },
}))

export const Collapsible = styled(Accordion)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: 'inherit',
    boxShadow: 'none',
    '&::before': {
        display: 'none',
    },
    paddingTop: theme.spacing(0.5),
    [`&.${accordionClasses.expanded}`]: {
        margin: 0,
    },
    [`& .${accordionClasses.region}`]: {
        marginTop: theme.spacing(0.5),
        marginLeft: theme.spacing(1.25),
        paddingLeft: theme.spacing(1.5),
        borderLeft: `1px solid ${theme.palette.divider}`,
    },
    [`& .${accordionClasses.region} > ul`]: {
        margin: 0,
        paddingLeft: theme.spacing(2.5),
    },
}))

export const CollapsibleSummary = styled(AccordionSummary)(({ theme }) => ({
    ...theme.typography.body2,
    minHeight: 0,
    padding: 0,
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    [`&.${accordionSummaryClasses.expanded}`]: {
        minHeight: 0,
    },
    [`& .${accordionSummaryClasses.content}`]: {
        margin: 0,
        flexGrow: 0,
    },
    [`& .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]: {
        margin: 0,
    },
    [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
        fontSize: 20,
        color: theme.palette.action.active,
    },
    [`& .${accordionSummaryClasses.expandIconWrapper} svg`]: {
        fontSize: 'inherit',
    },
    [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
        transform: 'rotate(90deg)',
    },
}))

function thumbIcon(backgroundColor: string, color: string): CSSObject {
    return {
        fontSize: 22,
        padding: 3,
        boxSizing: 'border-box',
        borderRadius: '50%',
        backgroundColor,
        color,
        verticalAlign: 'middle',
    }
}
