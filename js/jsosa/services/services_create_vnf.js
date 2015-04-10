//----------------------------------------------------------
// RENDER FORM
//----------------------------------------------------------
function services_create_vnf_render_form(form) {
    var p = osa.ui.formPopup.create($.i18n._("srvc.ttl.crt.vnf"), null, {submitLabel: $.i18n._("srvc.btn.sbmt.vnf")});
    
    p.$CONTAINER.appendTo('body').hide();
    p.$FORM.attr("id", "servicesCreateVNFForm");
    var form = p.$FORM;
    

    form.addTextInput("vnf-instance-name", "srvc.name");
    form.addSelect("vnf-instance", "srvc.type");
    form.addSelect("vnf-optimization", "srvc.opt.flvr", true, false, [], null, "hide");
    form.addSelect("vnf_scale_alarm_type", "srvc.alarm.type", true, false, [], null, "hide");
    form.addSelect("vnf_target_cloud", "srvc.tgt.cld", true);
    form.addSelect("vnf_cloud_location", "srvc.cld.loc", true, false, [], null, "hide");
    form.addSelect("vnf_a_zone", "srvc.a.zone", true, false, [], null, "hide");
    form.addSelect("vnf_agg", "srvc.aggregate", true, false, [], null, "hide"); // aggregate
    form.addSelect("vnf_target_cmpt_node", "srvc.tgt.cmpt.nd", true, false, [], null, "hide"); 
    
    
    // TODO: when I convert this over to the new add input functions, I will not need
    // this step
    var tgtCompNodeInput = $("#vnf_target_cmpt_node");
    tgtCompNodeInput.hideRow();
    $("#vnf_cloud_location").hideRow();
    $("#vnf_a_zone").hideRow();
    $("#vnf_agg").hideRow();
    
    // VALIDATION
    form.validate({
        rules : {
            "vnf-instance-name" : {
                required : true,
            },
            "vnf-instance" : {
                required: true,
            },
            "vnf_target_cloud" : {
                required: true,
            }
        },
        messages: {
            "vnf-instance-name" : {
                required: $.i18n._("err.msg.required"),    
            },
            "vnf-instance" : {
                required: $.i18n._("err.msg.required"),
            },
            "vnf_target_cloud" : {
                required: $.i18n._("err.msg.required"),
            }
        },
        errorPlacement : function(error, element) {
            error.appendTo(element.parent());
        }
    }); 
    
    // OLD CODE SUPPORT
//    $("#vnf-instance-name").addRequired();
    $("#vnf_target_cloud").addRequired();
    $("#vnf-instance").addRequired();
    $("#vnf-optimization").addRequired();
    tgtCompNodeInput.addRequired();
    
    $("#row_vnf_target_cmpt_node").after(p.$BUTTONCONTAINER);
    
    return p;
}

//----------------------------------------------------------
// POPULATE FORM WITH DATA
//----------------------------------------------------------
function services_create_vnf_populate_data(mainForm) {
    
    //------------
    // TYPE
    //------------
    var typeInput = $("#vnf-instance");    
    var vnfs = $("#" + mainForm).data("vnfByName");

    // load the options
    typeInput.prepSel(true, true);
    for (var i in vnfs) {
        typeInput.append("<option value='" + vnfs[i].key + "'>" + vnfs[i].displayName + "</option>");
    }
    
    //------------
    // CLOUDS
    //------------
    var cloudList = $("#" + mainForm).data("cloudList");
    var targetCloudInput = $("#vnf_target_cloud");
    
    // alphabetize
    cloudList.sort(function (a, b) {
        if (a.displayName > b.displayName) return 1;
        else if (a.displayName == b.displayName) return 0;
        else return -1;
    });
    
    // load the options
    targetCloudInput.populateSelect(cloudList, true);
}

//----------------------------------------------------------
// EVENTS
//----------------------------------------------------------
function services_create_vnf_events(mainForm) {
    
    // VNF TYPE and CUSTOM OPTIMIZATIONS
    $("#vnf-instance").change(function() {
        var val = $(this).find("option:selected").html();
        var optFlavorsInput = $("#vnf-optimization");
        var optScaleProfInput = $("#vnf_scale_alarm_type");
        var vnfs = $("#" + mainForm).data("vnfByName");
        var optFlavors = vnfs[val].availableCustomOptimizations;
        var scaleAlarmTypes = vnfs[val].scaleAlarmTypes;
        var currentVNFProps = [];
        var propList = vnfs[val].vnfTypeProperties;
        
        // Hide unused field(s) and exit
        if (val == "") {
            optFlavorsInput.empty();
            optFlavorsInput.parent().addClass("hide");
            return true;
        }
        
        // -------------------
        // OPTIMIZATION FLAVOR
        // -------------------
        // we have a value, now populate drop downs and add inputs where needed        
        optFlavorsInput.empty();
        optFlavorsInput.append("<option value=''></option>");
        
        
        for (var i=0; i<optFlavors.length; i++) {
            optFlavorsInput.append("<option value='" + optFlavors[i] + "'>" + optFlavors[i] + "</option>");
        } 
        
        if (optFlavors.length > 0) optFlavorsInput.parent().removeClass("hide");
        else {
            if (!vnfs[val].nestedVNFTypeLinks)
            alert($.i18n._("srvc.msg.warn.no.opt", $("#vnf-instance :selected").html()));
            optFlavorsInput.parent().addClass("hide");
        }
        
        
        // --------------------
        // SCALE ALARM TYPES
        // --------------------
        optScaleProfInput.prepSel(true);
        if (scaleAlarmTypes) {
            for (var i=0; i<scaleAlarmTypes.length; i++) {
                optScaleProfInput.append("<option value='" + scaleAlarmTypes[i].key + "'>" + scaleAlarmTypes[i].name + "</option>");
            }
        }
        
        if (scaleAlarmTypes && scaleAlarmTypes.length > 0) optScaleProfInput.showRow();
        else optScaleProfInput.hideRow();
        
        // --------------------
        // CUSTOM PROPERTIES
        // --------------------
        $(".customProperty").parent().remove();
        var putAfterMe = $("#vnf-instance");
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            if (prop.exposed) {
                currentVNFProps.push('property-' + prop.key);
                p.addField('property-' + prop.key, prop.propertyName, 'string', prop.propertyValue);
                putAfterMe.parent().after(p.getField('property-' + prop.key).parent());
                $("#form-property-" + prop.key).addClass("customProperty");
                $("#form-property-" + prop.key).siblings("label").attr("title", prop.propertyDescription);
                if (prop.mandatory) {
                    p.addRequiredField('property-' + prop.key);
                }
            }
        }
        
        
        // in case I go from a switch to a VNF or vice versa.
        $("#vnf_target_cloud").trigger("change");
    });
    
    
    var form = $("#servicesCreateVNFForm");
    var tgtCloudInput = $("#vnf_target_cloud");
    var cldLocInput   = $("#vnf_cloud_location");
    var aZoneInput    = $("#vnf_a_zone");
    var aggInput      = $("#vnf_agg");
    
    tgtCloudInput.setTgtCloudCE($("#" + mainForm));
    cldLocInput.setTgtCldLocCE(form);
    aZoneInput.setAvailZoneCE(form);
    aggInput.setAggregateCE(form);

}