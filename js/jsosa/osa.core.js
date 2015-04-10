

var __ISDEBUG = true;
var ANIMATE_SPEED = 250;
var FIRST_MENU_PAGE = null;

// Handle the hashchange event that will jump pages when the
// hash changes.
$(window).bind('hashchange', function(ev) {
    ev.preventDefault();
    osa.page.load(processHash());
});

// Handle all logout buttons
$(document).on("click", ".logout-btn", function(ev) {
    ev.preventDefault();
    osa.auth.logout(showLogin);
    window.location.hash = '';
});

// On loading of any page (or unload of the current one),
// Clear any events that have been added to the page.
$(window).on('unload', function(ev) {
    osa.page.clearPageEvents();
});

// Since most pages contain lists and collapsible blocks, add these events globally
$(document).on('click', '.list-block-header-name', function(ev) {
    ev.preventDefault();
    $(this).parents(".collapsible-container").toggleClass("collapsed");
});



// Main function that will kick off all subsequent JS calls once
// the page has loaded.  If the user is logged in (found in rootPage.jsp),
// Automatically kick off the UI.  Otherwise, show the login dialog.
$(function() {
    osa.ui.fx.renderPattern();
    (__isLoggedIn ? initializeUI : showLogin)();
    
    // I18N
    document.title = $.i18n._("app.title");
    $("#appVersion").html($.i18n._("app.version"));
    $("#appCopyright").html($.i18n._("app.cpyrght"));
    $("#user-area-profile-btn img").attr("title", $.i18n._("my.profile"));
    $("#user-area-logout-btn img").attr("title", $.i18n._("log.out"));
});


// Open up the login window.
var showLogin = function() {
    osa.auth.setAuthentication(false);
    osa.page.clearPageEvents();
    animateClose();

    $("#main-area").addClass('hide', function() { $(this).empty(); });
    $("#user-area").addClass('hide');

    var popup = osa.ui.formPopup.create($.i18n._("lgn.log.in"), null, {
        isOverlay:false,
        buttons: [
            {label:$.i18n._("lgn.btn.enter"), action: function() { popup.submitForm(); }}
        ]
    });
    
    popup.$FORM.attr("id", "overtureLogin");

    popup.addField('username', $.i18n._("cmn.username"), 'text');
    popup.addField('password', $.i18n._("cmn.password"), 'password');
    popup.setRequiredFields(['username', 'password']);

    popup.setSubmitAction(function(formValues) {
        osa.auth.login(popup.getField('username').val(), popup.getField('password').val(), function(resp) {
            if ((resp !== '') && (resp !== 'fail')) {
                // Set auth cookie for Alexei
                document.cookie="auth-token=" + resp;
                popup.hide();
                initializeUI();
            }
        });
        return false;
    });
    
    popup.$TITLE.attr("id", "loginPageTitle");

    popup.show();
};


// After authentication, make the AJAX calls to update the user information
// and load the menu and populate various things.
var initializeUI = function() {
    osa.auth.updateUserDetails();
    osa.auth.updateUserCapabilities(function() {
        $("#menu-area").load(__MENUURL, function() {
            var licenseURL = "system-licensing";
            var physDevUrl = "devices-switches";
            var centOfcUrl = "locations-centralOffices";
            var $first = $("#menu-nav").children().first();
            
            // --------------------------------------
            // I18N
            // --------------------------------------
            $("#menu-nav-services .menuLabel").html($.i18n._("cube.services"));
            $("#menu-nav-clouds .menuLabel").html($.i18n._("cube.clouds"));
            $("#menu-nav-locations .menuLabel").html($.i18n._("cube.locations"));
            $("#menu-nav-devices .menuLabel").html($.i18n._("cube.devices"));
            $("#menu-nav-users .menuLabel").html($.i18n._("cube.users"));
            $("#menu-nav-system .menuLabel").html($.i18n._("cube.system"));
            
            // Services
            $("#subpage-services-list").html($.i18n._("menu.services"));
            $("#subpage-services-history").html($.i18n._("menu.history"));
            $("#subpage-services-edit").html($.i18n._("menu.edit.service"));
            $("#subpage-services-create").html($.i18n._("menu.create.service"));
            $("#subpage-services-create-from").html($.i18n._("menu.create.from"));
            
            // Clouds
            $("#subpage-clouds-dashboard").html($.i18n._("menu.cld.res"));
            $("#subpage-clouds-list").html($.i18n._("menu.cld.lst"));
            $("#subpage-clouds-edit").html($.i18n._("menu.cld.edt"));
            $("#subpage-clouds-create").html($.i18n._("menu.cld.crt"));
            
            // Locations
            $("#subpage-locations-sites").html($.i18n._("menu.loc.sites"));
            $("#subpage-locations-centralOffices").html($.i18n._("menu.loc.cos"));
            
            // Devices
            $("#subpage-devices-switches").html($.i18n._("menu.dev.phys"));
            $("#subpage-devices-deviceTypes").html($.i18n._("menu.dev.phys.types"));
            $("#subpage-devices-vnfTypes").html($.i18n._("menu.dev.vnf.types"));
            $("#subpage-devices-compositeVNFTypes").html($.i18n._("menu.dev.cmpst.vnf.types"));
            $("#subpage-devices-compositeVNFTypes-create").html($.i18n._("menu.dev.crt.cmpst.vnf.types"));
            
            // Users
            $("#subpage-users-list").html($.i18n._("menu.users"));
            $("#subpage-users-tenants-list").html($.i18n._("menu.tenants"));
            $("#subpage-users-accesscontrol-list").html($.i18n._("menu.acls"));
            $("#subpage-users-tenancy-list").html($.i18n._("menu.tenancy"));
            
            // System
            $("#subpage-system-properties-list").html($.i18n._("menu.sys.props"));
            $("#subpage-system-licensing").html($.i18n._("menu.license"));
            
            
            
            
            animateOpen();
            var isLicenseAware = osa.auth.userCapabilities["/api/licenses"].write;
            
            if (!isLicenseAware) {
                osa.page.load(processHash($first.attr("href")));
            }
            else {
                // if there is a licensing issue, go to licenses first
                osa.ajax.list('licenses', function(data) {
                    
                    // tell the user in case there are no licenses
                    if (data.length == 0) {
                        osa.page.load(licenseURL);
                    }
                    // otherwise go to service orders
                    else {
                        var navNormal = true;
                        // check to make sure the license is not almost expired.
                        for (var i=0; i<data.length; i++) {
                            var curLic = data[i];
                            var prettyDt = curLic.expiration.split(" ")[0];
                            var licDate = convertLicenseDateToDate(curLic);
                            var curDate = new Date();
                            var oneMoLater = getOneMonthFromToday();
                            
                            if (licDate <= curDate) {
                                alert($.i18n._("lic.msg.wran.exp"));
                                navNormal = false;
                                $("#mainAlerts").html('<div class="alarmSevere licensing">' + $.i18n._("lic.msg.exp") + '</div>');
                                $("#mainAlerts .licensing").click(function() {
                                    osa.page.load(licenseURL);
                                });
                            }
                            else if (licDate <= oneMoLater) {
                                $("#mainAlerts").html('<div class="alarmModerate licensing">' + $.i18n._("lic.msg.exps") + ': ' + prettyDt + '</div>');
                                $("#mainAlerts .licensing").click(function() {
                                    osa.page.load(licenseURL);
                                });
                            }
                        }
                        
                        if (navNormal){
                            
                            osa.ajax.list('centralOffices', function(data) {
                                if (data.length > 0) {
                                    osa.ajax.list('physicalDevices', function(data) {
                                        if (data.length > 0)
                                            osa.page.load(processHash($first.attr("href")));
                                        else 
                                            osa.page.load(physDevUrl);
                                    });
                                }
                                else 
                                    osa.page.load(centOfcUrl);
                            });
                        }
                            
                        else 
                            osa.page.load(licenseURL);
                    }
                });
            }
 
            
            
                      
            
        });
    });
};

// Animation functions that will step through all "anim-step-#" classes and animate
// them such that they look like they're flipping in sequentially.
var animateOpen = function() {
    var i = 1,
        f = function(j) {
        setTimeout(function() {
            $(".anim-step" + j).removeClass('hide');
        }, ANIMATE_SPEED * j);
    };

    while ($(".anim-step" + i).size() > 0) {
        f(i++);
    }
};

var animateClose = function() {
    var i = 1;
    var f = function(j) {
        setTimeout(function() {
            $(".anim-step" + j).addClass('hide');
        }, ANIMATE_SPEED * (2 - j));
    };

    while ($(".anim-step" + i).size() > 0) {
        f(i++);
    }
};

// Clean up the hash that's given on page loads.  Also optionally pass a fallback
// that can override where to go if no hash is found.
var processHash = function(fallback) {
    return (window.location.hash.split('/')[0] || fallback || '').replace(/^#/, '');
};

// Small wrapper around performing a deep-copy of an object;
// Reference: http://stackoverflow.com/questions/122102/most-efficient-way-to-clone-an-object
var clone = function(originalObject) {
    return $.extend(true, {}, originalObject);
};


var DEBUG = function() {
    (__ISDEBUG || false) && console.log(arguments);
};

// Used all the time in various forms to clean up usernames
// may be deprecated with the use of numbers for keys?
var idify = function(str) {
    return (typeof str == 'number') ? str : str.replace(/\s/g, '-');
};


// Global function to update the counts for any list block headers
var updateListBlockCounts = function() {
    $(".collapsible-container").each(function(e) {
        var s = $(this).find(".list-block-container").children().size();
        if (s > 0) {
            $(this).removeClass("hide");
        }
        $(this).find(".list-block-header-size").html('(' + s + ')');
    });
};




/*  This work is licensed under Creative Commons GNU LGPL License.
    License: http://creativecommons.org/licenses/LGPL/2.1/
    Version: 0.9
    Author:  Stefan Goessner/2006
    Web:     http://goessner.net/
*/
var json2xml = function(o, tab) {
    var toXml = function(v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i=0, n=v.length; i<n; i++) xml += ind + toXml(v[i], name, ind+"\t") + "\n";
        }
        else if (typeof(v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) == "@")
                    xml += " " + m.substr(1) + "=\"" + ((v[m]) ? v[m].toString() : '') + "\"";
                else
                    hasChild = true;
            }

            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m in v) {
                    if (m == "#text") xml += v[m];
                    else if (m == "#cdata") xml += "<![CDATA[" + v[m] + "]]>";
                    else if (m.charAt(0) != "@") xml += toXml(v[m], m, ind+"\t");
                }
                xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + ((v) ? v.toString() : '') +  "</" + name + ">";
        }
        return xml;
    }, xml="";
    for (var m in o) xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
};

function convertLicenseDateToDate(curLic) {
    var dt = curLic.expiration.split(" ");
    var dtArr = dt[0].split("-");
    var yr = dtArr[0];
    var mo = $.i18n._("date.month." + (parseInt(dtArr[1]) - 1));
    var dy = dtArr[2];
    
    var licDate = new Date(mo + " " + dy + " " + yr + " 00:00:00");
    
    return licDate;
}

function getOneMonthFromToday() {
    var curDateTmp = new Date();
    var oneMoLater = new Date();
     
    oneMoLater.setMonth(curDateTmp.getMonth() + 1);    
    
    return oneMoLater;
}