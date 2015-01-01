// Fetch the background page object to store settings and scripts
var bkg = chrome.extension.getBackgroundPage();

// Setup for the CodeMirror editor with callbacks to
// autosave the changes on keyup and drop events
var codemirror_options = {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    indentUnit: 4,
    lineWrapping: 80,
    theme: 'pastel-on-dark',
    mode: 'javascript',
    onKeyEvent: function (i, e) {
        if (e.type == 'keyup') {
            i.currentitem.code(i.getValue());
            saveChanges();
        }
    },
    onDragEvent: function (i, e) {
        if (e.type == 'drop') {
            i.currentitem.code(i.getValue());
            saveChanges();
        }
    }
};

// Setup for jQuery UI Accordion with beforeActivate callback to mitigate issues with
// dynamically adding and sorting accordion elements - rebuilding the accordion would
// close upon these actions all open element
var accordion_options = {
    collapsible: true,
    active: false,
    animate: 0,
    heightStyle: 'content',
    header: '> div > h3',
    beforeActivate: function (event, ui) {
        if (ui.newHeader[0]) {
            var current_header  = ui.newHeader;
            var current_content = current_header.next('.ui-accordion-content');
        } else {
            var current_header  = ui.oldHeader;
            var current_content = current_header.next('.ui-accordion-content');
        }
        var is_panel_selected = current_header.attr('aria-selected') == 'true';
        current_header.toggleClass('ui-corner-all', is_panel_selected)
            .toggleClass('accordion-header-active ui-state-active ui-corner-top', !is_panel_selected)
            .attr('aria-selected', ((!is_panel_selected).toString()));
        current_header.children('.ui-icon').toggleClass('ui-icon-triangle-1-e', is_panel_selected)
            .toggleClass('ui-icon-triangle-1-s', !is_panel_selected);
        current_content.toggleClass('accordion-content-active', !is_panel_selected)    
        if (is_panel_selected) {
            current_content.slideUp(accordion_options.animate);
            current_header.removeClass('ui-state-focus');
        }  else { 
            current_content.slideDown(accordion_options.animate); 
        }
        return false;
    }
}

// Setup for jQuery UI Sortable with an update handler to modify
// the underlying Knockout view model items
var sortable_options = {
    axis: 'y', 
    handle: 'h3',
    update: function (a, b, c) {
        viewModel.items.sort(function (left, right) { 
            return $('#' + left.id()).closest('.group').index() - $('#' + right.id()).closest('.group').index();
        });
        saveChanges();
    }
}

var timeout = 500,
    last_saved = 0,
    pending_update;

// Saves code in editor to background page storage
function saveChanges() {
    if (!window.viewModel) {
        return false;
    }
    // The actual saving part
    function commitUpdate() {
        var items = viewModel.items();
        var storage = [];
        items.forEach(function (item) {
            storage.push({
                name: item.name(),
                code: item.code(),
                active: item.active(),
                hidden: item.hidden()
            });
        });
        bkg.settings.stored_code = storage;
    }
    // Clear any pending updates if a new change was made
    var current_time = new Date().valueOf();
    clearTimeout(pending_update);
    // If more then timeout has passed since the last update
    // commit the changes immediately
    if (current_time > (last_saved + timeout)) {
        commitUpdate();
    } else {
        // Set a delay for the commit to avoid abusing resources
        pending_update = setTimeout(function () {
            commitUpdate();
        }, timeout);
    }
    last_saved = current_time;
    return true;
}

$(document).ready(function () {

    // Define general ui buttons
    $('#add_script').button({icons: {primary: 'ui-icon-plusthick'}});
    $('#run_scripts').button({icons: {primary: 'ui-icon-play'}}).click(updateContentScript);
    $('#local_scope').button({icons: {primary: 'ui-icon-arrowstop-1-s'}}).click(function () {
        viewModel.scope('global');
    });
    $('#global_scope').button({icons: {primary: 'ui-icon-arrow-4-diag'}}).click(function () {
        viewModel.scope('local');
    });

    // Override jQuery UI Accordion key events to avoid events
    // while using those keys in code editor
    $.ui.accordion.prototype._keydown = function (event) {
        // Shoot blanks
    };

    // Knockout handler for editing the code block title
    ko.bindingHandlers.inline = {
        init: function (element, valueAccessor) {
            // Create a hidden input after the title span
            var span = $(element);
            var input = $('<input />', {'type': 'text', 'style': 'display:none', 'class': 'editable ui-corner-all'});
            span.after(input);

            ko.applyBindingsToNode(input.get(0), {value: valueAccessor()});
            ko.applyBindingsToNode(span.get(0), {text: valueAccessor()});

            // Switch to show input upon clicking the title
            span.click(function (event) {
                span.hide();
                input.show();
                input.focus();
                event.stopPropagation();
            });

            // Switch back to show the new title upon losing focus on the input
            input.blur(function (event) { 
                span.show();
                input.hide();
                saveChanges();
                event.stopPropagation();
            });

            // ... or when pressing enter key
            input.keypress(function (e) {
                if(e.keyCode == 13) {
                   span.show();
                   input.hide();
                   saveChanges();
                }
            });
        }
    };

    // Knockout handler to bind and unbind the jQuery UI and CodeMirror bits to the
    // elements on init and update
    ko.bindingHandlers.accordionite = {
        init: function (element, valueAccessor) {
            $(element).accordion(accordion_options);
            $(element).sortable(sortable_options);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).accordion('destroy');
                $(element).sortable('destroy');
                $('.CodeMirror').remove();
            });
        },
        update: function (element, valueAccessor, allBindings) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value);
            var opened = $(element).find('.accordion-header-active');
            var items = viewModel.items();
            $('.CodeMirror').remove();
            $(element).accordion('destroy').accordion(accordion_options);
            $(element).sortable('destroy').sortable(sortable_options);
            if (opened.length) {
                opened.each(function () {
                    $(this).trigger('click');
                });
            }
            items.forEach(function (item) {
                var cmi = CodeMirror.fromTextArea($('#' + item.id())[0], codemirror_options);
                cmi.currentitem = item;
            });
        }
    };

    // Define code item model
    function Item(params) {
        this.id = ko.observable(params.id);
        this.name = ko.observable(params.name);
        this.code = ko.observable(params.code);
        this.active = ko.observable(params.active);
        this.hidden = ko.observable(params.hidden);
        this.deleteme = function (item, event) {
            viewModel.removeItem(this);
            event.stopPropagation();
        };
        this.toggleActive = function (item, event) {
            if (this.active() == 1) {
                this.active(0);
            } else {
                this.active(1);
            }
            saveChanges();
            event.stopPropagation();
        };
        this.run = function (item, event) {
            updateContentScript(this.code());
            event.stopPropagation();
        }
    }

    // Define view model with defaults
    window.viewModel = {
        counter: 0,
        items: ko.observableArray(),
        scope: ko.observable(bkg.settings.exec_scope),
        add: function (params, event) {
            this.counter++;
            if (typeof params != 'object' || !params.hasOwnProperty('code') || event) {
                params = {code: ''};
            }
            if (!params.hasOwnProperty('id')) {
                params.id = 'c' + this.counter;
            }
            if (!params.hasOwnProperty('name')) {
                params.name = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
            }
            if (!params.hasOwnProperty('active')) {
                params.active = 1;
            }
            if (!params.hasOwnProperty('hidden')) {
                params.hidden = 0;
            }
            this.items.push(new Item(params));
            if (event) {
                saveChanges();
            }
        },
        removeItem: function (item) {
            this.items.remove(item);
            saveChanges();
        }
    };

    // Restore items stored from previous session
    bkg.settings.stored_code.forEach(function (item) {
        viewModel.add(item);
    });

    // Set an observer to save the scope change on the background
    viewModel.scope.subscribe(function (newValue) {
        bkg.settings.exec_scope = newValue;
    });

    ko.applyBindings(viewModel);
});

// Send scripts to the content page
function updateContentScript(script) {
    if (typeof script != 'string') {
        saveChanges();
    }

    // Execute a single script or all that are active
	var injectIntoTab = function (tab) {
        if (typeof script == 'string') {
            chrome.tabs.executeScript(tab.id, {
                code: script
            });
        } else {
            chrome.tabs.executeScript(tab.id, {file: "js/run_content_script.js"});
        }
	}

    // Fire on the current tab or iterate through everything
    if (viewModel.scope() == 'local') {
        injectIntoTab({});
    } else {
        chrome.windows.getAll({
            populate: true
        }, function (windows) {
            var i = 0, w = windows.length, currentWindow;
            for ( ; i < w; i++ ) {
                currentWindow = windows[i];
                var j = 0, t = currentWindow.tabs.length, currentTab;
                for ( ; j < t; j++ ) {
                    currentTab = currentWindow.tabs[j];
                    if (!currentTab.url.match(/(chrome):\/\//gi)) {
                        injectIntoTab(currentTab);
                    }
                }
            }
        });
    }
}