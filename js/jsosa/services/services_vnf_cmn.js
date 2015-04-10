// common change methods across edit, create, create from, etc.


// -------------------------------
// CREATING VNFs
//-------------------------------
// used when it is not a composite
function create_vnf(fields, _vnfList) {
    
    if (isVNFNameaSiteName(fields['vnf-instance-name'])) {
        alert($.i18n._("srvc.warn.name.used", fields['vnf-instance-name']));
        return false;
    }
    
    if (isVNFNameUsed(fields['vnf-instance-name'])) {
        alert($.i18n._("srvc.warn.vnf.exst", fields['vnf-instance-name']));
        return false;
    }

    for (var i = 0; i < _vnfList.length; i++) {
        if (_vnfList[i].key == fields['vnf-instance']) {
            vnfDisplayName = _vnfList[i].displayName;
            portNames = _vnfList[i].portNames;
            break;
        }
    }
    
    // need the data if it is a switch for later when we manage the links inputs
    fields["isSwitch"] = $("#vnf-instance-list").data("switchMap")[$("#vnf-instance :selected").html()];
    fields["vnfType"] = $("#vnf-instance option:selected").html();
    fields["tgtComputeNode"] = $("#vnf_target_cmpt_node option:selected").html();
    fields["vnf-optimization"] = getVNFOptObj(fields);
    fields["justCreated"] = true;
    fields["scaleAlarmProfileDTO"] = {"alarmProfileTypeKey": $("#vnf_scale_alarm_type").val(), "name" : $("#vnf_scale_alarm_type :selected").html(), "vnfInstanceKey": $("#vnf-instance option").val()};

    
    createVirtualDevice(fields["vnf-instance-name"], portNames, fields);    
}

function rebuildVNFList() {
    _vnfInstances = [];
    $("#vnf-instance-list").children(".service-device-block").each(function(el) {
        _vnfInstances.push($(this).data());
    });
    
    $("#vnf-instance-list").data("vnfInstances", _vnfInstances);
};


// used for composites and non-composites.
function getVNFOptObj(fields, epData) {
    var cloudStr = $("#vnf_target_cloud :selected").html();
    var aZoneStr = $("#vnf_a_zone :selected").html();
    var aggStr = $("#vnf_agg :selected").html();
    var compNodeStr = $("#vnf_target_cmpt_node :selected").html();
    var cloudLocationStr = $("#vnf_cloud_location :selected").html();
    var custOptId = "";
    var custOptStr = "";
    
    if (epData !== undefined) { // comes from the form
        custOptId = epData.customOptimization; // name and ID seem to be the same
        custOptStr = epData.customOptimization;
    }
    else { // for a composite, the data is not on the field but exists in a certain data object
        custOptId = fields['vnf-optimization'];
        custOptStr     = $("#vnf-optimization :selected").html();       
    }

    vnfOpt = {
          availabilityZone      : aZoneStr,
          availabilityZoneKey   : fields.vnf_a_zone,
          cloudKey              : fields.vnf_target_cloud,
          cloudName             : cloudStr,
          computeNode           : compNodeStr,
          computeNodeKey        : fields.vnf_target_cmpt_node,
          customOptimization    : custOptId,
          customOptimizationKey : custOptStr, 
          hostAggregate         : aggStr,
          hostAggregateKey      : fields.vnf_agg,
          cloudLocationKey      : fields.vnf_cloud_location,
          cloudLocationName     : cloudLocationStr
        };
    
    return vnfOpt;
}

// Used only for composites
function getVNFObj(cur, fields, epData) {
    var isSwitch1 = epData.vnfTypeBase.displayName == "SWITCH";
    var compNodeStr = $("#vnf_target_cmpt_node :selected").html();
    var vnfData = $("#vnf-instance-list").closest("form").data("vnfByName");
    vnfInstId = vnfData[epData.vnfTypeBase.displayName].key;

    var metadata = {isSwitch             : isSwitch1,
                    tgtComputeNode       : compNodeStr,
                    "vnf-instance"       : vnfInstId,
                    "vnf-instance-name"  : epData.displayName,
                    "vnf-optimization"   : getVNFOptObj(fields, epData),
                    "vnf-portNames"      : epData.vnfTypeBase.portNames,
                    vnfType              : epData.vnfTypeBase.displayName,
                    vnf_a_zone           : fields.vnf_a_zone,
                    vnf_agg              : fields.vnf_agg,
                    vnf_cloud_location   : fields.vnf_cloud_location,
                    vnf_target_cloud     : fields.vnf_target_cloud,
                    vnf_target_cmpt_node : fields.vnf_target_cmpt_node,
                    "scaleAlarmProfileDTO" : epData.scaleAlarmProfileType,
                    };
    
    // custom properties
    for (var x in fields) {
        if (x.indexOf("property-") !== -1) {
            metadata[x] = fields[x];
        }
    }
    
    return metadata;
}

// used for composites and non-composites
function isVNFNameUsed(n) {
    _vnfInstances = $("#vnf-instance-list").data("vnfInstances");
    
    if (_vnfInstances === undefined) 
        return false;
    else {
        for (var i = 0; i < _vnfInstances.length; i++) {
            if (_vnfInstances[i]['vnf-instance-name'] == n) {
                return true;
            }
        }
        return false;
    }
};

//used for composites and non-composites
function isVNFNameaSiteName(n) {
    var _siteNames = $("#service_links_container").data("SiteInstanceObjs");
    
    if (_siteNames === undefined) 
        return false;
    else {
        for (var i = 0; i < _siteNames.length; i++) {
            if (_siteNames[i]["displayName"] == n) {
                return true;
            }
        }
        return false;
    }
};

// EXPLODE COMPOSITE
function explodeComposite(comp, fields) {
    var kill = false;
    var vnfPrefix = $("#vnf-instance-name").val();
    
    // check for anything used at this point and if something is used, stop right away
    for (var i=0; i<comp.nestedVNFTypeLinks.length; i++ ) {
        var cur = comp.nestedVNFTypeLinks[i];
        var ep1 = cur.nestedVNFTypeConnector1.nestedVNFType;
        var ep2 = cur.nestedVNFTypeConnector2.nestedVNFType;
        
        if (ep1 !== null && isVNFNameUsed(vnfPrefix + "_" + ep1.displayName)) {
               kill = true;
               break;
        }
        

        if (ep2 !== null && isVNFNameUsed(vnfPrefix + "_" + ep2.displayName)) {
                kill = true;
               break;
        }
    } 
    
    if (kill) {
        alert($.i18n._("srvc.warn.comp.dupes"));
    }
    
    else {
        for (var i=0; i<comp.nestedVNFTypeLinks.length; i++ ) {
            var cur = comp.nestedVNFTypeLinks[i];
            var ep1 = cur.nestedVNFTypeConnector1.nestedVNFType;
            var ep2 = cur.nestedVNFTypeConnector2.nestedVNFType;
            
            
            if (ep1 !== null) {
                var fields1 = getVNFObj(cur, fields, ep1);    
                var saveEp1 = isVNFNameUsed(vnfPrefix + "_" + ep1.displayName);  
               
                // returned data has the property "key" instead of "alarmProfileTypeKey" and it is a bit confusing
                // because one of the alarm profile DTOs returns "key" but it means the key of the DTO, and the other
                // ones return a property of "key" but it means the key of the scale alarm
                if (fields1.scaleAlarmProfileDTO)
                    fields1.scaleAlarmProfileDTO["alarmProfileTypeKey"] = fields1.scaleAlarmProfileDTO.key;
                
                fields1["vnf-instance-name"] = vnfPrefix + "_" + ep1.displayName;
                fields1["justCreated"] = true;
                
                
                
                if (!saveEp1) createVirtualDevice(vnfPrefix + "_" + ep1.displayName, ep1.vnfTypeBase.portNames, fields1);
            }
            

            if (ep2 !== null) {
                var fields2 = getVNFObj(cur, fields, ep2);
                var saveEp2 = isVNFNameUsed(vnfPrefix + "_" + ep2.displayName);
                
                fields2["vnf-instance-name"] = vnfPrefix + "_" + ep2.displayName;
                fields2["justCreated"] = true;
                
                // returned data has the property "key" instead of "alarmProfileTypeKey" and it is a bit confusing
                // because one of the alarm profile DTOs returns "key" but it means the key of the DTO, and the other
                // ones return a property of "key" but it means the key of the scale alarm
                if (fields2.scaleAlarmProfileDTO)
                    fields2.scaleAlarmProfileDTO["alarmProfileTypeKey"] = fields2.scaleAlarmProfileDTO.key;
                
                if (!saveEp2) createVirtualDevice(vnfPrefix + "_" + ep2.displayName, ep2.vnfTypeBase.portNames, fields2);
            }
            
            // INTERCONNECT CONSTRUCTION
            // --------------------------------------------------
            // save data on link block
            // --------------------------------------------------
            if (ep1 !== null && ep2 !== null) {
                setLinkForComposite(ep1, ep2, cur, fields);
                updatePortAvailability();
            }
        } 
    }   
}

// ---------------------------------------------------------------
// COMMON CHANGE EVENTS (CE)
// ---------------------------------------------------------------
$.fn.setTgtCloudCE = function(form) {
    var cloudInput = $("#vnf_target_cloud");
    var locInput = $("#vnf_cloud_location");
    var aZoneInput = $("#vnf_a_zone");
    var agInput = $("#vnf_agg");
    var tcnInput = $("#vnf_target_cmpt_node");
    

    
    cloudInput.change(function() {
        var val = $(this).val();
        
        if (val == "") {
            locInput.empty().hideRow();
            aZoneInput.empty().hideRow();
            agInput.empty().hideRow();
            tcnInput.empty().hideRow();
        }
        else {
            aZoneInput.empty().hideRow();
            agInput.empty().hideRow();
            tcnInput.empty().hideRow();
            
            var cloudLocs = form.data("cloudListByKey")[cloudInput.val()].cloudLocations;
            locInput.populateSelect(cloudLocs, true);
            locInput.showRow();

        }
    });
};


$.fn.setTgtCldLocCE = function(form) {
    var cloudInput = $("#vnf_target_cloud");
    var locInput = $("#vnf_cloud_location");
    var aZoneInput = $("#vnf_a_zone");
    var agInput = $("#vnf_agg");
    var tcnInput = $("#vnf_target_cmpt_node");
    var aZoneData = {};
    
    locInput.change(function() {
        agInput.empty().hideRow();
        tcnInput.empty().hideRow();
        
        // if this is a SWITCH, do not show anything else.
        var type = $("#vnf-instance :selected").html() || $("#vnf_instance_type").html();
        var isSwitch = $("#vnf-instance-list").data("switchMap")[type];
        
        if (!isSwitch) {
            $.get("/osa/api/cloudAvailabilityZones/list/" + cloudInput.val() + "/" + locInput.val(), function(azData) {
                if (azData.length == 0) {
                    alert($.i18n._("srvc.msg.warn.no.a.zones"));
                    aZoneInput.empty();
                }
                else {
                    aZoneInput.populateSelect(azData, true);
                    aZoneInput.showRow();
                    
                    // for some reason, I think I need to save this?
                    for (var i=0; i<azData.length; i++) {
                        aZoneData[azData[i].key] = azData[i];
                    }
                    

                    form.data("aZoneData", aZoneData);
                }
            });
        }
    });

};

$.fn.setAvailZoneCE = function(form) {
    var aZoneInput = $("#vnf_a_zone");
    var agInput = $("#vnf_agg");
    var tcnInput = $("#vnf_target_cmpt_node");
    var agData = {};
    
    
    aZoneInput.change(function() {
        val = $(this).val();
        var aZoneData = form.data("aZoneData");
        
        if (val == "") {
            agInput.empty().hideRow();
            tcnInput.empty().hideRow();
        }
        else {
            var agSet = aZoneData[val].hostAggregateDTOCollection;
            
            agInput.populateSelect(agSet, true);
            agInput.showRow();
            
            
            // I will need this later
            for (var i=0; i<agSet.length; i++) {
                agData[agSet[i].key] = agSet[i];
            }
            
            // need for later
            form.data("agData", agData);
        }
    });
};


$.fn.setAggregateCE = function(form) {
    var agInput = $("#vnf_agg");
    var tcnInput = $("#vnf_target_cmpt_node");
   
    
    agInput.change(function() {
        val = $(this).val();
        var agData = form.data("agData");
        
        if (val == "") {
            tcnInput.empty().hideRow();
        }
        else {
            if (val == "") {
                agInput.empty().hideRow();
                tcnInput.empty().hideRow();
            }
            else {
                 var tcnSet = agData[val].computeNodeDTOCollection;
                 tcnInput.populateSelect(tcnSet, true);
                 tcnInput.showRow();
            }
        }
        
    });
};