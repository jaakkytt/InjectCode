// Store code and settings
settings = {
    get stored_code() {
        return JSON.parse(localStorage.getItem('stored_code')) || [];
    },
    set stored_code(val) {
        localStorage['stored_code'] = JSON.stringify(val);
    },
    get exec_scope() {
        return localStorage.getItem('exec_scope') || 'global';
    },
    set exec_scope(val) {
        localStorage['exec_scope'] = val;
    }
};

// Communication between popup and content pages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text && (msg.text == 'get_stored_code')) {
        sendResponse(settings.stored_code);
    } else if (msg.text && (msg.text == 'crate_tab')) {
        if (msg.url.substring(0, 7) != 'http://' && msg.url.substring(0, 8) != 'https://') {
            msg.url = 'http://' + msg.url;
        }
		chrome.tabs.create({url : msg.url}, function (tab) {
            // TODO: optional callback to the new tab?
		});
		sendResponse('true');
    }
});