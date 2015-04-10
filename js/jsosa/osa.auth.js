
(function(o, undefined) {
    // Private Ajax calling method.
    var __makeAjaxCall = function(ajaxOptions, successCallback, failCallback) {
        if (!osa && !osa.ajax) {
            return;
        }
        $.ajax(ajaxOptions)
            .done(successCallback   || osa.ajax.defaultHandlers.success)
            .fail(failCallback      || osa.auth.defaultHandlers.fail)
            .always(osa.ajax.defaultHandlers.always);
    };

    var __showAjaxAlert = function(failObj) {
        if (osa && osa.ui && osa.ui.modalBox) {
            osa.ui.modalBox.alert(failObj.title, failObj.message);
        }
        else {
            throw failObj;
        }
    };


    o.auth = {
        isLoggedIn: false,
        userCapabilities: null,
        __userDetails: {},

        // Default Options for all AJAX Calls
        options: {
            type: 'post',
            beforeSend: function() {
                osa.ajax.showLoadingBar();
            }
        },

        // Forbidden messages for authorization should say something different.
        statusCodeHandlers: {
            403: function() {
                return function(resource) {
                    return {code: 403, title: 'Forbidden', message: $.i18n._("lgn.wrong.login") };
                };
            }
        },

        defaultHandlers: {
            fail: function(jqXHR, ts, err) {
                // This is possibly the worst line of Javascript I've ever written.
                __showAjaxAlert((osa.auth.statusCodeHandlers[jqXHR.status] || osa.ajax.statusCodeHandlers[jqXHR.status])()(this.url));
            }
        },

        setAuthentication: function(isAuthenticated) {
            this.isLoggedIn = isAuthenticated;
            if (!isAuthenticated) {
                this.setUserCapabilities(null);
            }
        },

        // This will cache the user's capabilities for various processing
        // by the UI.  For easy digestion, we'll store it based on
        // {URL: [access list]}
        setUserCapabilities: function(userCapabilities) {
            var o = {};

            // Iterate over the list and reorient as we want to view it
            for (var i in userCapabilities) {
                if (userCapabilities.hasOwnProperty(i)) {
                    this.__userDetails.tenantType = userCapabilities[i].tenantType;

                    o[userCapabilities[i].url] = {
                        'read': userCapabilities[i].readAccess,
                        'write': userCapabilities[i].writeAccess,
                        'singleTenantView': userCapabilities[i].singleTenantView
                    };
                }
            }

            this.userCapabilities = o;
        },

        updateUserCapabilities: function(successCallback) {
            var _this = this;
            osa.ajax.list('capabilities', function(data) {
                _this.setUserCapabilities(data);
                (successCallback || $.noop)();
            });
        },

        updateUserDetails: function(cb) {
            var _this = this;
            var o = clone(this.options);
            o.type = 'get';
            o.url = osa.ajax.getAPIURL('userDetails');
            __makeAjaxCall(o, function(data) {
                _this.setUserDetails(data);
                (cb || $.noop)(data);
            });
        },

        setUserDetails: function(user) {
            this.__userDetails = user;
            $("#user-area").removeClass('hide');
            $("#userAreaUserName").html(user.login);
        },

        getUserDetails: function() {
            return this.__userDetails;
        },

        getUserCapabilities: function() {
            return this.userCapabilities;
        },

        // Returns the list of available capabilities for
        // the current page with the current user.
        getPageAccess: function(page) {
            return this.userCapabilities['/api/' + page];
        },


        // Method to login to the server and get a session
        login: function(username, password, successCallback) {
            var o = clone(this.options);
            o.url = osa.ajax.getAuthURL('login');
            o.data = {'j_username': username, 'j_password':password};
            o.statusCode = osa.ajax.statusCodeHandlers;
            __makeAjaxCall(o, successCallback);
        },

        // Method to logout of the API and invalidate the session
        logout: function(successCallback) {
            var o = clone(this.options);
            o.url = osa.ajax.getAuthURL('logout');
            o.statusCode = osa.ajax.statusCodeHandlers;
            __makeAjaxCall(o, successCallback);
        }
    };

    window.osa = o;
}((window.osa || {}), undefined));
