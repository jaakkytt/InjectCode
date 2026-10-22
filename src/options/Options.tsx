import React from 'react'
import { Alert, AppBar, Link, Toolbar } from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import BackupIcon from '@mui/icons-material/Backup'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BuildIcon from '@mui/icons-material/Build'
import HistoryIcon from '@mui/icons-material/History'
import { CHANGELOG_URL, ISSUES_URL, MATCH_PATTERN_DOCS, RUN_AT_DOCS } from '../constants'
import BuildInfo from '../components/BuildInfo'
import SetupToggle from './setup/SetupToggle'
import ExtensionSettingsLink from './setup/ExtensionSettingsLink'
import { AlwaysOnTimingProvider } from './timing/AlwaysOnTimingProvider'
import AlwaysOnTimingSelect from './timing/AlwaysOnTimingSelect'
import AlwaysOnTimingText from './timing/AlwaysOnTimingText'
import TooltipsToggle from './tooltips/TooltipsToggle'
import ResetTooltipsButton from './tooltips/ResetTooltipsButton'
import BackupProvider from './backup/BackupProvider'
import ExportButton from './backup/ExportButton'
import ImportButton from './backup/ImportButton'
import BackupNotice from './backup/BackupNotice'
import {
    ButtonRow,
    Page,
    PageTitle,
    Section,
    SectionHeading,
    SectionIcon,
    Sections,
    SectionText,
    Setting,
    Settings,
    SettingText,
    SettingTitle,
    Topic,
    TopicHeading,
    TopicList,
    Topics,
    TopicText,
    TopBarIcon,
} from './Options.styles'

const Options = () => (
    <>
        <AppBar position="static">
            <Toolbar>
                <TopBarIcon />
                <PageTitle>InjectCode</PageTitle>
            </Toolbar>
        </AppBar>

        <Page maxWidth="md">
            <AlwaysOnTimingProvider>
                <Sections>
                    <Alert severity="warning">
                        InjectCode is a tool for developers. It runs JavaScript and CSS that you write on the websites
                        you choose, with full access to those pages, including any site you are logged in to. Don't
                        use it unless you understand what your scripts do, and never add code from a source you don't
                        trust.
                    </Alert>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><TuneIcon /></SectionIcon>
                            Settings
                        </SectionHeading>
                        <Settings>
                            <Setting>
                                <SetupToggle check="userScripts" />
                                <div>
                                    <SettingTitle>User Scripts</SettingTitle>
                                    <SettingText>
                                        In order to run the scripts you define, this extension requires "Allow User
                                        Scripts" to be turned on in the{' '}
                                        <ExtensionSettingsLink>extension settings</ExtensionSettingsLink>.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <SetupToggle check="fileAccess" />
                                <div>
                                    <SettingTitle>File URLs</SettingTitle>
                                    <SettingText>
                                        Only if you wish to run your scripts on local files (<code>file:///</code>{' '}
                                        patterns), enable "Allow access to file URLs" in the{' '}
                                        <ExtensionSettingsLink>extension settings</ExtensionSettingsLink>.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <AlwaysOnTimingSelect
                                    start="Document start"
                                    end="Document end"
                                    idle="Document idle (default)"
                                />
                                <div>
                                    <SettingTitle>Always on timing</SettingTitle>
                                    <SettingText>
                                        Choose when <em>Always on</em> scripts run during page load. Applies to
                                        all <em>Always on</em> scripts.{' '}
                                        <Link
                                            href={RUN_AT_DOCS}
                                            target="_blank"
                                            rel="noreferrer"
                                            underline="hover"
                                            title="opens in new tab"
                                        >
                                            How the options differ
                                        </Link>
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <TooltipsToggle />
                                <div>
                                    <SettingTitle>Tutorial Tooltips</SettingTitle>
                                    <SettingText>
                                        Show tooltip hints on buttons such as Run and Delete. Each hint stops appearing
                                        after it has been shown a number of times.
                                    </SettingText>
                                    <ResetTooltipsButton
                                        confirmation={
                                            <>Done. Hints will show again the next time you open the popup.</>
                                        }
                                    >
                                        Reset tooltip counters
                                    </ResetTooltipsButton>
                                </div>
                            </Setting>
                        </Settings>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><BackupIcon /></SectionIcon>
                            Backup
                        </SectionHeading>
                        <SectionText>
                            Your scripts are stored only in this browser profile. They are not synced between devices,
                            nothing is sent anywhere, and they are deleted if you uninstall the extension. Export them
                            to a file to keep a copy, and import that file to bring them back. Importing never deletes
                            a script, but it does replace the ones with the same ID. Only import scripts you trust.
                        </SectionText>
                        <BackupProvider>
                            <ButtonRow>
                                <ExportButton>Export</ExportButton>
                                <ImportButton>Import</ImportButton>
                            </ButtonRow>
                            <BackupNotice />
                        </BackupProvider>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><MenuBookIcon /></SectionIcon>
                            How it works
                        </SectionHeading>
                        <Topics>
                            <Topic>
                                <TopicHeading>URL patterns</TopicHeading>
                                <TopicText>
                                    Scripts are grouped by a URL match pattern such as{' '}
                                    <code>https://example.com/*</code>. The format is defined in the{' '}
                                    <Link href={MATCH_PATTERN_DOCS} target="_blank" rel="noreferrer" underline="hover">
                                        Chrome Extensions docs
                                    </Link>.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Shared scripts</TopicHeading>
                                <TopicText>
                                    Shared scripts are added to the beginning of every URL's scripts each time you run
                                    them. They cannot be run independently. A Shared script set to <em>Always on</em>
                                    {' '}only runs automatically on URLs that have an <em>Always on</em> script of
                                    their own.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Run modes</TopicHeading>
                                <TopicList>
                                    <li><em>Disabled</em>: never runs.</li>
                                    <li>
                                        <em>Active</em>: runs when you press Play on the script or its URL, or Run all.
                                    </li>
                                    <li>
                                        <em>Always on</em>: runs automatically on every matching page,{' '}
                                        {/*
                                          TODO: Always on CSS is wrapped as JS that calls document.head.appendChild,
                                          but document.head is still null at Document start, so Always on CSS throws
                                          with that timing. Also, "All JavaScript runs before any CSS" under Execution
                                          order only holds for manual runs, Always on keeps CSS in list order.
                                        */}
                                        <AlwaysOnTimingText
                                            start={
                                                <>before the page is built and before any of the page's own scripts
                                                    run.</>
                                            }
                                            end={
                                                <>as soon as the page's content is ready, before images and other
                                                    resources have finished loading.</>
                                            }
                                            idle={
                                                <>once the page's content is ready, at a moment chosen by the browser,
                                                    no later than when the page has fully loaded.</>
                                            }
                                        />
                                        <TopicText>
                                            Editing the code of an <em>Always on</em> script switches it back to{' '}
                                            <em>Active</em>, to prevent unfinished code from running.
                                        </TopicText>
                                    </li>
                                </TopicList>
                            </Topic>

                            <Topic>
                                <TopicHeading>Run all scopes</TopicHeading>
                                <TopicList>
                                    <li>
                                        <em>Current tab</em>: scripts whose URL pattern matches are run only in the
                                        current tab.
                                    </li>
                                    <li>
                                        <em>All tabs</em>: scripts whose URL pattern matches are run in every open tab.
                                        Tabs that Memory Saver has put to sleep are skipped, as the extension can't
                                        reach them.
                                    </li>
                                </TopicList>
                            </Topic>

                            <Topic>
                                <TopicHeading>Execution order</TopicHeading>
                                <TopicText>
                                    Shared scripts run first, followed by the URL's own scripts, top to bottom in the
                                    order you see them. Drag a script to change when it runs. All JavaScript runs
                                    before any CSS. If a page matches more than one URL pattern, the scripts of every
                                    matching pattern run.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>What your JavaScript can see</TopicHeading>
                                <TopicText>
                                    JavaScript runs in an isolated user script world. It can read and change the page,
                                    but it cannot see the page's own JavaScript variables and functions.
                                </TopicText>
                                <TopicText>
                                    All your scripts share that one world for as long as the page is open. This is
                                    what lets a Shared script define functions that later scripts can call. It also
                                    means that running a script a second time on the same page fails if it declares{' '}
                                    <code>const</code>, <code>let</code> or <code>class</code> at the top level
                                    ("Identifier has already been declared"). This includes running an{' '}
                                    <em>Always on</em> script manually after it already ran on page load. Wrap your
                                    code in a block <code>{'{ … }'}</code> or a function, or use <code>var</code>,
                                    unless you intend to share it.
                                </TopicText>
                            </Topic>
                        </Topics>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><BuildIcon /></SectionIcon>
                            Troubleshooting
                        </SectionHeading>
                        <Topics>
                            <Topic>
                                <TopicHeading>Running a script again</TopicHeading>
                                <TopicText>
                                    There is no undo. Whatever a script changes on the page, including added styles
                                    and event listeners, stays until you reload the page, and running it again applies
                                    it again on top. To get rid of a script's effects, set it to <em>Disabled</em> and
                                    reload the page.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Always on script finds nothing at Document start</TopicHeading>
                                <TopicText>
                                    With <em>Always on timing</em> set to <em>Document start</em>, your script runs
                                    before the browser has read the page's HTML, so <code>document.body</code> is{' '}
                                    <code>null</code> and elements such as buttons don't exist yet. This timing suits
                                    things like redirects. To change the page's content, wait for it with{' '}
                                    <code>document.addEventListener('DOMContentLoaded', …)</code> or pick a later
                                    timing.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Shared scripts run more than once</TopicHeading>
                                <TopicText>
                                    If a page matches more than one URL pattern with <em>Always on</em> scripts, the
                                    Shared <em>Always on</em> scripts run once for each of those patterns. Write Shared
                                    scripts so that running twice is harmless, for example with <code>var</code>{' '}
                                    instead of <code>const</code>/<code>let</code>.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Where scripts don't run</TopicHeading>
                                <TopicText>
                                    Scripts only run in the top-level page, never inside iframes. Chrome also doesn't
                                    let extensions run on its own pages (<code>chrome://…</code>), the Chrome Web
                                    Store, other extensions' pages or the built-in PDF viewer. Local files{' '}
                                    (<code>file:///…</code>) only work with the File URLs setting enabled.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Finding errors</TopicHeading>
                                <TopicText>
                                    InjectCode doesn't show errors itself. Errors thrown by your scripts appear in the
                                    page's DevTools console (F12). If a script didn't run at all, for example because
                                    the page is blocked or a permission is missing, the reason is logged in the
                                    extension's own console: open the{' '}
                                    <ExtensionSettingsLink>extension settings</ExtensionSettingsLink> and click
                                    "service worker".
                                </TopicText>
                            </Topic>
                        </Topics>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><HistoryIcon /></SectionIcon>
                            Changelog & issues
                        </SectionHeading>
                        <SectionText>
                            See the{' '}
                            <Link href={CHANGELOG_URL} target="_blank" rel="noreferrer" underline="hover">
                                changelog
                            </Link>{' '}
                            to read about features removed since version 1.
                        </SectionText>
                        <SectionText>
                            Please report bugs in{' '}
                            <Link href={ISSUES_URL} target="_blank" rel="noreferrer" underline="hover">
                                GitHub issues
                            </Link>.
                        </SectionText>
                    </Section>
                </Sections>
            </AlwaysOnTimingProvider>
            <BuildInfo />
        </Page>
    </>
)

export default Options
