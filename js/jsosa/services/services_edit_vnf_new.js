function showEditNewVNF(data) {
    var p = osa.ui.formPopup.create($.i18n._("srvc.hvr.edtVNF"), null, {submitLabel: $.i18n._("btn.update")});
    var form = p.$FORM;
    var isSwitch = $("#vnf-instance-list").data("switchMap")[data.vnfType];
    var lastParam = "row_vnf_target_cmpt_node";  // just to work around old architecture for now.
    
    p.$CONTAINER.appendTo('body').hide();
    
    var vnfDataSet = $("#vnf-instance-list").closest("form").data("vnfByName");
    var vnfObjData = vnfDataSet[data.vnfType];
    var customOpts = vnfObjData.availableCustomOptimizations;
    var vnfOpts = data["vnf-optimization"];
    
    // -----------------------------------------------------------------
    // RENDER FORM
    // -----------------------------------------------------------------
    form.addTextNoInput("vnf_instance_name", "srvc.name", data["vnf-instance-name"]);
    form.addTextNoInput("vnf_instance_type", "srvc.type", data.vnfType);  
    
    form.addSelect("vnf_instance_cust_opts", "srvc.opt.flvr");
    var custOptsSel = $("#vnf_instance_cust_opts");
    
    for (var i=0; i<customOpts.length; i++) {
        custOptsSel.append("<option value='" + i + "'>" +  customOpts[i] + "</option>");
        
        if (customOpts[i] == data['vnf-optimization'].customOptimization)
            custOptsSel.val(i);
    }
    

    // --------------------
    // SCALE ALARM TYPES
    // --------------------
    form.addSelect("vnf_scale_alarm_type", "srvc.alarm.type");
    var optScaleProfInput = $("#vnf_scale_alarm_type");
    var scaleAlarmTypes = vnfObjData.scaleAlarmTypes;
    
    optScaleProfInput.prepSel(true);
    for (var i=0; i<scaleAlarmTypes.length; i++) {
        optScaleProfInput.append("<option value='" + scaleAlarmTypes[i].key + "'>" + scaleAlarmTypes[i].name + "</option>");
    } 
    if (data.scaleAlarmProfileDTO)
        optScaleProfInput.val(data.scaleAlarmProfileDTO.alarmProfileTypeKey);
    
    if (scaleAlarmTypes.length > 0) optScaleProfInput.showRow();
    else optScaleProfInput.hideRow();
    
    // id, label, firstEmpty, req, opts, dflt, cls, hlp
    form.addSelect("vnf_target_cloud", "srvc.tgt.cld");
    form.addSelect("vnf_cloud_location", "srvc.cld.loc", true, false, [], null, "hide");
    
    if (!isSwitch) {
        
        form.addSelect("vnf_a_zone", "srvc.a.zone", true, false, [], null, "hide");
        form.addSelect("vnf_agg", "srvc.aggregate", true, false, [], null, "hide"); // aggregate
        form.addSelect("vnf_target_cmpt_node", "srvc.tgt.cmpt.nd", true, false, [], null, "hide");
    }
    else {
        lastParam = "row_vnf_cloud_location";
    }

    
    // now that all of the fields are populated, we need to see how far we fill them out.
    // at the very least, the clouds select should be populated.
    
    //------------
    // CLOUDS
    //------------
    var mainForm = $("#service_links_container").closest("form");
    var cloudList = mainForm.data("cloudList");

    var agList  = {};
    var tcnData = {};
    var vnfOpt  = data["vnf-optimization"];
    var cloudId = vnfOpts.cloudKey;
    var locId   = vnfOpts.cloudLocationKey;
    var aZoneId = vnfOpt.availabilityZoneKey;
    var agId    = vnfOpt.hostAggregateKey;
    var tcnId   = vnfOpt.computeNodeKey;
 
    
    var cloudInput = $("#vnf_target_cloud");
    var locInput = $("#vnf_cloud_location");
    var aZoneInput = $("#vnf_a_zone");
    var agInput = $("#vnf_agg");
    var tcnInput = $("#vnf_target_cmpt_node");
    
    var aZoneData = {};
    var agData = {};
    
    // ---------------------------------------------------------------
    // CHANGE FUNCTIONS
    // ---------------------------------------------------------------
    // we do not want to load the change functions while we are pre-populating 
    // the form or the events will fire while pre-populating the form. 
    var changeFunctions = function() {
        var tgtCloudInput = $("#vnf_target_cloud");
        var cldLocInput   = $("#vnf_cloud_location");
        var aZoneInput    = $("#vnf_a_zone");
        var aggInput      = $("#vnf_agg");
        
        tgtCloudInput.setTgtCloudCE(mainForm);
        cldLocInput.setTgtCldLocCE(form);
        aZoneInput.setAvailZoneCE(form);
        aggInput.setAggregateCE(form);
    };
    
    // alphabetize
    cloudList.sort(function (a, b) {
        if (a.displayName > b.displayName) return 1;
        else if (a.displayName == b.displayName) return 0;
        else return -1;
    });
    
    // load the options
    cloudInput.populateSelect(cloudList, true, cloudId);
    
    if (cloudId == null) {
        // do not populate anything else or show anything else.
        changeFunctions();
    }
    else { // a CLOUD had been selected
        // show the cloud LOCATION select
        if (cloudId !== "")  {
            var cloudLocs = mainForm.data("cloudListByKey")[cloudId].cloudLocations;
            locInput.populateSelect(cloudLocs, true, locId);
            locInput.showRow();    
        }

        
        if (locId == undefined || locId == null || locId == "") {
            // do not populate anything else or show anything else.
            changeFunctions();
        }
        else {// a cloud LOCATION had been selected
            // show the AVAILABILITY ZONE select
            $.get("/osa/api/cloudAvailabilityZones/list/" + cloudId + "/" + locId, function(azData) {
                if (azData.length == 0) {
                    if (!isSwitch)
                        alert($.i18n._("srvc.msg.warn.no.a.zones"));
                }
                else {
                    aZoneInput.populateSelect(azData, true, aZoneId);
                    
                    for (var i=0; i<azData.length; i++) {
                        aZoneData[azData[i].key] = azData[i];
                    }
                    

                    aZoneInput.showRow();
                    form.data("aZoneData", aZoneData);
                    
                    if (aZoneId == null || aZoneId == "") {
                        // do not populate anything else or show anything else.
                        changeFunctions();
                    }
                    else {// an AVAILABILITY ZONE had been selected
                        // show the AGGREGATE select
                        var agSet = aZoneData[aZoneId].hostAggregateDTOCollection;
  
                        agInput.populateSelect(agSet, true, agId);
                        agInput.showRow();
                        
                        
                        // I will need this later
                        for (var i=0; i<agSet.length; i++) {
                            agData[agSet[i].key] = agSet[i];
                        }
                        
                        // need for later
                        form.data("agData", agData);

                         if (agId == null || agId == "") {
                         // do not populate anything else or show anything else.
                             changeFunctions();
                         }
                         else {// an AGGREGATE had been selected
                            // show the TCN select
                             var tcnSet = agData[agId].computeNodeDTOCollection;

                             
                             tcnInput.populateSelect(tcnSet, true, tcnId);
                             tcnInput.showRow();
                             changeFunctions();
                         }
                        
                        
                    }
                    
                }
                
            });
            
        }
    }    
    
    
//    form.addTextNoInput("vnf_instance_tgt_cloud", "srvc.tgt.cld",    data["vnf-optimization"].cloudName);
//    form.addTextNoInput("vnf_instance_tgt_co",    "srvc.loc",        data["vnf-optimization"].cloudLocationName);
//    form.addTextNoInput("vnf_instance_a_zone",    "srvc.a.zone",     data["vnf-optimization"].availabilityZone);
//    form.addTextNoInput("vnf_instance_host_agg",  "srvc.aggregate",  data["vnf-optimization"].hostAggregate);



    
    // -----------------------------------------------------------------
    // GET DATA FOR TARGET COMPUTE NODE
    // -----------------------------------------------------------------
    if (locId !== undefined && locId !== null && locId !== "") {
        $.get("/osa/api/cloudAvailabilityZones/list/" + cloudId + "/" + locId, function(azData) {
            
            for (var k=0; k < azData.length; k++) {
                if (azData[k].key == aZoneId) {
                    agList = azData[k].hostAggregateDTOCollection;

                    for (var l=0; l<agList.length; l++) {
                        if (agList[l].key == agId) {
                            
                            tcnData = agList[l].computeNodeDTOCollection;
                            tcnInput.populateSelect(tcnData, true, tcnId);
                        }
                        break;
                    } 
                    break;
                }
            }
        });
    }

    
    // --------------------------------------------------------------------
    // Make the custom opts show up.
    // --------------------------------------------------------------------   
    var propList = vnfDataSet[data.vnfType].vnfTypeProperties;
    
    for (var pr=0; pr < propList.length; pr++) {
        var prop = propList[pr];

        if (prop.exposed) {
            var propName = "property-" + propList[pr].key;
            
            var propVal = $("#so-device--" + data["vnf-instance-name"]).data(propName);
            
            form.addTextNoInput(propName, prop.propertyName, propVal);
            $(propName).addClass("customProperty");
            lastParam = "row_" + propName;
        }
    }
    
    // tidy buttons
    $("#" + lastParam).after(p.$BUTTONCONTAINER);
    
    p.reveal();
    
    
    // --------------------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------------------  
    var targetDiv = $("#so-device--" + $("#vnf_instance_name").html().split(" ").join("-"));
    
    p.setSubmitAction(function(fields) {
        var targetObj                   = targetDiv.data("vnf-optimization");
        var targetDivData               = targetDiv.data();
        targetObj.customOptimization    = $("#vnf_instance_cust_opts :selected").html();
        targetObj.customOptimizationKey = $("#vnf_instance_cust_opts").val();
        targetObj.cloudName             = $("#vnf_target_cloud :selected").html();
        targetObj.cloudKey              = $("#vnf_target_cloud").val();
        targetObj.cloudLocationName     = $("#vnf_cloud_location :selected").html();
        targetObj.cloudLocationKey      = $("#vnf_cloud_location").val();
        
        if (!isSwitch) {
            targetObj.availabilityZone      = $("#vnf_a_zone :selected").html();
            targetObj.availabilityZoneKey   = $("#vnf_a_zone").val();
            targetObj.hostAggregate         = $("#vnf_agg :selected").html();
            targetObj.hostAggregateKey      = $("#vnf_agg").val();       
            targetObj.computeNode           = $("#vnf_target_cmpt_node :selected").html();
            targetObj.computeNodeKey        = $("#vnf_target_cmpt_node").val();   
        }

        
        // SCALE ALARM PROFILES
        var scaleAlarmProfInput = $("#vnf_scale_alarm_type");
        var scaleAlarmProfileKey = scaleAlarmProfInput.val();
        var scaleAlarmProfileName = $("#vnf_scale_alarm_type :selected").html();
        if (scaleAlarmProfInput.is(":visible")) {
            if (!targetDiv.data("scaleAlarmProfileDTO"))
                targetDiv.data("scaleAlarmProfileDTO", {});
            
            targetDivData.scaleAlarmProfileDTO.alarmProfileTypeKey  = scaleAlarmProfileKey;
            targetDivData.scaleAlarmProfileDTO.name  = scaleAlarmProfileName;
        }
        
        
        // Update the links below
        var curVnf = targetDivData["vnf-instance-name"];
        
        
        // Edit gets fun now because we have to update the original way of doing things
        // where the links hold the data that is submitted as well as the data used to
        // generate the diagram. Alas.
        $("#service_links_container").find(".so-link-block").each(function(i, el) {
            var linkData = $(el).data();
            // SRC
            if (curVnf == linkData["src-dev"]) {
                var sapDto = linkData["src-metadata"].scaleAlarmProfileDTO;
                if (!sapDto) sapDto = linkData["src-metadata"]["scaleAlarmProfileDTO"] = {"alarmProfileTypeKey" : "", "name" : ""};
                
                
                sapDto.alarmProfileTypeKey = scaleAlarmProfileKey;
                sapDto.name = scaleAlarmProfileName;
                
                var vnfOpt = linkData["src-metadata"]["vnf-optimization"];
                var cldLocStr = $("#vnf_cloud_location :selected").html();
                
                vnfOpt.availabilityZone = $("#vnf_a_zone :selected").html();
                vnfOpt.availabilityZoneKey = fields.vnf_a_zone;
                vnfOpt.cloudKey = fields.vnf_target_cloud;
                vnfOpt.cloudName = $("#vnf_target_cloud :selected").html();
                vnfOpt.cloudLocationKey = fields.vnf_cloud_location;
                vnfOpt.cloudLocationName = cldLocStr;
                vnfOpt.computeNode = $("#vnf_target_cmpt_node :selected").html();
                vnfOpt.computeNodeKey = fields.vnf_target_cmpt_node;
                vnfOpt.customOptimization = $("#vnf_instance_cust_opts :selected").html();
                vnfOpt.customOptimizationKey = fields.vnf_instance_cust_opts;
                vnfOpt.hostAggregate = $("#vnf_agg :selected").html();
                vnfOpt.hostAggregateKey = fields.vnf_agg;
            }
            // DST
            if (curVnf == linkData["dst-dev"]) {
                var sapDto = linkData["dst-metadata"].scaleAlarmProfileDTO;
                if (!sapDto) sapDto = linkData["dst-metadata"]["scaleAlarmProfileDTO"] = {"alarmProfileTypeKey" : "", "name" : ""};
                
                sapDto.alarmProfileTypeKey = scaleAlarmProfileKey;
                sapDto.name = scaleAlarmProfileName;
                
                var vnfOpt = linkData["dst-metadata"]["vnf-optimization"];
                var cldLocStr = $("#vnf_cloud_location :selected").html();
                
                vnfOpt.availabilityZone = $("#vnf_a_zone :selected").html();
                vnfOpt.availabilityZoneKey = fields.vnf_a_zone;
                vnfOpt.cloudKey = fields.vnf_target_cloud;
                vnfOpt.cloudName = $("#vnf_target_cloud :selected").html();
                vnfOpt.cloudLocationKey = fields.vnf_cloud_location;
                vnfOpt.cloudLocationName = cldLocStr;
                vnfOpt.computeNode = $("#vnf_target_cmpt_node :selected").html();
                vnfOpt.computeNodeKey = fields.vnf_target_cmpt_node;
                vnfOpt.customOptimization = $("#vnf_instance_cust_opts :selected").html();
                vnfOpt.customOptimizationKey = fields.vnf_instance_cust_opts;
                vnfOpt.hostAggregate = $("#vnf_agg :selected").html();
                vnfOpt.hostAggregateKey = fields.vnf_agg;
            }
        });
        
    });
}