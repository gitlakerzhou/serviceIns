// extra validation methods
$.validator.addMethod("nameNotUsed", function(value, element, form) {
        var dataObj = $(form).data("existingNames");
        var boolReturn = true;
        
        var tenant;
        // if option
        if ($("#service-create-form-tenant option")) {
            tenant = $("#service-create-form-tenant option:selected").html();
        }
        else { // non-editbale
            tenant = $("#service-create-form-tenant").html();
        }
        
        if (dataObj && (dataObj[value] == tenant)) {
            boolReturn = false;
            return false;
        };
        
        return boolReturn;
}, $.i18n._("srvc.vld.uniq.name"));

$.validator.addMethod('notEqualTo', function(value, element, compareTo) {
    if (value !== "" && value == $(compareTo).val()) return false;
    return true;
}, $.i18n._("srvc.vld.equal"));

// this stinks, but used for now
$.validator.addMethod('notEqualToEither', function(value, element, compareTo) {
    if (value !== "" && value == $(compareTo).val()) return false;
    return true;
}, $.i18n._("srvc.vld.equal"));


$.validator.addMethod('ip', function(value) {
    var split = value.split('.');
    if (split.length != 4)
        return false;
    
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        if (s.length == 0 || isNaN(s) || s < 0 || s > 255)
            return false;
    }
    return true;
}, $.i18n._("srvc.vld.not.ip"));

// TODO: This will only work for today with the single range set.  This will need to be 
// beefed up for many ranges since its not just higher than the max, but also lower than 
// the next highest min.
$.validator.addMethod('outsideIpRange', function(value, rangeSet) {
    var rtrn = true;
    var valFluff = fluffIpForCompare(value);

    $(".crtSrvcRng").each(function() {
        var minFluff= fluffIpForCompare($(this).find(".min").val());
        var maxFluff = fluffIpForCompare($(this).find(".max").val());
        
        if (valFluff <= maxFluff && valFluff >= minFluff) { // if its in between a range, that is bad
            rtrn = false;
            return false; // just get out
        }
    });
    return rtrn;
}, $.i18n._("srvc.vld.not.outside.ip"));


function fluffIpForCompare(ip) {
    var ipArray = ip.split(".");
    

    
    for (var i=0; i<ipArray.length; i++) {
        if (ipArray[i].length == 1) ipArray[i] = "00" + ipArray[i];
        else if (ipArray[i].length == 2) ipArray[i] = "0" + ipArray[i];
    }
    
    return ipArray.join(".");    
}

var holdServiceOrderNames = function () {
    var form = $("#service-create-form");
    var existingNames = {};
    osa.ajax.list('servicesV2', function(data) {
        for (var i=0; i< data.length; i++) {
            existingNames[data[i].serviceOrderName] = data[i].tenantName;
        }
        form.data("existingNames", existingNames);
    });
};


var getVNFTypeName = function(key, _vnfList) {
    for (var i = 0; i < _vnfList.length; i++) {
        if (_vnfList[i].key == key) {
            return _vnfList[i].displayName;
        }
    }
};