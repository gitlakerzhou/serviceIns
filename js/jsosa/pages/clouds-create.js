//function run_cloudsCreate() {
(function(access) {
    var isWriteAccess = access.write;
    
    cloudRenderForm();
    cloudPopulateDefaults();
    
    // I18N
    $("#submittingMsg").html($.i18n._("cmn.submitting"));

    var CLOUDSWITCH_ID_PREFIX = 'cloudSwitch-block-';
    var PHYSICALCONNECTION_ID_PREFIX = 'cloudPhysicalConnection-block-';
    var VIPR_ID_PREFIX = 'vipr-block-';
    var $coSelect = $("#cloudCO");
    var $viprList = $("#cloud-create-vipr-list");
    var $cloudSwitchList = $("#cloud-create-cloudSwitch-list");
    var $physicalConnectionList = $("#cloud-create-physicalConnection-list");
    var $viprBlock = $("#virtualIPRange-block-template");
    var $cloudSwitchBlock = $("#cloudSwitch-block-template");
    var $physicalConnectionBlock = $("#physicalConnection-block-template");
    var __coList = [];
    var hvrStrDelete = $.i18n._("btn.delete");

    var getSelectedCO = function() {
        return $coSelect.val();
    };

    var getCollectionFromList = function($divList) {
        var l = [];
        $divList.children().each(function() {
            l.push($(this).data());
        });

        return l;
    };

    var addCloudSwitchBlock = function(csobj) {
        var $c = $cloudSwitchBlock.clone().attr("id", CLOUDSWITCH_ID_PREFIX + idify(csobj.displayName)).data(csobj);
        $c.find('.displayName').html(csobj.displayName);
        $c.appendTo($cloudSwitchList);
        $c.find(".cloudSwitch-delete-btn").attr("title", hvrStrDelete);
        $("#button-add-physicalConnection").removeClass("disabled");
    };

    var addPhysicalConnectionBlock = function(cobj) {
        var k = (cobj.key === undefined) ? cobj.physicalDeviceKey + "-" + cobj.physicalDeviceCloudAccessPortKey + '-' + cobj.physicalDeviceCloudBackbonePortKey + '-' + cobj.cloudSwitchKey : cobj.key;
        var $c = $physicalConnectionBlock.clone().attr("id", PHYSICALCONNECTION_ID_PREFIX + idify(k)).data(cobj);
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

    osa.ajax.list('centralOffices', function(coList) {
        $coSelect.prepSel(true);
        
        coList.sort(function(a, b) {
            if (a.displayName > b.displayName)          return 1;
            else if (a.displayName == b.displayName)    return 0;
            else                                        return -1;
        });

        for (var i = 0; i < coList.length; i++) {
            __coList.push({key: coList[i].key, value:coList[i].displayName});
            $("<option></option>").val(coList[i].key).html(coList[i].displayName).appendTo($coSelect);
        }
    });


    osa.page.addPageEvent(".vipr-delete-btn", 'click', function(ev) {
        var $who = $(ev.target).parents(".vipr-block");
        ev.preventDefault();

        if (confirm($.i18n._("cld.msg.confirm.del.ip"))) {
            $who.remove();
        }
    });

    osa.page.addPageEvent(".cloudSwitch-delete-btn", 'click', function(ev) {
        var $who = $(ev.target).parents(".cloudSwitch-block");
        ev.preventDefault();

        if (confirm($.i18n._("cld.msg.confirm.del.cld.sw"))) {
            $who.remove();
        }
    });

    osa.page.addPageEvent(".physicalConnection-delete-btn", 'click', function(ev) {
        var $who = $(ev.target).parents(".physicalConnection-block");
        ev.preventDefault();

        if (confirm($.i18n._("cld.msg.confirm.del.phys"))) {
            $who.remove();
        }
    });

    osa.page.addPageEvent("#button-add-vipr", 'click', function(ev) {
        var p = osa.ui.formPopup.create($.i18n._("cld.hdr.add.ip"), null, {submitLabel: $.i18n._("btn.add")});
        ev.preventDefault();
        p.addField("cidr", 'CIDR', 'string');
        p.addField("blockSize", 'Block Size', 'string');
        p.setRequiredFields(['cidr', 'blockSize']);
        p.setSubmitAction(function(fields) {
            addViprBlock(fields);
            p.hide();
        });
        p.show();
    });

    osa.page.addPageEvent('#button-add-cloudSwitch', 'click', function(ev) {
        var p = osa.ui.formPopup.create($.i18n._("cld.hdr.add.cld.sw"), null, {submitLabel: $.i18n._("btn.add")});
        ev.preventDefault();
        p.addField("displayName", 'Name', 'string');
        p.setRequiredFields(['displayName']);
        p.setSubmitAction(function(fields) {
            var o = {
                displayName: fields['displayName'],
                portCollection: [],
                centralOfficeKey: $("#cloudCO").val(),
            };

            addCloudSwitchBlock(o);
            p.hide();
        });

        p.show();
    });

    osa.page.addPageEvent('#button-add-physicalConnection', 'click', function(ev) {
        ev.preventDefault();
        
        if (!$(this).hasClass("disabled")) {
            var p = osa.ui.formPopup.create($.i18n._("cld.add.phys.dev"), null, {submitLabel: $.i18n._("btn.add")});
            // USED TO POPULATE THE CLOUD SWITCH INPUT
            var cloudSwitchSelect = getCollectionFromList($cloudSwitchList).map(function(el) { return {key:el.displayName, displayName:el.displayName};});

            if (cloudSwitchSelect.length == 0) {
                osa.ui.modalBox.alert($.i18n._("cld.hdr.warn.switch"), $.i18n._("cld.msg.warn.switch"));
                return;
            }

            if (getSelectedCO() == '') {
                osa.ui.modalBox.alert("Please Select a Central Office.", "A central office must be selected before attaching a physical device to this cloud.");
                return;
            }
            
            
            // -----------------------------------------------------
            // FORM
            // -----------------------------------------------------
            var co = getSelectedCO();
            var physDevList = [];
            osa.ajax.list('physicalDevices', [co], function(physDevs) {
                var form = p.$FORM;
                p.show();
                
                // -------------------------------------------------
                // INPUTS
                // -------------------------------------------------
                form.addSelect("physicalDeviceKey", "cld.phys.dev", true, "", physDevs);
                form.addSelect("cloudSwitchName", "cld.cnct.cld.dev", true, "", cloudSwitchSelect);
                form.addSelect("physicalDeviceCloudAccessPortKey", "cld.accessPort", true);
		form.addSelect("physicalDeviceCloudBackbonePortKey", "cld.backbonePort", true);
                
                // tidy buttons
                $("#row_physicalDeviceCloudAccessPortKey").after(p.$BUTTONCONTAINER);
                $("#row_physicalDeviceCloudBackbonePortKey").after(p.$BUTTONCONTAINER);
                p.$BUTTONCONTAINER.addClass("clear");
                
                if (physDevs.length == 0) alert("There are no physical devices for this central office.")
                
                var physDevInput = $("#physicalDeviceKey");
                var cloudSwitchAccessPortInput = $("#physicalDeviceCloudAccessPortKey");
                var cloudSwitchBackbonePortInput = $("#physicalDeviceCloudBackbonePortKey");
 
                $("#cloudSwitchName").addRequired();
                physDevInput.addRequired();
                cloudSwitchAccessPortInput.addRequired();
		cloudSwitchBackbonePortInput.addRequired();

                // CHANGE FUNCTIONS
                physDevInput.change(function() {
                    
                    var ports = [];
                    for (var i = 0; i < physDevs.length; i++) {
                        if (physDevs[i].key == physDevInput.val()) {
                            ports = physDevs[i].portCollection;
                            break;
                        }
                    }

                    cloudSwitchAccessPortInput.populateSelect(ports, true);
                    cloudSwitchBackbonePortInput.populateSelect(ports, true);
                 });
                
                cloudSwitchAccessPortInput.change(function() {
                    var val = $(this).val();
		    $("#cloudSwitchBackbonePortInput option").removeAttr("disabled");
                     
                    var otherPortOpt = $("#cloudSwitchBackbonePortInput option[value=" + val + "]");
                    otherPortOpt.attr("disabled", "disabled");
                    
                    
                    // TODO: DO I really need this?
		    //                  for (var i = 0; i < physDevs.length; i++) {
		    //      if (physDevs[i].key == physDevInput.val()) {
                    //        for (var j = 0; j < physDevs[i].portCollection.length; j++) {
		    //           if (physDevs[i].portCollection[j].key == p.getField('physicalDeviceCloudAccessPortKey').val()) {
		    //               cloudSwitchBackbonePortInput.val(physDevs[i].portCollection[j].displayName);
		    //               break;
		    //             }
		    //         }
                    //    }
		    // }
                });
                
		//       $("#cloudSwitchBackbonePortInput").change(function() {
		//     var val = $(this).val();
                //    var cloudsCreateCoreEntry = $("#cloudsCreateCoreEntry");
                //    var cloudsCreateCoreExit  = $("#cloudsCreateCoreExit");
                    
                //    if (val == "") {
                //        cloudsCreateCoreEntry.hideRow();
                //        cloudsCreateCoreExit.hideRow();
                //        
                //        p.removeRequiredField("cloudsCreateCoreEntry");
                //        p.removeRequiredField("cloudsCreateCoreExit"); 
                //        cloudsCreateCoreExit.removeRequired();
                //        cloudsCreateCoreEntry.removeRequired();
                //    }
                //    else {
                //        $("#physicalDeviceCloudAccessPortKey option").removeAttr("disabled");
                        
			//         var otherPortOpt = $("#physicalDeviceCloudAccessPortKey option[value=" + val + "]");
			//         otherPortOpt.attr("disabled", "disabled");
			//        cloudsCreateCoreEntry.showRow();
			//       cloudsCreateCoreExit.showRow();
                        
			//       p.addRequiredField("cloudsCreateCoreEntry");
			//       p.addRequiredField("cloudsCreateCoreExit");   
			//       cloudsCreateCoreExit.addRequired();
			//       cloudsCreateCoreEntry.addRequired();
			//   }

			//   });
                

                
                p.setRequiredFields(['physicalDeviceKey', 'physicalDeviceCloudAccessPortKey', 'physicalDeviceCloudBackbonePortKey', 'cloudSwitchKey']);

                p.setSubmitAction(function(fields) {
                    fields["physicalDeviceName"] = $("#physicalDeviceKey :selected").html();
                    fields["physicalDeviceCloudAccessPortName"] = $("#physicalDeviceCloudAccessPortKey :selected").html();
                    fields["physicalDeviceCloudBackbonePortName"] = $("#physicalDeviceCloudBackbonePortKey :selected").html();
                    
                    addPhysicalConnectionBlock(fields);
                    p.hide();
                });
            });
        }
    });

    osa.page.addPageEvent("#cloudCO", 'change', function(ev) {
        if ($("#cloud-create-physicalConnection-list").children(".physicalConnection-block").size() > 0) {
            osa.ui.modalBox.warn("Removing Physical Switch Connections", "Because the central office has changed, all physical switch connections must be removed and reset.");
            $("#cloud-create-physicalConnection-list").children(".physicalConnection-block").remove();
        }
    });

    osa.page.addPageEvent('#cloud-create-cancel', 'click', function(ev) {
        if (confirm("Are you sure you would like to cancel this cloud creation? All work will be lost.")) {
            location.href="#clouds-list";
        }
    });

    $("#cloud-create-form").submit(function(ev) {
        var waitMsg = $("#waitingContainer");
        var createBtn = $("#cloud-create-create");
        
        if (getSelectedCO() == '') {
            osa.ui.modalBox.alert('No Central Office Selected', 'Please select a central office to attach this cloud to.');
            return false;
        }

        var o = {
            'authorizationURL'        : "http://" + $("#cloudAuthUrl").val() + ":" + $("#cloudAuthUrlPort").val(),
            'centralOfficeKey'        : $("#cloudCO").val(),
            'cloudHostUser'           : $("#cloudHostUser").val(),
            'cloudHostUserPassword'   : $("#cloudHostUserPw").val(),
            'cloudLocations'          : [],
            'cloudPhysicalConnections': getCollectionFromList($physicalConnectionList),
            'cloudSwitches'           : getCollectionFromList($cloudSwitchList),
            'cloudTenant'             : $("#cloudTenant").val(),
            'displayName'             : $("#cloudName").val(),
            'login'                   : $("#cloudLogin").val(),
            'password'                : $("#cloudPassword").val(),
            'virtualIPRanges'         : getCollectionFromList($viprList),
        };

        waitMsg.show();
        createBtn.attr("disabled", "disabled");
        
        // -----------------------------------------------------
        // SUBMIT
        // -----------------------------------------------------        
        osa.ajax.add("clouds", o, function(resp) {
                osa.ui.modalBox.warn("Success", $.i18n._("cld.msg.create.success"));
                location.href = "#clouds-list";
        }, function(resp) {
            waitMsg.hide();
            createBtn.removeAttr("disabled");
            osa.ui.modalBox.alert("Unable to save the cloud", resp.responseJSON && resp.responseJSON.status || "");
        });
        return false;
    });


})(osa.auth.getPageAccess('clouds'));

//}