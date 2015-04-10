
(function(o, undefined) {
    // The __ means that this method is private and shouldn't be
    // called from the outside :P
    var __makeAjaxCall = function(ajaxOptions, successCallback, failCallback) {
        if (!osa && !osa.ajax) {
            return;
        }
        $.ajax(ajaxOptions)
            .done(successCallback   || osa.ajax.defaultHandlers.success)
            .fail(failCallback      || osa.ajax.defaultHandlers.fail)
            .always(osa.ajax.defaultHandlers.always);
    };

    var __showAjaxAlert = function(failObj) {
        if (osa && osa.ui && osa.ui.modalBox) {
            osa.ui.modalBox.alert(failObj.title, failObj.message);
        }
        else {
            throw e;
        }
    };

    o.ajax = {
        // TODO: Make this retrieved from tomcat conf
        BASEURL: __BASEAJAXURL,
        API_VERSION: null,
        API_PREFIX: 'api',
        AUTH_PREFIX: 'auth',
        PAGE_PREFIX: 'pages',
        loaderDiv: '#ajax-loader-container',

        showLoadingBar: function() {
            $(this.loaderDiv).parent().removeClass('hide');
            $(this.loaderDiv).removeClass('hide');
            // We don't want to start the spinning animation until the div has shown up
            // So, add the li when we show.
            $("#ajax-loader-spinner").empty().append($("<li/>"));
        },

        hideLoadingBar: function() {
            var $d = $(this.loaderDiv);
            $d.addClass('hide');
            setTimeout(function() { $d.parent().addClass('hide');}, ANIMATE_SPEED);
        },

        // Default status code handlers.  Other functions that use AJAX can use
        // these by referencing: osa.ajax.statusCodeHandlers[code]
        statusCodeHandlers: {
            200: function() {
                return function(resource) { DEBUG("Status: OK", resource);};
            },
            400: function() {
                return function(resource) {
                    return {code: 400, title: 'Malformed Syntax', message: 'The resource: {0} was not understood by the server due to malformed syntax.'.i18n(resource) };
                };
            },
            403: function() {
                return function(resource) {
                    return {code: 403, title: 'Forbidden', message: 'The resource: {0} is not accessible based on your authorization level.'.i18n(resource) };
                };
            },
            404: function() {
                return function(resource) {
                    return { code: 404, title: 'Resource Not Found', message: 'Not Found. The resource: {0} was not found'.i18n(resource) };
                };
            },
            405: function() {
                return function(resource) {
                    return { code: 405, title: 'Method Not Allowed', message: 'Method Not Allowed. The resource: {0} was not allowed.'.i18n(resource) };
                };
            },
            415: function() {
                return function(resource) {
                    return { code: 415, title: 'Data Format Incorrect', message: 'The data passed to: {0} was not in the right format.'.i18n(resource) };
                };
            },
            500: function(tt) {
                return function(resource) {
                   // return { code: 500, title: 'Internal Server Error', message: ('The url: {0} encountered an internal server error').i18n(resource) }
                    return { code: 500, title: 'Internal Server Error', message: tt };
                };
            },
            503: function() {
                return function(resource) {
                    return { code: 503, title: 'Core Communication Error', message: "Unable to communicate with core system."};
                };
            }
        },

        // Default Options for all AJAX Calls
        options: {
            contentType: 'application/json',
            type: 'post',
            processData: false,
            beforeSend: function(x, s) {
                //osa.ajax.showLoadingBar();
                s.data = (s.data) ? JSON.stringify(s.data) : null;
            }
        },


        // These are separate from the $.ajax options and need to be chained (i think);
        defaultHandlers: {
            success:    function() {},
            always:     function() { osa.ajax.hideLoadingBar(); },
            fail:       function(jqXHR, ts, err, data) {
                // TODO: Include the response message found in the respnose JSON on error.
                var responset = jqXHR.responseText;
                var json, stat;
                try
                {
                    json = $.parseJSON(responset);
                    stat = "The URL " + json.url + " encountered an error: " + json.status;
                    __showAjaxAlert(osa.ajax.statusCodeHandlers[jqXHR.status](stat)(this.url));
                }
                catch(err)
                {
                    __showAjaxAlert(osa.ajax.statusCodeHandlers[jqXHR.status]()(this.url));
                }
            }
        },

        // Send an object to the API
        add: function(type, data, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'add');
            o.data = data;
            __makeAjaxCall(o, successCallback, failCallback);
        },

        update: function(type, newValue, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'update');
            o.data = newValue;
            __makeAjaxCall(o, successCallback, failCallback);
        },

        list: function(type, successCallback, failCallback) {
            var o = clone(this.options);
            var data;
            o.url = this.getAPIURL(type, 'list');
            o.type = 'get';

            // Instead of redoing all of the calls that don't contain @data,
            // Data will be an optional argument. We'll detect this based on the
            // typeof the 2nd argument (@arguments[1])
            if (typeof arguments[1] === 'function') {
                successCallback = arguments[1];
                failCallback = arguments[2];
            }
            else if (typeof arguments[1] === 'object') {
                data = arguments[1].filter(function(n) { return n;}).join('/');
                successCallback = arguments[2];
                failCallback = arguments[3];
                o.url = this.getAPIURL(type, 'list', data);
            }
            __makeAjaxCall(o, successCallback, failCallback);
        },

        remove: function(type, id, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'remove');
            o.type = 'post';
            o.data =  {'key': id};
            __makeAjaxCall(o, successCallback, failCallback);
        },
        
        
        removeMetric: function(type, obj, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'remove');
            o.type = 'post';
            o.data =  obj;
            __makeAjaxCall(o, successCallback, failCallback);
        },

        removeByObj: function(type, obj, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'remove');
            o.type = 'post';
            o.data =  obj;
            __makeAjaxCall(o, successCallback, failCallback);
        },

        // Get a list of objects from the API
        get: function(type, id, successCallback, failCallback) {
            var o = clone(this.options);
            o.url = this.getAPIURL(type, 'get', id);
            o.type = 'get';
            __makeAjaxCall(o, successCallback, failCallback);
        },

        generateCacheBuster: function() {
            return (new Date()).getTime();
        },

        // Note: The .filter(function(n) { return n}) isn't a useless call
        // this will only return if the value isn't null, so if one of the fields passed to the
        // function is null, it will skip over it so that there is a "//" in the URL.
        getPageURL: function(pageName) {
            return [this.BASEURL, this.PAGE_PREFIX, pageName].filter(function(n) { return n;}).join('/') + '?' + this.generateCacheBuster();
        },

        getAPIURL: function(type, action, id) {
            return [this.BASEURL, this.API_PREFIX, this.API_VERSION, type, action, id].filter(function(n) { return n; }).join('/') + '?' + this.generateCacheBuster();
        },

        getAuthURL: function(action) {
            return [this.BASEURL, this.AUTH_PREFIX, action].filter(function(n) { return n; }).join('/') + '?' + this.generateCacheBuster();
        }
    };

    window.osa = o;
}((window.osa || {}), undefined));
