InjectCode Privacy Policy
=========================

*Last updated: 26 November 2026. Applies to InjectCode 2.0 and later.*

**In short:** InjectCode has no server and no analytics, and nobody but you receives anything from it. Your scripts and
settings stay in your Chrome profile on your computer. The extension makes no network requests of its own. What the
scripts *you* write do on a page is up to you (see [What InjectCode can't protect you from](#what-injectcode-cant-protect-you-from)).

## What InjectCode is for

InjectCode has a single purpose: **to store your own JavaScript and CSS and run it on the web pages that match the URL
patterns you choose**. Scripts run when you click *Run*, or automatically for *Always on* scripts. The permissions and
data described below are used only for that and never for anything else.

## What is stored, and where

Everything is stored in your Chrome profile, on your device only. Nothing is synced between devices through Chrome
Sync, and the extension doesn't send any of it anywhere.

| Data | Where it's kept | Why |
|---|---|---|
| Your scripts: name, code, type (JS/CSS), run mode and the URL pattern they belong to | `chrome.storage.local` | The extension's main feature |
| Settings: Always on timing, injection timeout, editor settings, feedback auto-hide, *Reopen where you left off* | `chrome.storage.local` | To remember your choices |
| Popup preferences: last used URL pattern, run scope, tooltip state, theme | The extension's `localStorage` | To reopen the popup the way you left it |
| Popup view state, depending on the *Reopen where you left off* setting: per **website host name** (default, up to 20 hosts from the current browser session), per browser tab, or not at all | The extension's `localStorage` | To reopen the popup where you left off on that site or tab |
| A random ID for the current browser session | `chrome.storage.session` (cleared when Chrome closes) | To tell apart tab-based view state from earlier sessions |

The host-name entries record which websites you had open when you used the popup, for example `example.com`. The list
starts over after Chrome restarts or the setting changes. The previous list is replaced the next time you use the popup.
Set *Reopen where you left off* to *Same tab* or *Off* in the options page if you'd rather not keep them.

Version 1.x kept your scripts in the extension's `localStorage`. After the update to version 2, InjectCode moves them
into `chrome.storage.local` once, on your device, and deletes the old copy. If that move fails, the old copy stays in
`localStorage` until you delete it, along with a marker that stops InjectCode from trying again. The marker is removed
once the old copy is gone.

## What InjectCode reads from your browser

The only kind of personal data InjectCode handles is **web browsing history**: the tab addresses and host names
described here, and only on your device. It doesn't handle personally identifiable information, health, financial or
payment details, authentication information, personal communications, location, user activity or website content.

- **Tab addresses (URLs).** When the popup is open, InjectCode reads the address of the current tab to show the scripts
  whose URL pattern matches it. When you run scripts on all open tabs, it reads every open tab's address to find the
  matching tabs. The addresses are used for that moment only. They are never collected or sent anywhere. Only the host
  name may be kept, for the popup view state described above.
- **Errors.** If a script fails to run, an error message that includes the tab's address is written to the
  extension's error log in `chrome://extensions`. That log stays in your browser.
- **Page content: not read.** InjectCode itself doesn't read or collect the content of the pages you visit. It only
  adds your scripts to the pages that match their URL patterns.

## What InjectCode never does

- It never sends your scripts, settings, browsing activity or any other data to the developer or to anyone else.
- It doesn't use analytics, tracking, advertising or crash-reporting services.
- It never sells or transfers your data to third parties.
- It never uses or transfers your data for anything unrelated to its single purpose.
- It never uses or transfers your data to determine creditworthiness or for lending.
- It doesn't download code from the internet. All of the extension's own code, including fonts, is inside the
  extension package.

The options page has links to the Chrome documentation, the changelog and GitHub issues. They open only when you click
one, and are covered by Google's and GitHub's own privacy policies.

## Your scripts are the only code that comes from outside the extension

**The only code InjectCode runs that isn't part of the extension package is the code you provide: the scripts you write
or import yourself.** That is the only sense in which InjectCode runs "remote" code. Your scripts aren't bundled with
the extension, because you write them.

InjectCode runs them through Chrome's [User Scripts API](https://developer.chrome.com/docs/extensions/reference/userScripts),
which Chrome provides for running user-provided code. Chrome requires you to turn on **Allow User Scripts** for
InjectCode before any of your scripts can run. InjectCode never downloads code from a server and never loads scripts
from anywhere except your own storage, or a backup file you chose to import.

## Permissions and why they are needed

| Permission | Why InjectCode needs it |
|---|---|
| `userScripts` | Runs your JavaScript. Used both for running scripts on click and for registering *Always on* scripts. Chrome requires you to turn on **Allow User Scripts** for InjectCode before this works. |
| `scripting` | Adds your CSS scripts to a page, through `chrome.scripting.insertCSS`. |
| `storage` | Saves your scripts and settings on your device, in `chrome.storage.local` and `chrome.storage.session`. |
| `tabs` | Reads the address of the current tab to show matching scripts, and of all open tabs when you run scripts on every tab. |
| `activeTab` | If you limit InjectCode's site access to *on click* or to specific sites, opening the popup from the toolbar icon gives InjectCode temporary access to the tab you are on. That lets *Run* on a script, *Run* on a URL pattern and *Run all* on the current tab work there. The access ends when you leave the page or close the tab. |
| Host permission `<all_urls>` | You choose the websites through your own URL patterns, so InjectCode has to be able to run on any site you pick. You can limit its site access in `chrome://extensions` (on all sites, on specific sites or on click). Access to `file://` pages is off unless you turn on *Allow access to file URLs* yourself. |

## Backups

**Export** saves your scripts as a JSON file through Chrome's normal download, only when you click the button. The file
has your scripts and the export time in it, as plain text. You decide where it goes and who you share it with.

**Import** reads a backup file you pick, on your own computer. Nothing is uploaded.

## Your control over your data

- You can edit or delete any script at any time in the popup.
- You can export all your scripts as a backup file at any time.
- **Uninstalling InjectCode deletes all of its stored data**: scripts, settings and popup state. Chrome doesn't
  restore it if you install the extension again, so export a backup first if you want to keep your scripts.
- You can limit which sites InjectCode can access, or turn off **Allow User Scripts**, in `chrome://extensions`.

## What InjectCode can't protect you from

InjectCode is a tool for developers. It runs the code **you** give it, with the same access to a page that the page's
own scripts have, including on sites you are logged in to. That means:

- **Your scripts are not limited by this policy.** A script you write or import can read anything on the page it runs
  on and send it anywhere. InjectCode doesn't review, restrict or watch what your scripts do. Never add code from a
  source you don't trust.
- **Stored data is not encrypted.** Your scripts are kept as plain text in your Chrome profile. Anyone or anything with
  access to your user account on that computer can read them. Don't put passwords, API keys or other secrets in your
  scripts.
- **Backup files are plain text too.** Store and share them as carefully as you would the scripts themselves.

## Changes to this policy

If a future version of InjectCode changes how it handles data, this policy will be updated before that version is
released and the change will be listed in the [changelog](CHANGELOG.md). You can see every earlier version of this file
in the repository's history.

## Contact

Ask questions or report problems in [GitHub issues](https://github.com/jaakkytt/InjectCode/issues), or email
Jaak Kütt at [jaak.kytt@gmail.com](mailto:jaak.kytt@gmail.com).
