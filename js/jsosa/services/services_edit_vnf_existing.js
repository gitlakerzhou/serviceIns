function showEditExistingVNF(data) {
    var p = osa.ui.formPopup.create($.i18n._("srvc.hvr.edtVNF"), null, {submitLabel: $.i18n._("btn.update")});
    var form = p.$FORM;
        
    p.$CONTAINER.appendTo('body').hide();
    
    // If this is a switch, you are not allowed to edit anything.
    var isSwitch = data.isSwitch;
    var vnfDataSet = $("#vnf-instance-list").closest("form").data("vnfByName");
    var vnfObjData = vnfDataSet[data.vnfType];
    var customOpts = vnfObjData.availableCustomOptimizations;
    
    // -----------------------------------------------------------------
    // RENDER FORM
    // -----------------------------------------------------------------
    
    form.addTextNoInput("vnf_instance_name", "srvc.name", data["vnf-instance-name"]);
    form.addTextNoInput("vnf_instance_type", "srvc.type", data.vnfType);     
    if (data.scaleAlarmProfileDTO)
        form.addTextNoInput("vnf_scale_alarm_type", "srvc.alarm.type", data.scaleAlarmProfileDTO.name); 

    
    if (isSwitch) {
        form.addTextNoInput("vnf_instance_cust_opts", "srvc.opt.flvr", data['vnf-optimization'].customOptimization);
    }
    else {
        form.addSelect("vnf_instance_cust_opts", "srvc.opt.flvr");
        var custOptsSel = $("#vnf_instance_cust_opts");
        
        for (var i=0; i<customOpts.length; i++) {
            custOptsSel.append("<option value='" + i + "'>" +  customOpts[i] + "</option>");
            
            if (customOpts[i] == data['vnf-optimization'].customOptimization)
                custOptsSel.val(i);
        }
    }


    
    form.addTextNoInput("vnf_instance_tgt_cloud", "srvc.tgt.cld",    data["vnf-optimization"].cloudName);
    form.addTextNoInput("vnf_instance_tgt_co",    "srvc.loc",        data["vnf-optimization"].cloudLocationName);
    
    // -----------------------------------------------------------------
    // SWITCH CASE
    // -----------------------------------------------------------------
    if (isSwitch) {
         $("#row_vnf_instance_tgt_co").after(p.$BUTTONCONTAINER);
         p.$BUTTONCONTAINER.find(".btnSave").remove();
    }
    
    // -----------------------------------------------------------------
    // VNF CASE
    // -----------------------------------------------------------------
    else {
        
        form.addTextNoInput("vnf_instance_a_zone",    "srvc.a.zone",     data["vnf-optimization"].availabilityZone);
        
        form.append('<div id="noAggregateInfo" class="clear mainInfo hide">' + $.i18n._("srvc.msg.info.no.agg") + '</div>');
        form.addSelect("vnf_instance_host_agg", "srvc.aggregate");
        form.addSelect("vnf_target_cmpt_node", "srvc.tgt.cmpt.nd");
        
        var vnfOpt  = data["vnf-optimization"];
        
        var agList  = {};
        var agId    = vnfOpt.hostAggregateKey;
        var agInput = $("#vnf_instance_host_agg");
        var agMap   = {};
        
        var tcnData = {};
        var tcnId   = vnfOpt.computeNodeKey;
        var tcnName = vnfOpt.computeNode;
        var tcnInput = $("#vnf_target_cmpt_node");


        var locId   = vnfOpt.cloudLocationKey;
        var cloudId = vnfOpt.cloudKey;
        var aZoneId = vnfOpt.availabilityZoneKey;

        
        if (tcnId == null) alert($.i18n._("srvc.msg.warn.no.tcn.id"));
        
        // -----------------------------------------------------------------
        // GET DATA FOR TARGET COMPUTE NODE
        // -----------------------------------------------------------------
        
        if (locId == null) alert($.i18n._("srvc.msg.warn.no.loc.id"));
        else {
            $.get("/osa/api/cloudAvailabilityZones/list/" + cloudId + "/" + locId, function(azData) {
                
                for (var k=0; k < azData.length; k++) {
                    if (azData[k].key == aZoneId) {
                        agList = azData[k].hostAggregateDTOCollection;
                        
                        
                        // ---------------------------------------------------------------------------------------
                        // We have two cases:
                        // ---------------------------------------------------------------------------------------                
                        // a) No aggregate was chosen during create, but OpenStack picked a TCN
                        // b) An aggregate was chosen on create and the user/OpenStack picked the TCN
                        //
                        // In the case of no aggregate value returned (a), the aggregate list can be populated
                        // but the subset of the selected aggregate value is impossible to know. In this case, 
                        // a special tcn select is created with one element selected, and that element is the
                        // value for the tcn that already exists in the system.
                        // Because this is possibly confusing to our user, an informational note will be provided.
                        //
                        // In the case of everything already defined, the two selects will be populated logically
                        // with the returned values as the selected options.
                        // ---------------------------------------------------------------------------------------
                        
                        
                        // need this map to operate the drop downs later
                        for (var l=0; l<agList.length; l++) {
                            agMap[agList[l].key] = agList[l];
                        }
                        
                        
                        if (agId == null) {
                            noAggregate();
                        }
                        
                        else {
                            $("#noAggregateInfo").addClass("hide");
                            for (var l=0; l<agList.length; l++) {
                                if (agList[l].key == agId) {
                                    agInput.populateSelect(agList, true, agId);
                                    
                                    tcnData = agList[l].computeNodeDTOCollection;
                                    tcnInput.populateSelect(tcnData, true, tcnId);
                                    tcnInput.showRow();
                                    break;
                                }
                            } 
                        }


                        
                        agInput.change(function() {
                            // if the user selects the blank, then do this
                            if (agInput.val() == "" && vnfOpt.hostAggregateKey == null) {
                                noAggregate();
                            }
                            else if (agInput.val() == ""){
                                tcnInput.empty().hideRow();
                            }
                            
                            else {
                                var compSet = agMap[agInput.val()].computeNodeDTOCollection;
                                
                                tcnInput.populateSelect(compSet, true);
                                tcnInput.showRow();
                            }
                            

                        });
                        break;
                    }
                }
            });
        }

        
        
        var noAggregate = function() {
            $("#noAggregateInfo").removeClass("hide");
            
            // aggregate
            agInput.populateSelect(agList, true);
            
            // target compute node (tcn)
            tcnDataFake = {"key": tcnId, "displayName": tcnName};
            tcnInput.populateSelect([tcnDataFake], false, tcnId);
        };
    }
    
    

    
    // --------------------------------------------------------------------
    // Make the custom opts show up.
    // --------------------------------------------------------------------   
    var lastParam = "row_vnf_target_cmpt_node";
    var propList = vnfDataSet[data.vnfType].vnfTypeProperties;
    
    for (var i=0; i < propList.length; i++) {
        var prop = propList[i];
        if (prop.exposed) {
            var propName = "property-" + propList[i].key;
            
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
    var targetDiv = $("#so-device--" + $("#vnf_instance_name").html());
    
    p.setSubmitAction(function(fields) {
        var targetObj                   = targetDiv.data("vnf-optimization");
        targetObj.customOptimization    = $("#vnf_instance_cust_opts option:selected").html();
        targetObj.customOptimizationKey = $("#vnf_instance_cust_opts").val();
        targetObj.hostAggregate         = $("#vnf_instance_host_agg option:selected").html();
        targetObj.hostAggregateKey      = $("#vnf_instance_host_agg").val();
        targetObj.computeNode           = $("#vnf_target_cmpt_node option:selected").html();
        targetObj.computeNodeKey        = $("#vnf_target_cmpt_node").val();
    });
}

