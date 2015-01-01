// Helper to open tabs from within user defined scripts
function openTab(tab_url) {
	chrome.runtime.sendMessage(null, {text: 'crate_tab', url: tab_url}, function (msg) {

	});
}

// Xhr event listener object for use in user defined scripts
(function (window, undefined) {

    'use strict';
    
    var monitor = {},
        request_callbacks = {},
        active = false,
        script_id = 'XhrMonitor',
        message_class = 'xhr_message';
    
    function deleteNode(node) {
        node.parentNode.removeChild(node);
    }

    // Callback for DOMSubtreeModified event to bridge the blood–brain barrier
    // due to access limitations to the document object of the content page
    function domListener(event) {
        if (!active) {
            return;
        }
        if (event.target.nodeName == 'HEAD') {
            var nodes = event.target.querySelectorAll('script.' + message_class),
                i,
                message;
            for (i = 0; i < nodes.length; i++) {
                // Extract the request and remove the messenger
                message = JSON.parse(nodes[i].innerText);
                monitor.notifyListeners(message[1]);
                deleteNode(nodes[i]);
            }
        }
    };

    // Start up the monitor by giving it the ability to listen ajax requests.
    monitor.start = function () {
        if (active) {
            return true;
        }
        // Work around app access limitations and modify the XMLHttpRequest prototype on the
        // content page side to create new html pieces holding the request URI
        var zxc = document.createElement('script');
        zxc.innerHTML = '(function () {'
            + 'var proxied = window.XMLHttpRequest.prototype.open;'
            + 'window.XMLHttpRequest.prototype.open = function () {'
                + 'var request = JSON.stringify(arguments);'
                + 'this.addEventListener("readystatechange", function () {'
                    + 'if (this.readyState === 4) {'
                        + 'var zxc = document.createElement("script");'
                        + 'zxc.type = "text/json";'
                        + 'zxc.setAttribute("class", "' + message_class + '");'
                        + 'zxc.innerText = request;'
                        + 'document.head.appendChild(zxc);'
                    + '}'
                + '});'
                + 'return proxied.apply(this, [].slice.call(arguments));'
            + '};'
        +'}());';
        zxc.id = script_id;
        document.head.appendChild(zxc);
        // Since the app is notified about the DOM changes a listener can be used
        // to pick up when those changes were made by the monkey-patched XMLHttpRequest
        document.addEventListener('DOMSubtreeModified', domListener);
        active = true;
    }

    // Stop the monitoring, remove the initial script and listener
    monitor.stop = function () {
        if (!active) {
            return true;
        }
        deleteNode(document.head.querySelectorAll('#' + script_id)[0]);
        document.removeEventListener('DOMSubtreeModified', domListener);
        active = false;
    }

    // Check and notify any callbacks which were registered to match the given uri
    monitor.notifyListeners = function (uri) {
        // Don't block
        setTimeout(function () {
            var c,
                f,
                m,
                uri_pattern;
            for (m in request_callbacks) {
                if (!request_callbacks.hasOwnProperty(m)) {
                    continue;
                }
                uri_pattern = new RegExp(m);
                if (!uri_pattern.test(uri)) {
                    continue;
                }
                f = request_callbacks[m];
                for (c = 0; c < f.length; c++) {
                    f[c].call(null, this, uri);
                    // Decrement callbacks with a limit counter and remove
                    // them if the limit is reached
                    if (f[c].hasOwnProperty('limit_monitor_times')) {
                        f[c].limit_monitor_times--;
                        if (f[c].limit_monitor_times < 1) {
                            f.splice(c, 1);
                        }
                    }
                }
                // If all the callbacks for the given pattern were removed
                // get rid of the pattern as well
                if (!f.length) {
                    delete request_callbacks[m];
                }
            }
        }, 1);
    }

    // Register a callback to a given uri with an optional limit counter
    monitor.add = function (uri_pattern, callback, limit_monitor_times) {
        if (!request_callbacks.hasOwnProperty(uri_pattern)) {
            request_callbacks[uri_pattern] = [];
        }
        if (callback && limit_monitor_times) {
            callback.limit_monitor_times = parseInt(limit_monitor_times) || 1;
        }
        request_callbacks[uri_pattern].push(callback);    
    }

    // First make sure the monitor is active and then register a callback
    monitor.listen = function (uri_pattern, callback, limit_monitor_times) {
        if (!active) {
            this.start();
        }
        this.add(uri_pattern, callback, limit_monitor_times);
    };

    monitor.isRunning = function () {
        return active;
    }
    
    monitor.getListeners = function () {
        return request_callbacks;
    }

    monitor.clear = function () {
        request_callbacks = {};
    }

    window.XhrMonitor = monitor;

}(window));