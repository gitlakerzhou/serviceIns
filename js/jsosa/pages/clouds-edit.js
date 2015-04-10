//function run_editCloud() {
(function(access) {
    
    cloudRenderForm();
    $("#cloudDetailsSection").append('<div class="form-input-block" style = "text-align : right;"><input id="cloud-edit-save"   type="submit" class="button btnClear btnSave" disabled="disabled" value="' + $.i18n._("cld.btn.update") + '" /> <input id="cloud-edit-cancel" type="button" class="button btnClear btnCancel" disabled="disabled" value="'  + $.i18n._("btn.cancel") +  '" /></div>');

    var CLOUDSWITCH_ID_PREFIX = 'cloudSwitch-block-';
    var PHYSICALCONNECTION_ID_PREFIX = 'cloudPhysicalConnection-block-';
    var VIPR_ID_PREFIX = 'vipr-block-';
    var $coSelect = $("#cloudCO");
    var $coInput = $("#cloudCO");
    var $viprList = $("#cloud-edit-vipr-list");
    var $cloudSwitchList = $("#cloud-edit-cloudSwitch-list");
    var $physicalConnectionList = $("#cloud-edit-physicalConnection-list");

    var $viprBlock = $("#virtualIPRange-block-template");
    var $cloudSwitchBlock = $("#cloudSwitch-block-template");
    var $physicalConnectionBlock = $("#physicalConnection-block-template");
    var __coList = [];
    var __cloudInfo = {};
    var hvrStrDelete = $.i18n._("btn.delete");


    var getSelectedCO = function() {
        return $coSelect.val();
    };

    var addCloudSwitchBlock = function(csobj) {
        var $c = $cloudSwitchBlock.clone().attr("id", CLOUDSWITCH_ID_PREFIX + idify(csobj.displayName)).data(csobj);
        $c.find('.displayName').html(csobj.displayName);
        $c.find(".cloudSwitch-delete-btn").attr("title", hvrStrDelete);
        $c.appendTo($cloudSwitchList);
    };

    var addPhysicalConnectionBlock = function(cobj) {
        var $c = $physicalConnectionBlock.clone().attr("id", PHYSICALCONNECTION_ID_PREFIX + idify(cobj.key)).data(cobj);
        $c.find('.physicalDeviceName').html(cobj.physicalDeviceName);
        $c.find('.physicalDeviceAccessPortName').html(cobj.physicalDeviceCloudAccessPortName);
        $c.find('.physicalDeviceBackbonePortName').html(cobj.physicalDeviceCloudBackbonePortName);
        $c.find('.cloudSwitchName').html(cobj.cloudSwitchName);
        $c.find(".physicalConnection-delete-btn").attr("title", hvrStrDelete);
        $c.appendTo($physicalConnectionList);
    };

    var addViprBlock = function(vobj) {
        var $v = $viprBlock.clone().attr("id", VIPR_ID_PREFIX + idify(vobj.cidr)).data(vobj);
        $v.find('.cidr').html(vobj.cidr);
        $v.find('.blockSize').html(vobj.blockSize);
        $v.find(".vipr-delete-btn").attr("title", hvrStrDelete);
        $v.appendTo($viprList);
    };


    var reloadData = function() {
        osa.ajax.get("clouds", osa.page.getPageURLParameters().key, function(data) {
        
            __cloudInfo = data;
            
            var split = __cloudInfo.authorizationURL.split(":");
            
            $("#cloud-edit-key").val(data.key);
            $("#cloudName").val(data.displayName);
            $("#cloudAuthUrl").val(split[0] + ":" + split[1]);
            $("#cloudAuthUrlPort").val(split[2]);
            $("#cloudLogin").val(data.login);
            $("#cloudPassword").val(data.password);
            $("#cloudHostUser").val(data.cloudHostUser);
            $("#cloudHostUserPw").val(data.cloudHostUserPassword);
            $("#cloudTenant").val(data.cloudTenant);
            $coSelect.val(data.centralOfficeKey);
            
            $("#cloudCoText").html($("#cloudCO :selected").html());
            $("#cloudAuthUrlText").html($("#cloudAuthUrl").val());
            $("#cloudAuthUrlPortText").html($("#cloudAuthUrlPort").val());
            
            
            

            $viprList.empty();
            for (var i in data.virtualIPRanges) {
                if (data.virtualIPRanges.hasOwnProperty(i)) {
                    addViprBlock(data.virtualIPRanges[i]);
                }
            }

            $cloudSwitchList.empty();
            for (var i in data.cloudSwitches) {
                if (data.cloudSwitches.hasOwnProperty(i)) {
                    addCloudSwitchBlock(data.cloudSwitches[i]);
                }
            }

            $physicalConnectionList.empty();
            for (var i in data.cloudPhysicalConnections) {
                if (data.cloudPhysicalConnections.hasOwnProperty(i)) {
                    addPhysicalConnectionBlock(data.cloudPhysicalConnections[i]);
                }
            }
            
            $("#cloud-edit-form input").change(function() {
                $("#cloud-edit-save").removeAttr("disabled");
                $("#cloud-edit-cancel").removeAttr("disabled");
            });
        });
    };


    osa.page.addPageEvent(".vipr-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".vipr-block").data();
        ev.preventDefault();

        if (who) {
            if (confirm($.i18n._("cld.msg.confirm.del.ip"))) {
                osa.ajax.removeByObj('virtualIPRanges', who, function() {
                    reloadData();
                    $("#cloudEditIpRangeDelSuccess").show("slow");
                    setTimeout(function(){$("#cloudEditIpRangeDelSuccess").hide("slow");}, 4000);
                });
            }
        }
    });

    osa.page.addPageEvent(".cloudSwitch-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".cloudSwitch-block").data('key');
        ev.preventDefault();

        if (who) {
            if (confirm($.i18n._("cld.msg.confirm.del.cld.sw"))) {
                osa.ajax.remove('cloudSwitches', who, function() {
                    reloadData();
                    $("#cloudEditCloudCnctDelSuccess").show("slow");
                    setTimeout(function(){$("#cloudEditCloudCnctDelSuccess").hide("slow");}, 4000);
                });
            }
        }
    });

    osa.page.addPageEvent(".physicalConnection-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".physicalConnection-block").data('key');
        ev.preventDefault();

        if (who) {
            if (confirm($.i18n._("cld.msg.confirm.del.cld.sw"))) {
                osa.ajax.remove('cloudPhysicalConnections', who, function() {
                    reloadData();
                    $("#cloudEditPhysCnctDelSuccess").show("slow");
                    setTimeout(function(){$("#cloudEditPhysCnctDelSuccess").hide("slow");}, 4000);
                });
            }
        }
    });

    osa.page.addPageEvent("#button-add-vipr", 'click', function(ev) {
        var p = osa.ui.formPopup.create($.i18n._("cld.hdr.add.ip"), null, {submitLabel: $.i18n._("btn.add")});
//        var who = $(ev.target).parents(".list-block").data('key');
        ev.preventDefault();
        p.addField('vipr-cloudKey', 'Cloud Key', 'hidden', __cloudInfo.key);
        p.addField("vipr-cidr", $.i18n._("cld.vipr.cidr"), 'string');
        p.addField("vipr-blockSize", $.i18n._("cld.vipr.bl.sz"), 'string');

        p.setRequiredFields(['vipr-cidr', 'vipr-blockSize']);
        p.setSubmitAction(function(fields) {
            osa.ajax.add('virtualIPRanges', {cidr: fields['vipr-cidr'], blockSize: fields['vipr-blockSize'], cloudKey:fields['vipr-cloudKey']}, function() {
                reloadData();
                p.hide();
                $("#cloudEditIpRangeSuccess").show("slow");
                setTimeout(function(){$("#cloudEditIpRangeSuccess").hide("slow");}, 4000);
            });
        });
        p.show();
    });

    osa.page.addPageEvent('#button-add-cloudSwitch', 'click', function(ev) {
        var p = osa.ui.formPopup.create($.i18n._("cld.hdr.add.cld.sw"), null, {submitLabel: $.i18n._("btn.add")});
        ev.preventDefault();
        p.addField('cs-cloudKey', 'Cloud Key', 'hidden', __cloudInfo.key);
        p.addField('cs-coKey', 'CO Key', 'hidden', __cloudInfo.centralOfficeKey);
        p.addField("cs-name", $.i18n._("cmn.name"), 'string');
        p.setRequiredFields(['cs-name']);
        p.setSubmitAction(function(fields) {
            var o = {
                displayName: fields['cs-name'],
                portCollection: [],
                centralOfficeKey: fields['cs-coKey'],
                cloudKey: fields['cs-cloudKey']
            };

            osa.ajax.add('cloudSwitches', o, function(response) {
                reloadData();
                p.hide();
                $("#cloudEditCloudCnctSuccess").show("slow");
                setTimeout(function(){$("#cloudEditCloudCnctSuccess").hide("slow");}, 4000);
            });
        });

        
        
        p.show();
    });

    osa.page.addPageEvent('#button-add-physicalConnection', 'click', function(ev) {
        ev.preventDefault();
        var __devList = [];
        var p = osa.ui.formPopup.create($.i18n._("cld.add.phys.dev"), null, {submitLabel: $.i18n._("btn.add")});
        var cloudSwitchSelect = __cloudInfo.cloudSwitches.map(function(el) { return {key: el.key, value:el.displayName}});

        p.addField('phys-cloudKey', 'Cloud Key', 'hidden', __cloudInfo.key);
        p.addField('phys-switch', $.i18n._("cmn.phys.dev"), 'select', [], function() {
            var $accessPorts = p.getField('phys-access-port').empty();
	    var $backbonePorts = p.getField('phys-backbone-port').empty();
	    var accessPorts = [];
	    var backbonePorts = [];

            $("<option></option>", {value:null, html:""}).appendTo($accessPorts);
            $("<option></option>", {value:null, html:""}).appendTo($backbonePorts);
            for (var i = 0; i < __devList.length; i++) {
                if (__devList[i].key == p.getField('phys-switch').val()) {
                    accessPorts = __devList[i].portCollection;
                    backbonePorts = __devList[i].portCollection;
                    break;
                }
            }

            for (var i = 0; i < accessPorts.length; i++) {
                $("<option></option>", {value:accessPorts[i].key, html:accessPorts[i].displayName}).appendTo($accessPorts);
            }
           for (var i = 0; i < backbonePorts.length; i++) {
                $("<option></option>", {value:backbonePorts[i].key, html:backbonePorts[i].displayName}).appendTo($backbonePorts);
            }

        });

        p.addField('phys-cloudSwitch',$.i18n._("cld.cnct.cld.dev"), 'select', cloudSwitchSelect);
        p.addField('phys-access-port', $.i18n._("cmn.accessPort"), 'select', []);
        p.addField('phys-backbone-port', $.i18n._("cmn.backbonePort"), 'select', []);
        p.setRequiredFields(['phys-switch', 'phys-access-port', 'phys-backbone-port','phys-cloudSwitch']);


        p.setSubmitAction(function(fields) {

            var o = {
                key: '',
                cloudSwitchKey: fields['phys-cloudSwitch'],
                physicalDeviceKey: fields['phys-switch'],
                physicalDeviceCloudAccessPortKey: fields['phys-access-port'],
                physicalDeviceCloudBackbonePortKey: fields['phys-backbone-port'],
                cloudKey: fields['phys-cloudKey']
            };
            osa.ajax.add('cloudPhysicalConnections', o, function() {
                reloadData();
                
                p.hide();
                $("#cloudEditPhysCnctSuccess").show("slow");
                setTimeout(function(){$("#cloudEditPhysCnctSuccess").hide("slow");}, 4000);
            });
        });

        osa.ajax.list('physicalDevices', function(sw) {
            var co = getSelectedCO();
            __devList = sw;
            var $sws = p.getField('phys-switch').empty();
            p.getField('phys-access-port').empty();
            p.getField('phys-backbone-port').empty();

            $("<option></option>", {value:null, html:''}).appendTo($sws);
            for (var i = 0; i < __devList.length; i++) {
                if(__devList[i].centralOfficeKey == co) {
                    $("<option></option>", {value:__devList[i].key, html:__devList[i].displayName}).appendTo($sws);
                }
            }
            p.show();
        });
    });

    osa.page.addPageEvent('#cloud-edit-cancel', 'click', function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("cld.msg.warn.cancel"))) {
            location.href="#clouds-list";
        }
    });


    // Initial kick off of data.
    osa.ajax.list('centralOffices', function(coList) {
        $("<option></option>").val("").html("").appendTo($coSelect);
        for (var i = 0; i < coList.length; i++) {
            __coList.push({key: coList[i].key, value:coList[i].displayName});
            $("<option></option>").val(coList[i].key).html(coList[i].displayName).appendTo($coSelect);
        }

        reloadData();
    });



    $("#cloud-edit-form").submit(function(ev) {
        var o = {
            "key"                   : $("#cloud-edit-key").val(),
            "displayName"           : $("#cloudName").val(),
            "authorizationURL"      : $("#cloudAuthUrl").val() + ":" + $("#cloudAuthUrlPort").val(),
            "login"                 : $("#cloudLogin").val(),
            "password"              : $("#cloudPassword").val(),
            "cloudHostUser"         : $("#cloudHostUser").val(),
            "cloudHostUserPassword" : $("#cloudHostUserPw").val(),
            "cloudTenant"           : $("#cloudTenant").val(),
            "centralOfficeKey"      : $("#cloudCO").val(),
            "virtualIPRanges"       : [],
            "cloudSwitches"         : [],
            "cloudPhysicalConnections": [],
            "cloudLocations"        : []
        };

        osa.ajax.update("clouds", o, function(resp) {
                osa.ui.modalBox.warn("Success", $.i18n._("cld.update.success"));
                location.href = "#clouds-list";
        });
        return false;
    });
    
    $("#row_cloudCO").addClass("hide");
    $("#row_cloudAuthUrl").addClass("hide");
    $("#row_cloudAuthUrlPort").addClass("hide");

    $("#row_cloudCoText").removeClass("hide");
    $("#row_cloudAuthUrlPortText").removeClass("hide");
    $("#row_cloudAuthUrlText").removeClass("hide");
    
    
    $("#cloudPassword").attr("type", "password");
    $("#cloudHostUserPw").attr("type", "password");
    
    // i18n for edit page headers.
    $("#hdrAttachedCloudSwitches").html($.i18n._("cld.hdr.cld.sws"));
    $("#hdrAttachedPhysDevs").html($.i18n._("cld.hdr.phys.sws"));
    $("#hdrVirtualIpRanges").html($.i18n._("cld.hdr.vrt.ip"));
    
    // i18n for success and fail messages on page
    $("#cloudEditCloudCnctSuccess").html($.i18n._("cld.msg.add.cs.success"));
    $("#cloudEditCloudCnctDelSuccess").html($.i18n._("cld.msg.del.cs.success"));
    $("#cloudEditPhysCnctSuccess").html($.i18n._("cld.msg.add.ps.success"));
    $("#cloudEditPhysCnctDelSuccess").html($.i18n._("cld.msg.del.ps.success"));
    $("#cloudEditIpRangeSuccess").html($.i18n._("cld.msg.add.vip.success"));
    $("#cloudEditIpRangeDelSuccess").html($.i18n._("cld.msg.del.vip.success"));
    
    var addStr = $.i18n._("btn.add");
    $("#button-add-cloudSwitch .btnStr").html(addStr);
    $("#button-add-physicalConnection .btnStr").html(addStr);
    $("#button-add-vipr .btnStr").html(addStr);
    
    

})(osa.auth.getPageAccess('clouds'));

//}
