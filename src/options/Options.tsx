import React from 'react'
import Box from '@mui/material/Box'
import { Alert, AppBar, Toolbar } from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import BackupIcon from '@mui/icons-material/Backup'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BuildIcon from '@mui/icons-material/Build'
import HistoryIcon from '@mui/icons-material/History'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CodeIcon from '@mui/icons-material/Code'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { CHANGELOG_URL, ISSUES_URL, MATCH_PATTERN_DOCS, RUN_AT_DOCS } from '../shared/constants'
import BuildInfo from './BuildInfo'
import SetupToggle from './inputs/SetupToggle'
import ExtensionSettingsLink from './links/ExtensionSettingsLink'
import { AlwaysOnTimingProvider } from './providers/AlwaysOnTimingProvider'
import AlwaysOnTimingSelect from './inputs/AlwaysOnTimingSelect'
import TooltipsToggle from './inputs/TooltipsToggle'
import ResetTooltipsLink from './links/ResetTooltipsLink'
import { BackupProvider } from './providers/BackupProvider'
import ExportButton from './backup/ExportButton'
import ImportButton from './backup/ImportButton'
import BackupNotice from './backup/BackupNotice'
import { FeedbackAutoHideProvider } from './providers/FeedbackAutoHideProvider'
import AutoHideSelect from './inputs/AutoHideSelect'
import InjectionTimeoutInput from './inputs/InjectionTimeoutInput'
import { ViewRestoreModeProvider } from './providers/ViewRestoreModeProvider'
import ViewRestoreModeSelect from './inputs/ViewRestoreModeSelect'
import { EditorSettingsProvider } from './providers/EditorSettingsProvider'
import TabSizeSelect from './inputs/TabSizeSelect'
import InsertSpacesToggle from './inputs/InsertSpacesToggle'
import HotkeyInput from './inputs/HotkeyInput'
import SiteAccessSelect from './inputs/SiteAccessSelect'
import ExternalLink from './links/ExternalLink'
import ExtensionErrorLink from './links/ExtensionErrorLink'
import ReregisterAlwaysOnLink from './links/ReregisterAlwaysOnLink'
import {
    ActiveModeIcon,
    AllTabsScopeIcon,
    AlwaysOnModeIcon,
    ButtonRow,
    Collapsible,
    CollapsibleSummary,
    CurrentTabScopeIcon,
    Disabled,
    DisabledModeIcon,
    Page,
    PageTitle,
    Primary,
    RunIcon,
    Section,
    SectionHeading,
    SectionIcon,
    Sections,
    SectionText,
    Setting,
    Settings,
    SettingText,
    SettingTitle,
    Success,
    TopBarLogo,
    Topic,
    TopicHeading,
    TopicList,
    Topics,
    TopicText,
    TroubleshootingHeading,
    TroubleshootingTopic,
    TroubleshootingTopics,
    Warning,
} from './Options.styles'

const Options = () => (
    <>
        <AppBar position="static">
            <Toolbar>
                <TopBarLogo src="icons/inject48.png" alt="Syringe with x in curly brackets" />
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
                                    <SettingTitle>User scripts</SettingTitle>
                                    <SettingText>
                                        In order to run the scripts you define, this extension <b>requires</b> "Allow
                                        User Scripts" to be turned on in the <ExtensionSettingsLink />.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <SetupToggle check="fileAccess" />
                                <div>
                                    <SettingTitle>File URLs</SettingTitle>
                                    <SettingText>
                                        Only if you wish to run your scripts on local files (<code>file:///</code>{' '}
                                        patterns), enable "Allow access to file URLs" in the <ExtensionSettingsLink />.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <TooltipsToggle />
                                <div>
                                    <SettingTitle>Tutorial tooltips</SettingTitle>
                                    <SettingText>
                                        Show tooltip hints on buttons such as Run and Delete. Each hint stops appearing
                                        after it has been shown a number of times. <ResetTooltipsLink />
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <SiteAccessSelect
                                    allSites="On all sites"
                                    specificSites="On specific sites"
                                    onClick="On click"
                                />
                                <div>
                                    <SettingTitle>Site access</SettingTitle>
                                    <SettingText>
                                        For <RunIcon /> <Primary>Run all</Primary> on <AllTabsScopeIcon />{' '}
                                        <Warning>All tabs</Warning> and <AlwaysOnModeIcon />{' '}
                                        <Warning>Always on</Warning> scripts to work seamlessly, it is recommended to
                                        set "Site access" in the <ExtensionSettingsLink /> to "On all sites" for broader
                                        usage, or to "On specific sites" and add the sites you plan to use InjectCode
                                        on. See <em>On click caveats</em> under <em>Site access</em> below for why "On
                                        click" may introduce unintuitive behavior and extra clicks.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <AlwaysOnTimingSelect start="Document start" end="Document end" idle="Document idle"/>
                                <div>
                                    <SettingTitle>Always on timing</SettingTitle>
                                    <SettingText>
                                        Choose when all <AlwaysOnModeIcon /> <Warning>Always on</Warning> scripts run
                                        during page load. The preferred and default value is "Document idle". See{' '}
                                        <ExternalLink href={RUN_AT_DOCS}>how the options differ</ExternalLink>.
                                    </SettingText>
                                </div>
                            </Setting>

                            <Setting>
                                <ViewRestoreModeProvider>
                                    <ViewRestoreModeSelect sameHost="Same host" sameTab="Same tab" off="Off" />
                                </ViewRestoreModeProvider>
                                <div>
                                    <SettingTitle>Reopen where you left off</SettingTitle>
                                    <SettingText>
                                        Choose whether the popup reopens where you left it. "Same host" remembers
                                        your place per site, shared by all its tabs. "Same tab" remembers it per
                                        browser tab. "Off" always opens at the top. Restarting the browser or
                                        changing this setting starts fresh.
                                    </SettingText>
                                </div>
                            </Setting>

                        </Settings>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><CodeIcon /></SectionIcon>
                            Editor
                        </SectionHeading>
                        <SectionText>
                            To change keybindings, click the field and press the new key combination, or press{' '}
                            <kbd>Escape</kbd> to keep the current one.<br/>
                            <kbd>Shift</kbd> <b>is not</b> saved with punctuation keys.
                        </SectionText>
                        <EditorSettingsProvider>
                            <Settings>
                                <Setting>
                                    <HotkeyInput command="toggleComment" />
                                    <div>
                                        <SettingTitle>Toggle comments keybinding</SettingTitle>
                                        <SettingText>
                                            Comments out the selected lines, or removes their comments.
                                        </SettingText>
                                    </div>
                                </Setting>

                                <Setting>
                                    <TabSizeSelect />
                                    <div>
                                        <SettingTitle>Tab size</SettingTitle>
                                        <SettingText>
                                            How many spaces one indentation level takes in the code editors.
                                        </SettingText>
                                    </div>
                                </Setting>

                                <Setting>
                                    <InsertSpacesToggle />
                                    <div>
                                        <SettingTitle>Indent with spaces</SettingTitle>
                                        <SettingText>
                                            Pressing Tab inserts spaces. Turn this off to insert tab characters
                                            instead, shown as wide as the tab size.
                                        </SettingText>
                                    </div>
                                </Setting>
                            </Settings>
                        </EditorSettingsProvider>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><NotificationsIcon /></SectionIcon>
                            Run feedback
                        </SectionHeading>
                        <SectionText>
                            After each run, the popup shows a message at the top saying how many tabs the scripts ran
                            on. Its color shows how the run went, and you can choose how long each kind of message
                            stays visible.
                        </SectionText>
                        <FeedbackAutoHideProvider>
                            <Settings>
                                <Setting>
                                    <InjectionTimeoutInput unit="seconds" invalid="Enter 0 or a number above 0" />
                                    <div>
                                        <SettingTitle>Script timeout</SettingTitle>
                                        <SettingText>
                                            How long to wait for each tab before reporting that it did not respond.
                                            A tab showing a dialog, such as an alert, doesn't respond until you close
                                            the dialog, and its scripts run then, even after the timeout.
                                            Set it to 0 to wait without a time limit. The <RunIcon />{' '}
                                            <Primary>Run</Primary> button then stays busy for as long as the popup is
                                            open. Closing the popup only stops the waiting: held scripts still run once
                                            the tab responds.
                                        </SettingText>
                                    </div>
                                </Setting>

                                <Setting>
                                    <AutoHideSelect severity="success" />
                                    <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
                                        <SettingTitle>
                                            Success - shown when the scripts ran on every matching tab.
                                        </SettingTitle>
                                    </Alert>
                                </Setting>

                                <Setting>
                                    <AutoHideSelect severity="info" />
                                    <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
                                        <SettingTitle>Info - shown when no open tab matched your scripts.</SettingTitle>
                                    </Alert>
                                </Setting>

                                <Setting>
                                    <AutoHideSelect severity="warning" />
                                    <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
                                        <SettingTitle>
                                            Warning - shown when some tabs did not respond within the script timeout.
                                        </SettingTitle>
                                    </Alert>
                                </Setting>

                                <Setting>
                                    <AutoHideSelect severity="error" />
                                    <Box sx={{ width: '100%' }}>
                                        <Alert severity="error" variant="filled">
                                            <SettingTitle>Error - shown when running failed on some tabs.</SettingTitle>
                                        </Alert>
                                        <SettingText>
                                            See <em>Finding errors</em> below.
                                        </SettingText>
                                    </Box>
                                </Setting>
                            </Settings>
                        </FeedbackAutoHideProvider>
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
                                    <ExternalLink href={MATCH_PATTERN_DOCS}>Chrome Extensions docs</ExternalLink>.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Shared scripts</TopicHeading>
                                <TopicText>
                                    Shared scripts are added to the beginning of every URL's scripts each time you run
                                    them. They cannot be run independently. A Shared script set to{' '}
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> only runs automatically on URLs
                                    that have an <AlwaysOnModeIcon /> <Warning>Always on</Warning> script of their own.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>Run modes</TopicHeading>
                                <TopicList>
                                    <li>
                                        <DisabledModeIcon /> <Disabled>Disabled</Disabled><em>:</em> never runs.
                                    </li>
                                    <li>
                                        <ActiveModeIcon /> <Primary>Active</Primary><em>:</em> runs when you
                                        press <RunIcon /> <Primary>Run</Primary> on the script or its URL, or{' '}
                                        <RunIcon /> <Primary>Run all</Primary>.
                                    </li>
                                    <li>
                                        <AlwaysOnModeIcon /> <Warning>Always on</Warning><em>:</em> runs
                                        automatically on every matching page, at the chosen <em>Always on timing</em>:
                                        <ul>
                                            <li>
                                                <em>Document start:</em> before the page is built and before any of
                                                the page's own scripts run.
                                            </li>
                                            <li>
                                                <em>Document end:</em> as soon as the page's content is ready, before
                                                images and other resources have finished loading.
                                            </li>
                                            <li>
                                                <em>Document idle:</em> once the page's content is ready, at a moment
                                                chosen by the browser, no later than when the page has fully loaded.
                                            </li>
                                        </ul>
                                        <TopicText>
                                            Editing the code of an <AlwaysOnModeIcon />{' '}
                                            <Warning>Always on</Warning> script switches it back to{' '}
                                            <ActiveModeIcon /> <Primary>Active</Primary>, to prevent unfinished code
                                            from running.
                                        </TopicText>
                                    </li>
                                </TopicList>
                            </Topic>

                            <Topic>
                                <TopicHeading>Run all scopes</TopicHeading>
                                <TopicList>
                                    <li>
                                        <CurrentTabScopeIcon /> <Success>Current tab</Success><em>:</em> scripts whose
                                        URL pattern matches are run only in the current tab.
                                    </li>
                                    <li>
                                        <AllTabsScopeIcon /> <Warning>All tabs</Warning><em>:</em> scripts whose URL
                                        pattern matches are run in every open tab. Tabs that Memory Saver has put to
                                        sleep, tabs Chrome has frozen in the background, and tabs you haven't opened
                                        since Chrome restarted are skipped. Opening such a tab later doesn't run the
                                        scripts either.
                                    </li>
                                </TopicList>
                            </Topic>

                            <Topic>
                                <TopicHeading>Site access</TopicHeading>
                                <TopicText>
                                    Chrome lets you limit which sites InjectCode can access, under "Site access" in
                                    the <ExtensionSettingsLink />:
                                </TopicText>
                                <TopicList>
                                    <li>
                                        <em>On all sites:</em> scripts run on every matching page.
                                    </li>
                                    <li>
                                        <em>On specific sites:</em> scripts run on matching pages of the sites you
                                        list. Every other site behaves as <em>On click</em>.
                                    </li>
                                    <li>
                                        <em>On click:</em> InjectCode can only access a tab after you click its icon on
                                        that tab. The access lasts until the tab navigates to a different site.
                                        This is mainly useful when you want to run scripts on a single tab; for broader
                                        use it's restrictive.
                                        <Collapsible slots={{ heading: 'div' }}>
                                            <CollapsibleSummary expandIcon={<ChevronRightIcon />}>
                                                On click caveats
                                            </CollapsibleSummary>
                                            <ul>
                                                <li>
                                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> scripts don't run
                                                    in new tabs, and Chrome gives no sign that they were skipped. To run
                                                    them on a tab, click the InjectCode icon on that tab first, then
                                                    reload the page. Reloading without clicking the icon first doesn't
                                                    help.
                                                </li>
                                                <li>
                                                    Scripts run using <RunIcon /> <Primary>Run all</Primary> with{' '}
                                                    <AllTabsScopeIcon /> <Warning>All tabs</Warning> are held back by
                                                    Chrome on tabs without access, and the InjectCode icon shows "wants
                                                    to access this page" on hover. They run when you click that icon on
                                                    a given tab, which may be long after you pressed <RunIcon />{' '}
                                                    <Primary>Run</Primary>. Every press adds another held run, so a
                                                    single InjectCode icon click can release and run several of your
                                                    waiting scripts.
                                                </li>
                                                <li>
                                                    The <em>Script timeout</em> only stops the popup from waiting; it
                                                    doesn't cancel held runs. Set it to 0 to keep waiting until you've
                                                    clicked every held tab.
                                                </li>
                                            </ul>
                                        </Collapsible>
                                    </li>
                                </TopicList>
                            </Topic>

                            <Topic>
                                <TopicHeading>Execution order</TopicHeading>
                                <TopicText>
                                    Shared scripts run first, followed by the URL's own scripts, top to bottom in the
                                    order you see them. JavaScript and CSS follow that same order, whether you press
                                    {' '}<RunIcon /> <Primary>Run</Primary>, use <RunIcon /> <Primary>Run all</Primary>
                                    {' '}or the script is <AlwaysOnModeIcon /> <Warning>Always on</Warning>, so drag a
                                    script to change when it runs. If a page matches more than one URL pattern, the
                                    scripts of every matching pattern run.
                                </TopicText>
                                <TopicText>
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> CSS works with every timing.
                                    At <em>Document start</em> it's added before the page is first shown, so placing
                                    CSS above your JavaScript styles the page from the start.
                                </TopicText>
                            </Topic>

                            <Topic>
                                <TopicHeading>What your JavaScript can see</TopicHeading>
                                <TopicText>
                                    JavaScript runs in an isolated user script world. It can read and change the page,
                                    including its <code>localStorage</code>, but it cannot see the page's own
                                    JavaScript variables and functions.
                                </TopicText>
                                <TopicText>
                                    Each tab gets its own world, which lasts until the tab reloads or loads a new
                                    page. All your scripts that run in that tab share it, but scripts in different
                                    tabs can't see each other's variables, even on the same site. To keep data across
                                    tabs or reloads, store it in <code>localStorage</code>, which every tab with the
                                    same origin shares. The page's own scripts and other extensions can read and change
                                    it too, so don't store anything sensitive there.
                                </TopicText>
                            </Topic>
                        </Topics>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><BuildIcon /></SectionIcon>
                            Troubleshooting
                        </SectionHeading>
                        <TroubleshootingTopics>
                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    Finding errors
                                </TroubleshootingHeading>
                                <TopicText>
                                    InjectCode doesn't show errors itself. Errors thrown by your scripts appear in the
                                    page's DevTools console (F12). If a script didn't run at all, for example because
                                    the page is blocked or a permission is missing, the reason is logged either on{' '}
                                    the <ExtensionErrorLink /> page or in the extension's own console: open the{' '}
                                    <ExtensionSettingsLink /> and click "service worker".
                                </TopicText>
                                <TopicText>
                                    Chrome only lists errors on the <ExtensionErrorLink /> page if "Collect errors" is
                                    turned on in the <ExtensionSettingsLink />.
                                </TopicText>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    Script runs more than once on a page
                                </TroubleshootingHeading>
                                <TopicText>
                                    Nothing a script does is undone until you reload the page. Its changes to the page,
                                    including added styles and event listeners, stay, and so do its top-level
                                    declarations in the shared world. Running it again on the same page applies its
                                    changes again on top, and fails with "Identifier has already been declared" if it
                                    declares <code>const</code>, <code>let</code> or <code>class</code> at the top
                                    level. A script runs again when:
                                </TopicText>
                                <TopicList>
                                    <li>
                                        you press <RunIcon /> <Primary>Run</Primary> or <RunIcon />{' '}
                                        <Primary>Run all</Primary> again.
                                    </li>
                                    <li>
                                        you run an <AlwaysOnModeIcon /> <Warning>Always on</Warning> script manually
                                        after it already ran on page load.
                                    </li>
                                    <li>
                                        a page matches more than one URL pattern with <AlwaysOnModeIcon />{' '}
                                        <Warning>Always on</Warning> scripts. Shared <AlwaysOnModeIcon />{' '}
                                        <Warning>Always on</Warning> scripts then run once for each of those
                                        patterns.
                                    </li>
                                </TopicList>
                                <TopicText>
                                    Wrap your code in a block <code>{'{ … }'}</code> or a function, and use{' '}
                                    <code>var</code> for anything later scripts should be able to call. To get rid of
                                    a script's effects, set it to <DisabledModeIcon /> <Disabled>Disabled</Disabled> and
                                    reload the page.
                                </TopicText>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    Script ran late or not at all
                                </TroubleshootingHeading>
                                <TopicText>
                                    A tab that doesn't respond to <RunIcon /> <Primary>Run</Primary> or <RunIcon />{' '}
                                    <Primary>Run all</Primary> keeps the script waiting inside Chrome, even after the
                                    popup reports a timeout or is closed. This happens while the tab shows a dialog,
                                    such as an alert, or with <em>On click</em> site access until you click the
                                    InjectCode icon on that tab.
                                </TopicText>
                                <TopicList>
                                    <li>
                                        The script runs once the tab responds, which may be long after you pressed{' '}
                                        <RunIcon /> <Primary>Run</Primary>.
                                    </li>
                                    <li>
                                        If you close the tab or Chrome before then, the waiting script never runs.
                                    </li>
                                </TopicList>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> script finds nothing at
                                    Document start
                                </TroubleshootingHeading>
                                <TopicText>
                                    With <AlwaysOnModeIcon /> <Warning>Always on</Warning> <em>timing</em> set to{' '}
                                    <em>Document start</em>, your script runs before the browser has read the page's
                                    HTML, so <code>document.body</code> is <code>null</code> and elements such as
                                    buttons don't exist yet. This timing suits things like redirects. To change the
                                    page's content, wait for it with{' '}
                                    <code>document.addEventListener('DOMContentLoaded', …)</code> or pick a later
                                    timing.
                                </TopicText>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> script didn't run on an open tab
                                </TroubleshootingHeading>
                                <TopicText>
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> scripts run when a page loads,
                                    never into a page that's already open.
                                </TopicText>
                                <TopicList>
                                    <li>
                                        Switching a script to <AlwaysOnModeIcon /> <Warning>Always on</Warning> only
                                        affects pages that load from then on. Reload the pages you want it on, or
                                        press <RunIcon /> <Primary>Run</Primary> or <RunIcon />{' '}
                                        <Primary>Run all</Primary>.
                                    </li>
                                    <li>
                                        Tabs that Memory Saver has put to sleep reload when you open them, so they get
                                        the current script. Tabs that Chrome has frozen in the background resume as
                                        they were, without it.
                                    </li>
                                    <li>
                                        Right after InjectCode is updated or reloaded, pages that load at that moment
                                        may miss their script. Check that what you expected actually ran.
                                    </li>
                                </TopicList>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    <AlwaysOnModeIcon /> <Warning>Always on</Warning> scripts don't run after allowing
                                    user scripts
                                </TroubleshootingHeading>
                                <TopicText>
                                    If you added, imported or changed <AlwaysOnModeIcon /> <Warning>Always on</Warning>
                                    {' '}scripts while "Allow User Scripts" was off, Chrome doesn't know about them
                                    yet, so they won't run automatically after you turn it on. Click{' '}
                                    <ReregisterAlwaysOnLink>Re-register Always on scripts</ReregisterAlwaysOnLink>,
                                    then reload the pages you want them on.
                                </TopicText>
                            </TroubleshootingTopic>

                            <TroubleshootingTopic>
                                <TroubleshootingHeading expandIcon={<ExpandMoreIcon />}>
                                    Where scripts don't run
                                </TroubleshootingHeading>
                                <TopicText>
                                    Scripts only run in the top-level page, never inside iframes. Chrome also doesn't
                                    let extensions run on its own pages (<code>chrome://…</code>), the Chrome Web
                                    Store, other extensions' pages or the built-in PDF viewer. Local files{' '}
                                    (<code>file:///…</code>) only work with the File URLs setting enabled.
                                </TopicText>
                            </TroubleshootingTopic>
                        </TroubleshootingTopics>
                    </Section>

                    <Section>
                        <SectionHeading>
                            <SectionIcon><HistoryIcon /></SectionIcon>
                            Changelog & issues
                        </SectionHeading>
                        <SectionText>
                            See the <ExternalLink href={CHANGELOG_URL}>changelog</ExternalLink> to read about features
                            removed since version 1.
                        </SectionText>
                        <SectionText>
                            Please report bugs in <ExternalLink href={ISSUES_URL}>GitHub issues</ExternalLink>.
                        </SectionText>
                    </Section>
                </Sections>
            </AlwaysOnTimingProvider>
            <BuildInfo />
        </Page>
    </>
)

export default Options
