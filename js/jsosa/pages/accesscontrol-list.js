//@ sourceURL=http://localhost:8080/ajax/accesscontrol-list.js

(function(access) {
    var isWriteAccess = true; //osa.auth.getUserDetails().tenantType == 'CARRIER';
    
    // render page
    renderAccessControl();
    
    // code for transactions and data population
    var $t = $("#accessControl-data");
    var $yep = $("<span> <img class='statHas' title='" + $.i18n._("stat.has.access") + "' alt='" + $.i18n._("stat.has.access") + "' src='images/check.png'> </span>");
    var $nope= $("<span> <img class='statNo' title='" + $.i18n._("stat.no.access") + "' alt='" + $.i18n._("stat.no.access") + "' src='images/fail.png'> </span>");
    var $userSelect = $("#acl-user-type-select");
    var $tenantSelect = $("#acl-tenant-type-select");
    var isCarrier = (osa.auth.getUserDetails().tenantType == "CARRIER");


    var populateUserTypes = function (cb) {
        if (isWriteAccess) {
            var $sel = $userSelect.empty();

            osa.ajax.list('userTypes', function(l) {
                for (var i in l) {
                    if (l.hasOwnProperty(i)) {
                        $("<option></option>").attr('value', l[i].key).html(l[i].name).appendTo($sel);
                    }
                }

                (cb || $.noop)();
            });
        }
        else {
            (cb || $.noop)();
        }
    };

    var populateTenantTypes = function(cb) {
        if (isWriteAccess) {
            var $sel = $tenantSelect.empty();

            osa.ajax.list('tenantTypes', function(l) {
                for (var i in l) {
                    if (l.hasOwnProperty(i)) {
                        $("<option></option>").attr('value', l[i].key).html(l[i].name).appendTo($sel);
                    }
                }

                (cb || $.noop)();
            });
        }
        else {
            (cb || $.noop)();
        }
    };
    
    if (!isCarrier) {
        var customerOpt = $('#acl-tenant-type-select option').filter(function () { return $(this).html() == "CUSTOMER"; }).val();
        $tenantSelect.parent().addClass("hide");
        $tenantSelect.val(customerOpt);
    }

    var repopulateTable = function(userType, tenantType) {
        if (!(userType && tenantType)) {
            return;
        }

        $t.empty();
        osa.ajax.list('apiSecurity', [userType, tenantType], function(d) {
            for (var i = 0; i < d.length; i++) {
                var $tr = $("<tr class='property-block'></tr>");
                $("<td></td>").html(d[i].url).appendTo($tr);
                $("<td class='center'></td>").append((d[i].readAccess)? $yep.clone() : $nope.clone()).appendTo($tr);
                $("<td class='center'></td>").append((d[i].writeAccess)? $yep.clone() : $nope.clone()).appendTo($tr);
                $tr.appendTo($t);
            }
        });
    };

    var getSelectedUserType = function() {
        return (isWriteAccess) ? $userSelect.val() : osa.auth.getUserDetails().userType;
    };

    var getSelectedTenantType = function() {
        return (isWriteAccess) ? $tenantSelect.val() : osa.auth.getUserDetails().tenantType;
    };

    osa.page.addPageEvent('.acl-type-dropdown', 'change', function() {
        repopulateTable(getSelectedUserType(), getSelectedTenantType());
    });

    (function() {
        populateUserTypes(function() {
            populateTenantTypes(
                function() {
                    $userSelect.find('option').first().attr("selected", "selected");
                    $tenantSelect.find('option').first().attr("selected", "selected");
                    repopulateTable(getSelectedUserType(), getSelectedTenantType());
                });
            });
    })();
})(osa.auth.getPageAccess('apiSecurity'));

function renderAccessControl() {
    var form = $("#accessControl-type-selections");
    var table = $("#accessControl-table");

    table.append('<thead><tr><th>' + $.i18n._("user.tbl.hdr.url") + '</th><th>' + $.i18n._("user.tbl.hdr.read") + '</th><th>' + $.i18n._("user.tbl.hdr.write") + '</th></tr></thead><tbody id="accessControl-data"></tbody>');

    form.addSelect("acl-user-type-select", $.i18n._("user.user.type"));
    form.addSelect("acl-tenant-type-select", $.i18n._("user.tenant.type"));
    form.find("select").addClass("acl-type-dropdown");
}

