$.fn.addBigButton = function(msg, id, cls) {
    if (!id) id = "";
    if (!cls) cls = "";
    var btn = '<div  id="' + id + '" class="button btnMain ' + cls + '"><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._(msg) + '</div></div>';
    this.append(btn);
};


(function(o, undefined) {
    var SUBPAGE_SUFFIX = "-subpage-menu";
    var __showAjaxAlert = function(failObj) {
        if (osa && osa.ui && osa.ui.modalBox) {
            osa.ui.modalBox.alert(failObj.title, failObj.message);
        }
        else {
            throw e;
        }
    };

    o.page = {
        pageLoadArea: "#main-area",
        loaderBlock: "#page-loader",
        pageEvents: [],
        unloadCB: null,

                // Forbidden messages for authorization should say something different.
        statusCodeHandlers: {
            403: function() {
                return function(resource) {
                    return {code: 403, title: 'Forbidden', message: 'Unfortunately, the currently logged in user does not have access to the following resource: {0} If you think this is an error, please verify your credentials and try again.'.i18n(resource) };
                };
            },
            404: function() {
                return function(resource) {
                    return {code: 404, title: 'Page Not Found', message: 'The page: {0} was not found. Verify the path and try again.'.i18n(resource) };
                };
            }
        },

        defaultHandlers: {
            fail: function(jqXHR, url) {
                __showAjaxAlert((osa.page.statusCodeHandlers[jqXHR.status] || osa.ajax.statusCodeHandlers[jqXHR.status])()(url));
            }
        },

        getPageURLParameters: function() {
            var p = {};
            if (window.location.hash.split('/').length>1) {
                window.location.hash.split('/')[1].split(',').map(function(el) {
                    p[el.split('=')[0]] = el.split('=')[1];
                });
            }

            return p;
        },

        addPageEvent: function(selector, eventType, cb) {
            $(document).on(eventType, selector, cb);
            this.pageEvents.push({eventType:eventType, selector:selector, callback:cb});
        },

        clearPageEvents: function() {
            for (var i = 0; i < this.pageEvents.length; i++) {
                var e = this.pageEvents[i];
                $(document).off(e.eventType, e.selector, e.callback);
            }

            (this.unloadCB || $.noop)();
        },

        onUnload: function(cb) {
            this.unloadCB = cb;
        },
        
        
        // sometimes the page needs to clear intervals but by the time the 
        // steps of the unload function are called, the container that holds
        // the ids to the intervals is gone and all is lost.  This results
        // in polling forever.
        clearIntervals: function() {
            for (var i = 1; i < 999999; i++) window.clearInterval(i);
        },

        highlightMainNavButton: function(title) {
            $("#menu-nav").find(".selected").removeClass('selected');
            $("#menu-nav").find("#menu-nav-" + title).addClass('selected');
        },

        showPageDiv: function() {
            $(this.pageLoadArea).removeClass('hide');
        },

        hidePageDiv: function() {
            $(this.pageLoadArea).addClass('hide');
        },

        populateHeaderMenu: function(whichRootMenu) {
            var pageRootName = location.hash.substring(1).split('/')[0];
            $('#' + whichRootMenu + SUBPAGE_SUFFIX).clone().appendTo(".header-container")
                .find("#subpage-" + pageRootName)
                .removeClass("hide")
                .addClass("selected");
        },

        // Load a file from the server and (if successful),
        // call @successCallback When it's completed.
        load: function(filename, successCallback) {
            var _this = this;
            if (filename !== '') {
                osa.ajax.showLoadingBar();
                this.hidePageDiv();
                this.clearPageEvents();

                $(this.pageLoadArea).load(osa.ajax.getPageURL(filename), function(resp, status, xhr) {
                    _this.showPageDiv();
                    osa.ajax.hideLoadingBar();
                    if (xhr.status === 200) {
                        _this.highlightMainNavButton(filename.split('-')[0]);
                        _this.populateHeaderMenu(filename.split('-')[0]);
                        (successCallback || $.noop).call(_this, filename);
                    }
                    else {
                        _this.defaultHandlers.fail(xhr, filename);
                    }
                });
            }
            else {
                osa.ajax.hideLoadingBar();
            }
        }
    };

    window.osa = o;
}((window.osa || {}), undefined));
