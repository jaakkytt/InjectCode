CodeInject
==========

Source for [CodeInject](https://chrome.google.com/webstore/detail/injectcode/flhghpihapijancfhnicbnjifdodohpi) Chrome extension.

### 1.1.0 ###

*   added global InjectCode object which is exported into the content pages (allowing to use attached methods in the Chrome console)

### 1.0.0 ###

*   create, edit, delete, sort, name and enable/disable your scripts
*   syntax highlighter and autosave
*   scripts are stored locally and persist throughout sessions
*   run a specific script or all that are marked as active
*   change scope to run scripts on the current or on all open tabs
*   scripts are injected into the pages after document.ready
*   includes jQuery
*   added global function openTab(url) to open a new tab within your script (avoid recursion)
*   added global XhrMonitor object for working with ajax pages