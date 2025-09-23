import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { AppBar } from '@mui/material'
import JoinLeftIcon from '@mui/icons-material/JoinLeft'
import JoinFullIcon from '@mui/icons-material/JoinFull'
import './UrlTabs.css'
import { useTab } from '../providers/TabProvider'
import { TabIndex } from '../types'

interface TabPanelProps {
    children?: React.ReactNode;
    index: TabIndex;
    value: TabIndex;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tab-panel-${index}`,
    }
}

interface Props {
    curren: React.ReactNode;
    all: React.ReactNode;
    currentFooter: React.ReactNode;
    allFooter: React.ReactNode;
}

const UrlTabs = ({ curren, all, currentFooter, allFooter } : Props) => {

    const { tabIndex, setTabIndex } = useTab()

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue)
    }

    return (
        <>
            <AppBar className="urlTabsButtons" position="static">
                <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    aria-label="URL tabs"
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                >
                    <Tab label="Currently Matching" icon={<JoinLeftIcon />} iconPosition="start" {...a11yProps(TabIndex.Current)} />
                    <Tab label="All Scripts" icon={<JoinFullIcon />} iconPosition="start" {...a11yProps(TabIndex.All)} />
                </Tabs>
            </AppBar>
            <TabPanel value={tabIndex} index={TabIndex.Current}>
                {curren}
            </TabPanel>
            <TabPanel value={tabIndex} index={TabIndex.All}>
                {all}
            </TabPanel>
            {tabIndex === TabIndex.All ? allFooter : currentFooter}
        </>
    )
}

export default UrlTabs
