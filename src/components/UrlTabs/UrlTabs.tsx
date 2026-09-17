import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { AppBar, IconButton, Link } from '@mui/material'
import JoinLeftIcon from '@mui/icons-material/JoinLeft'
import JoinFullIcon from '@mui/icons-material/JoinFull'
import SettingsIcon from '@mui/icons-material/Settings'
import './UrlTabs.css'
import { TabIndex } from '../../types'
import TabPanel from './TabPanel'
import { Props } from './UrlTabs.types'
import { a11yProps, useUrlTabsBehavior } from './UrlTabs.behavior'

const UrlTabs = ({ curren, all, currentFooter, allFooter }: Props) => {
    const { tabIndex, handlers } = useUrlTabsBehavior()

    return (
        <>
            <AppBar className="urlTabsButtons" position="static">
                <Tabs
                    value={tabIndex}
                    onChange={handlers.handleChange}
                    aria-label="URL tabs"
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                >
                    <Tab
                        label="Currently Matching"
                        icon={<JoinLeftIcon />}
                        iconPosition="start"
                        {...a11yProps(TabIndex.Current)}
                    />
                    <Tab
                        label="All Scripts"
                        icon={<JoinFullIcon />}
                        iconPosition="start"
                        {...a11yProps(TabIndex.All)}
                    />
                    <Link
                        href="#"
                        onClick={handlers.handleSettingsClick}
                        target="_blank"
                        rel="noreferrer"
                        color="inherit"
                        underline="none"
                    >
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="settings"
                            sx={{ mr: 0 }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Link>
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
