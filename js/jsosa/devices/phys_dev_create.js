// this makes a popup create for a physical device.
// This has been moved to its own file for a few reasons, one of which is componentization
// so we can use this somewhere else dashboardy and also for readability.

// you may still notice that there is redundant code between renderCreatePhysDevice and 
// renderEditPhysDevice.  This is residual code that has not been refactored yet for cleanup.
// If you make some sort of fancy one-off case to accommodate the back end, you may need to 
// do this in two places.


function renderCreatePhysDevice(isWriteAccess) {
    var coList = $("#physDevList").data("coList");
    var totalPortsSlots = 1;
    var p = osa.ui.formPopup.create($.i18n._("dev.hdr.crt"), null, {submitLabel: $.i18n._("btn.save")});

    
    if (coList === undefined)
        alert($.i18n._("dev.warn.need.co"));
    
    else {
        var coMap = coList.map(function(e) {
            return {key:e.key, value:e.displayName};
        });


        p.addField("switchName", $.i18n._("dev.sw.name"), "string");
        p.addField('switch-centraloffice', $.i18n._("cmn.cntrl.offc"), 'select', coMap);
        p.addField('switchType', $.i18n._("cmn.type"), 'select');
        


        
        
        p.addField('adminLogin', $.i18n._("dev.sw.login"), "string");
        p.addField('adminPassword', $.i18n._("dev.sw.password"), "string");
        p.addField('adminIP', $.i18n._("dev.sw.ip.addr"), "string");
        
        p.addField('switchLocation', $.i18n._("cmn.location"), 'select');
        p.addField('remoteCloud', $.i18n._("cmn.cloud"), 'select');
        p.hideField("switchLocation");
        p.hideField("remoteCloud");
        
        p.addField("cpeTrunkVlan", $.i18n._("dev.phys.cpe.trunk.vlan"), "input", null, null, "hide");
        
        p.setRequiredFields(['switchName', 'switchType', 'switch-centraloffice']);


        
        // MULTI-CLOUD
        p.$FIELDSET.append('<div id="providerPortMsg" class="infoMsg clear" style="display: none;">' + $.i18n._("dev.prov.prt.info.msg") + '</div>');
        p.addField("providerPort", $.i18n._("dev.prov.prt.name"), "select", null, null, "hide");
        p.addField("cloudsCreateCoreEntry", $.i18n._("dev.phys.dev.core.entry"), "input", null, null, "hide");
        p.addField("cloudsCreateCoreExit", $.i18n._("dev.phys.dev.core.exit"), "input", null, null, "hide");
        
        p.$FIELDSET.after('<div class="header coBox hide">' + $.i18n._("dev.hdr.cnct.co") + '</div><div id="srcPoint" class="srcPoint coBox hide"></div><div id="dstPoint" class="dstPoint coBox hide"></div>');
        p.$FIELDSET.after("<fieldset id='slotSetsUneditable' class='popupFieldset hide'></fieldset><fieldset id='slotSets' class='popupFieldset hide'></fieldset>");
        

        
        p.setSubmitAction(function(fields) {

            var nwPhysConnection = {
                    networkPhysicalDeviceKey : fields.dst_device,
                    networkPhysicalDevicePortKey : fields.dst_port,
                    networkPhysicalDeviceName : $("#dst_device :selected").html(),
                    networkPhysicalDevicePortName : $("#dst_port :selected").html(),
                    networkFacingPortName : fields.src_bw_from,
                    networkFacingPortKey: null,
                    cpeTrunkVlanValue : fields.cpeTrunkVlan

            };
            
            var nwCloudConnection = {
                    key : "",
                    cloudKey : fields.remoteCloud,
                    cloudName : $("#form-remoteCloud :selected").html(),
                    networkFacingPortName : fields.src_bw_from,
                    networkFacingPortKey: null

            };
            
            var location = {
                key:  fields['switchLocation'],
                displayName: $("form-switchLocation :selected").html(),
                centralOfficeKey: fields['switch-centraloffice'],
                isCentralOfficeLocation: null    
            };
            
            var  coreProviderPort = null;
            
            if(providerPort.val() !== "") {
                coreProviderPort = {
                        coreProviderPortKey  : "",
                        coreProviderPortName : $("#form-providerPort :selected").html(),
                        coreEntryVlanValue   : vlanIn.val(),
                        coreExitVlanValue    : vlanOut.val(),
                   };                
            }


            
            var o = {
                "key"                       : fields["key"],
                "displayName"               : fields["switchName"],
                "centralOfficeKey"          : fields["switch-centraloffice"],
                "adminLogin"                : fields["adminLogin"],
                "adminPassword"             : fields["adminPassword"],
                "managementPortIPAddress"   : fields["adminIP"],
                "portCollection"            : generatePortData(fields),
                "physicalDeviceTypeKey"     : fields["switchType"],
                "physicalDeviceTypeName"    : $("#form-switchType :selected").html(),
                "location"                  : location,
                "networkPhysicalConnection" : nwPhysConnection,
                "networkCloudConnection"    : nwCloudConnection,
                "coreProviderPort"          : coreProviderPort,
            };

            osa.ajax.add("physicalDevices", o, function() {
                p.hide();
                getDeviceData($("#physDevCO").val(), isWriteAccess);
            });
        });

        p.show();
        
        // POPULATE THE TYPE FIELD
        var typeInput = $("#form-switchType");
        var typeData = {};
        var form = typeInput.closest("form").attr("id", "physDevPopupForm");
        
        form.find(".button-container").addClass("clear");
        
        typeInput.prepSel(true, false);
        osa.ajax.list('physicalDeviceType', function(data) {
            for (var i=0; i<data.length; i++) {
                typeInput.append("<option value='" + data[i].key + "'>"  + data[i].displayName + "</option>");
                typeData[data[i].key] =  data[i];
            }
            form.data("typeData", typeData);
        });
        
        // POPULATE THE ENDPOINTS
        var srcPntCont = $("#srcPoint");
        srcPntCont.addTextNoInput("src_port", "srvc.device", $("#form-switchLocation :selected").html());
        srcPntCont.addSelect("src_bw_from", "srvc.dvc.prt", true, false);
        
        var dstPntCont = $("#dstPoint");
        dstPntCont.addSelect("dst_device", "srvc.device", true, false);
        dstPntCont.addSelect("dst_port", "srvc.dvc.prt", true, false);
        
        // CHANGE EVENTS
        $("#form-switchName").change(function() {
            $("#src_port").html($(this).val());
        });
        
        typeInput.change(function() {
            var data = $("#physDevPopupForm").data("typeData")[typeInput.val()];
            var isMultiCard = data.isMultiCard;
            
            $("#addSlotButton").siblings().remove();
            
            // 6500 case - will have user defined slots and ports as well as core entry and core exit VLAN
            if (isMultiCard) {
                $("#slotSets").removeClass("hide");
                $("#addSlotButton").show(); // for some reason this gets a display=none
                $("#slotSetsUneditable").addClass("hide");
                addSlotBlock(0);
                $("#slotName0").change(function() {
                    setCurrentPortData($("#slotSets"), $("#form-providerPort"));
                });
                
                $("#portName0").change(function() {
                    setCurrentPortData($("#slotSets"), $("#form-providerPort"));
                });
                
                // Multi-cloud
                $("#providerPortMsg").show("slow");
                $("#form-providerPort").showRow();
            }
            else {
                renderUneditableSlots(data);
                
                // No multi-cloud
                $("#form-providerPort").parent().addClass("hide");
                $("#providerPortMsg").hide("slow");
            }
            
            var locInput = $("#form-switchLocation");
            var coInput = $("#form-switch-centraloffice");
            if (coInput.val() !== "" && locInput.not(":visible")) {
                coInput.trigger("change");
            }
            
            
            // if it is a 65, make the cloud field required.
            if (data.modelNumber == "65") {
                $("#form-remoteCloud").data({"required": true}).addRequired();
                $("#form-switch-centraloffice").data({"required": true}).addRequired();
                $("#form-switchLocation").data({"required": true}).addRequired();
            }
            else {
                $("#form-remoteCloud").removeData("required").removeRequired();
                $("#form-switch-centraloffice").removeData("required").removeRequired();
                $("#form-switchLocation").removeData("required").removeRequired();
            }
        });
        
        var vlanIn  = $("#form-cloudsCreateCoreEntry");
        var vlanOut = $("#form-cloudsCreateCoreExit");
        var providerPort = $("#form-providerPort");
        
        providerPort.change(function() {
            if ($(this).val() == "") {
                vlanIn.parent().addClass("hide");
                vlanOut.parent().addClass("hide");
                vlanIn.removeData("required").removeRequired();
                vlanOut.removeData("required").removeRequired();
            }
            else {
                vlanIn.parent().removeClass("hide");
                vlanOut.parent().removeClass("hide");
                vlanIn.data({"required": true}).addRequired();
                vlanOut.data({"required": true}).addRequired();   
            }

        });
        
        $("#form-switch-centraloffice").change(function() {
            var coData = $("#physDevList").data("coData");
            var locList = coData[$("#form-switch-centraloffice").val()].locationCollection;
            var input = $("#form-switchLocation");
            var remoteCloudInput = $("#form-remoteCloud");
            var cpeTrunkVlanInput = $("#form-cpeTrunkVlan");
            
            // only get a device family of a device type is actually selected (first part before &&)
            var deviceFamily = $("#form-switchType").val() && $("#physDevPopupForm").data("typeData")[$("#form-switchType").val()].deviceFamily;
            
            // always clean up when there is a change            
            $("#form-switchLocation").val("").hideRow();
            remoteCloudInput.val("").hideRow();
            cpeTrunkVlanInput.hideRow();
            
            $(".coBox select").val("");
            $(".coBox").addClass("hide");
            
            // now deal with the click
            if ($("#form-switchType").val() !== "") { // need the type for the location data change
                if (deviceFamily == "6500") {
                    input.hideRow();
                }
                else {
                    input.prepSel(true, true);
                    
                    for (var i=0; i<locList.length; i++) {
                        if (deviceFamily != "65")
                            input.append("<option value='" + locList[i].key + "'>"  + locList[i].displayName + "</option>");
                        else {// if family is 65 then only print remote location
                            if (!locList[i].isCentralOfficeLocation)
                                input.append("<option value='" + locList[i].key + "'>"  + locList[i].displayName + "</option>");
                        }
                    }
                    // populate the clouds in case this is remote
                    osa.ajax.list('clouds', [$(this).val()], function(cloudList) {
                        remoteCloudInput. populateSelect(cloudList, true);
                    });
                }
            }
        });
        
        
        $("#form-switchLocation").change(function() {
            var coData = $("#physDevList").data("coData");
            var data = coData[$("#form-switch-centraloffice").val()];
            var isCentralOfficeLocation = true;
            var deviceData = $("#physDevPopupForm").data("typeData")[$("#form-switchType").val()];
            var maxPorts = deviceData.maxPorts;
            var maxSlots = deviceData.maxSlots;
            var deviceTypeHasComputeNode = $("#physDevPopupForm").data("typeData")[$("#form-switchType").val()].hasComputeNode;

            
            
            // determine if it is a central office
            var loc = $("#form-switchLocation").val();
            
            for (var i=0; i<data.locationCollection.length; i++) {
                if (data.locationCollection[i].key == loc) {
                    isCentralOfficeLocation = data.locationCollection[i].isCentralOfficeLocation;
                    break;
                }
            }
            
            // CLOUD input
            //if (isCentralOfficeLocation || !deviceTypeHasComputeNode) { // TODO: remove for this release
            console.log("isCentralOfficeLocation = " + isCentralOfficeLocation);
            if (isCentralOfficeLocation) {
                $("#form-remoteCloud").val("").hideRow();
                $("#form-cpeTrunkVlan").hideRow();
            }
                
            else {
                $("#form-remoteCloud").showRow();
                if (deviceTypeHasComputeNode) {
                    // CPETrunkVlan only needed for 65vSE
                    $("#form-cpeTrunkVlan").showRow();
                }
            }
            
            // PORTS input - Deal with bottom section of ports for remote only
            if (!isCentralOfficeLocation) {
                $("#src_port").html($("#form-switchName").val());
                $(".coBox").removeClass("hide");   
                
                var portList = [];
                var target = $("#src_bw_from");
                target.empty().append("<option value=''></option>");
                for (var i=1; i<=maxSlots; i++) {
                    for (var j=1; j<=maxPorts; j++) {
                        var prettyStr = i + "." + j;
                        portList.push(prettyStr);
                        target.append("<option value='" + prettyStr + "'>"  + prettyStr + "</option>");
                    }
                }
                
                $.get( "/osa/api/tenants/get/", function( data ) {
                    var tenantId = data.key;
                    var tenantsInput = $("#physDevPopupForm");
                    osa.ajax.list('physicalDevices', [$("#form-switch-centraloffice").val(), $("#physDevPopupForm").data("mainLocation"), tenantId], function(physList) {
                        
                        if (physList.length == 0) {
                            alert($.i18n._("dev.warn.no.devs"));
                        }
                        else {
                            var physDevs = {};
                            var dstDevPhys = $("#dst_device");
                            
                            dstDevPhys.prepSel(true);
                            
                            for (var i = 0; i < physList.length; i++) {
                                dstDevPhys.append($("<option></option>", {value : physList[i].key, html : physList[i].displayName}));
                                physDevs[ physList[i].key] =  physList[i];
                            }
                            $("#physDevPopupForm").data("physDevs", physDevs);
                        }
                   });
                });
            }
            else {
                $("#src_port").html("");
                $(".coBox").addClass("hide");  
            }

            
        });
        
        $("#dst_device").change(function() {
            var curPhysDev = $("#physDevPopupForm").data("physDevs")[$("#dst_device").val()];
            var input = $("#dst_port");
            
            input.prepSel(true);
            for (var i=0; i<curPhysDev.portCollection.length; i++) {
                input.append("<option value='" + curPhysDev.portCollection[i].key + "'>"  + curPhysDev.portCollection[i].displayName + "</option>"); 
            }
        });
        
        
        // SLOTS
        $("#slotSets").append('<input class="button btnAdd fr" id="addSlotButton" type="button" value="+ ' + $.i18n._("dev.btn.slot") + ' ">');
        
        $("#addSlotButton").click(function() {
            addSlotBlock(totalPortsSlots++);
            $("#slotName" + (totalPortsSlots-1)).change(function() {
                setCurrentPortData($("#slotSets"), $("#form-providerPort"));
            });
            
            $("#portName" + (totalPortsSlots-1)).change(function() {
                setCurrentPortData($("#slotSets"), $("#form-providerPort"));
            });            
            
        });    
    }
}