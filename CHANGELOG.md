# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **[#4]** **Breaking:** Rebuilt for Chrome Manifest V3
- **[#4]** **Breaking:** Scrips are now stored in chrome.storage.local, user preferences in localStorage
- **[#4]** Reworked the whole UI

### Added

- **[#4]** Scripts are organized by the URL patterns they match
- **[#4]** Separate views for the scripts matching the current tab and for all scripts
- **[#4]** Options page with settings, usage docs and troubleshooting
- **[#4]** Always on mode to run scripts automatically on matching pages
- **[#4]** CSS scripts alongside JavaScript
- **[#4]** Shared scripts that run before every URL's own scripts
- **[#4]** Export and import of scripts as a backup file

### Removed

- **[#4]** **Breaking:** jQuery is no longer included
- **[#4]** **Breaking:** The global `InjectCode` object, `openTab(url)` and `XhrMonitor` are no longer available to scripts

## [1.1.0] - 2015-04-01

### Added

- Global InjectCode object which is exported into the content pages (allowing to use attached methods in the Chrome console)

## [1.0.0] - 2015-01-01

### Added

- create, edit, delete, sort, name and enable/disable your scripts
- syntax highlighter and autosave
- scripts are stored locally and persist throughout sessions
- run a specific script or all that are marked as active
- change scope to run scripts on the current or on all open tabs
- scripts are injected into the pages after document.ready
- includes jQuery
- added global function openTab(url) to open a new tab within your script (avoid recursion)
- added global XhrMonitor object for working with ajax pages

[#4]: https://github.com/jaakkytt/InjectCode/issues/4
