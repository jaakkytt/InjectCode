// Fetch and eval user defined scripts 
chrome.runtime.sendMessage(null, {text: 'get_stored_code'}, function (msg) {
    if (msg && msg.length) {
        $(function () {
            msg.forEach(function (item) {
                if (item.active && item.code.length) {
                    eval(item.code);
                }
            });
        });
    }
});