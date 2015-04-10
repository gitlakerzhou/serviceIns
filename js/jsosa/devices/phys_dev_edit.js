// this makes a popup edit for a physical device.
// This has been moved to its own file for a few reasons, one of which is componentization
// so we can use this somewhere else dashboardy and also for readability.

// you may still notice that there is redundant code between renderCreatePhysDevice and 
// renderEditPhysDevice.  This is residual code that has not been refactored yet for cleanup.
// If you make some sort of fancy one-off case to accommodate the back end, you may need to 
// do this in two places.


function renderEditPhysDevice(data) {        
    var p = osa.ui.formPopup.create($.i18n._("dev.hdr.edt"), null, {submitLabel: $.i18n._("btn.save")});
    var totalPortsSlots = 0;

    p.addField("key", "Key", "hidden", data.key);
    p.addField("switchName", $.i18n._("dev.sw.name"), "string", data.displayName);
    p.$FIELDSET.addTextNoInput("switchType", "cmn.type", data.physicalDeviceTypeName);
    p.$FIELDSET.addTextNoInput("switch-centraloffice", "cmn.cntrl.offc", $("#physDevCO option[value='" + data.centralOfficeKey + "']").html());
    

    
    p.addField('adminLogin', $.i18n._("dev.sw.login"), "string", data.adminLogin);
    p.addField('adminPassword', $.i18n._("dev.sw.password"), "string", data.adminPassword);
    p.addField('adminIP', $.i18n._("dev.sw.ip.addr"), "string", data.adminIPAddress);
    
    p.$FIELDSET.addTextNoInput("switchLocation", "cmn.location", data.location.displayName);
    if (data.networkCloudConnection) {
        p.$FIELDSET.addTextNoInput("remoteCloud", "cmn.cloud", data.networkCloudConnection.cloudName);
        // CPETrunkVlan
        if (data.networkPhysicalConnection !== null) {
            p.$FIELDSET.addTextNoInput("cpeTrunkVlan", $.i18n._("dev.phys.cpe.trunk.vlan"), data.networkPhysicalConnection.cpeTrunkVlanValue);
        }
        // Change in 15.1.0
//        if (data.networkPhysicalConnections !== null && data.networkPhysicalConnections.length > 0) {
//            p.$FIELDSET.addTextNoInput("cpeTrunkVlan", $.i18n._("dev.phys.cpe.trunk.vlan"), data.networkPhysicalConnections[0].cpeTrunkVlanValue);
//        }
    }
    
    
    p.$FIELDSET.after('<div id="centralOfficeData" class="hide"></div>');
    
    // MULTI-CLOUD
    p.$FIELDSET.append('<div id="providerPortMsg" class="infoMsg clear" style="display: none;">' + $.i18n._("dev.prov.prt.edt.info.msg") + '</div>');
    p.addField("providerPort", $.i18n._("dev.prov.prt.name"), "select", null, null, "hide");
    p.addField("cloudsCreateCoreEntry", $.i18n._("dev.phys.dev.core.entry"), "input", null, null, "hide");
    p.addField("cloudsCreateCoreExit", $.i18n._("dev.phys.dev.core.exit"), "input", null, null, "hide");
    
    p.$FIELDSET.after("<fieldset id='slotSetsUneditable' class='popupFieldset hide'></fieldset><fieldset id='slotSets' class='popupFieldset hide'></fieldset>");
    

    p.show();
    
    var form = $("#form-adminIP").closest("form");
    form.attr("id", "physDevPopupForm");
    form.data("editData", data);
    
    var originalPorts = data.portCollection;
    var portsMap = {};
    
    for (var x in originalPorts) {
        portsMap[originalPorts[x].displayName] = originalPorts[x].key;
    }

    form.data("portsMap", portsMap);
    
    // CENTRAL OFFICE
    var coBox = $("#centralOfficeData");
    if (data.networkPhysicalConnection !== null) {
        coBox.append('<div class="header">' + $.i18n._("dev.hdr.cnct.co") + '</div><div id="srcPoint" class="srcPoint"><div id="srcEpName" class="epDevice">' + data.displayName + '</div><div class="portSlot row"><div class="portSlotSlot">Device Port: ' + data.networkPhysicalConnection.networkFacingPortName + '</div></div></div></div>');
        coBox.append('<div id="dstPoint" class="dstPoint"><div id="dstEpName" class="epDevice">' + data.networkPhysicalConnection.networkPhysicalDeviceName + '</div><div class="portSlot row"><div class="portSlotSlot">Device Port: ' + data.networkPhysicalConnection.networkPhysicalDevicePortName + '</div></div></div>');
        // Change in 15.1.0
//        coBox.append('<div class="header">' + $.i18n._("dev.hdr.cnct.co") + '</div><div id="srcPoint" class="srcPoint"><div id="srcEpName" class="epDevice">' + data.displayName + '</div><div class="portSlot row"><div class="portSlotSlot">Device Port: ' + data.networkPhysicalConnections.networkFacingPortName + '</div></div></div></div>');
//        coBox.append('<div id="dstPoint" class="dstPoint"><div id="dstEpName" class="epDevice">' + data.networkPhysicalConnections.networkPhysicalDeviceName + '</div><div class="portSlot row"><div class="portSlotSlot">Device Port: ' + data.networkPhysicalConnections.networkPhysicalDevicePortName + '</div></div></div>');
        coBox.removeClass("hide");
    }
    
    

    // MAKE DECISSIONS BASED OFF OF THE TYPE
    var typeInput = $("#form-switchType");
    var typeData = {}; 
    var providerPortSel = $("#form-providerPort");
    var providerPortMsg = $("#providerPortMsg");
    var vlanIn = $("#form-cloudsCreateCoreEntry");
    var vlanOut = $("#form-cloudsCreateCoreExit");
    var providerPortVal = "";
    var coreEntryVal = "";
    var coreExitVal = "";
    
    if (data.coreProviderPort) {
        providerPortVal = data.coreProviderPort.coreProviderPortKey;
        coreEntryVal = data.coreProviderPort.coreEntryVlanValue;
        coreExitVal = data.coreProviderPort.coreExitVlanValue;
    }
    
    
    osa.ajax.list('physicalDeviceType', function(physDevData) {
        for (var i=0; i<physDevData.length; i++) {
            typeData[physDevData[i].key] =  physDevData[i];
        }
        
        // set up type
        form.data("typeData", typeData);
        typeInput.trigger("change"); // TODO: CCR
        
        // IF A 6500: set up slots, add inputs for vlan entry and exit
        if (typeData[data.physicalDeviceTypeKey].isMultiCard) {

            // MULTI-CLOUD
            providerPortSel.populateSelect(data.portCollection, true);
            providerPortSel.showRow();
            providerPortMsg.show("slow");
            
            if (providerPortVal !== "") {
                providerPortSel.val(providerPortVal);
                vlanIn.val(coreEntryVal).showRow();
                vlanOut.val(coreExitVal).showRow();
                vlanIn.addRequired();
                vlanOut.addRequired();
            }
            
            $("#form-providerPort").change(function() {
                if ($(this).val() == "") {
                    vlanIn.val("").hideRow();
                    vlanOut.val("").hideRow();
                    vlanIn.removeRequired();
                    vlanOut.removeRequired();
                }
                else {
                    vlanIn.val("").showRow();
                    vlanOut.val("").showRow();
                    vlanIn.addRequired();
                    vlanOut.addRequired();
                }
            });
            
            
            // SLOTS
            var portList = parsePortCollection(data.portCollection);
            
            $("#slotSets").removeClass("hide");
            $("#slotSetsUneditable").addClass("hide");
            

            for (var i in portList) if (portList.hasOwnProperty(i)) {
                addSlotBlock(totalPortsSlots++, i, portList[i]);
                $("#slotName" + (totalPortsSlots-1)).change(function() {
                    editCurrentPortData($("#slotSets"), $("#form-providerPort"), form.data("portsMap"));
                });
                
                $("#portName" + (totalPortsSlots-1)).change(function() {
                    editCurrentPortData($("#slotSets"), $("#form-providerPort"), form.data("portsMap"));
                });
            }
        }
        else {
            renderUneditableSlots(typeData[data.physicalDeviceTypeKey]);
            $("#form-providerPort").parent().remove();
            vlanIn.parent().remove();
            vlanOut.parent().remove();
            providerPortMsg.hide("slow");
        }
        
        // now set up device connections if necessary
        $("#form-switchLocation").trigger("change");
    });

    

    $("#form-switchName").closest("fieldset").siblings(".button-container").addClass("clear");
    $("#slotSets").append('<input class="button btnAdd fr" id="addSlotButton" type="button" value="+ ' + $.i18n._("dev.btn.slot") + ' ">');
    
    $("#addSlotButton").click(function() {
        addSlotBlock(totalPortsSlots++);
        $("#slotName" + (totalPortsSlots-1)).change(function() {
            editCurrentPortData($("#slotSets"), $("#form-providerPort"), form.data("portsMap"));
        });
        
        $("#portName" + (totalPortsSlots-1)).change(function() {
            editCurrentPortData($("#slotSets"), $("#form-providerPort"), form.data("portsMap"));
        });
    }); 
    

    // CHANGE EVENTS
    $("#form-switchName").change(function() {
        $("#srcEpName").html($(this).val());
    });
    
    $("#providerPort").change(function() {
        
    });
    
    
    // SET UP DATA FOR EDIT
    if (data.centralOfficeKey) {
        $("#form-switch-centraloffice").trigger("change");
    }
    
    var existingp = generateExistingPortData(data.portCollection);
    var editData = $("#physDevPopupForm").data("editData");
    

    p.setSubmitAction(function(fields) {
        var networkPhysicalConnection = editData.networkPhysicalConnection;
        var networkCloudConnection = editData.networkCloudConnection;

    
        var tp = generatePortData(fields);

        var location = {
                key:  editData.centralOfficeLocationKey,
                displayName: editData.centralOfficeLocationName,
                centralOfficeKey: editData.centralOfficeKey,
                isCentralOfficeLocation: null
        };
        
        
        
        
        
        // MULTI-CLOUD
        var  coreProviderPort = null;
        var providerPortVal = providerPortSel.val();
        var providerPortStr = providerPortSel.find(":selected").html();
        
        if (providerPortVal !== "") {
            
            if (form.data("portsMap")[providerPortStr] == undefined)
                providerPortVal = null;

            coreProviderPort = {
                coreProviderPortKey  : providerPortVal,
                coreProviderPortName : $("#form-providerPort :selected").html(),
                coreEntryVlanValue   : vlanIn.val(),
                coreExitVlanValue    : vlanOut.val(),
            };
        }



        var o = {
            'key': fields['key'],
            'displayName'               : fields['switchName'],
            'adminLogin'                : fields['adminLogin'],
            'adminPassword'             : fields['adminPassword'],
            'managementPortIPAddress'   : fields['adminIP'],
            'centralOfficeKey'          : editData.centralOfficeKey,                
            'portCollection'            : comparePortData(tp, existingp),
            'physicalDeviceTypeKey'     : editData.physicalDeviceTypeKey,
            "physicalDeviceTypeName"    : editData.physicalDeviceTypeName,
            "location"                  : location,
            "networkPhysicalConnection" : networkPhysicalConnection,
            "networkCloudConnection"    : networkCloudConnection,
            "coreProviderPort"          : coreProviderPort
        };

        osa.ajax.update('physicalDevices', o, function() {
            p.hide();
            $("#physDevCO").trigger("change");
        });
        return false;
    });
        
};



// only used by edit
function generateExistingPortData(data) {
    var ports =[];
    for (var i in data) if (data.hasOwnProperty(i)) {
        ports.push({
            'key' : data[i].key,
            'displayName': data[i].displayName,
            'ipAddressCollection': []
        });
    }
    return ports;
}


function parsePortCollection(portList) {
    var slots = {};

    for (var i = 0; i < portList.length; i++) {
        slotNum = portList[i].displayName.split('.')[0];
        slots[slotNum] = (slots[slotNum]) ? (slots[slotNum] + 1) : 1;
    }

    return slots;
};