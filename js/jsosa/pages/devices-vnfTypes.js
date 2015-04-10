//var run_vnfTypes = function()  {

(function(access) {
    var isWriteAccess = access.write;
    var $vnfTypesList = $("#devicevnfTypes-list");
    var $vnftypeBlockTemplate = $("#device-block-template");
    var $custOptBlockTemplate = $("#custom-optimization-block-template");
    var $custScriptBlockTemplate = $("#custom-script-block-template");
    var alarmScaleSection = $("#alarmScaleProfile");
    var $noCustOptBlock = $("#no-custom-optimizations-blurb-template");
    var $noCustScriptBlock = $("#no-custom-script-blurb-template");
    var $noCustPropBlock = $("#no-custom-property-blurb-template");

    var __defaultProperties = [],
        __optimizationTypes = [],
        __customOptimizations = [],
        __customScripts = [],
        __vnfTypeImageFileNameList = [];
    
    var _typeOfScripts = [
                          {key:'Boot', value:'Boot'},
                          {key:'Edit', value:'Edit'}
                      ];
    
    // i18n
    $("#add-vnfType-btn .bigBtnTxt").html($.i18n._("dev.btn.create.vnf.type"));
    $("#devicevnfTypes-list").html($.i18n._("cmn.loading"));
    $("#msgNoVnfTypes").html($.i18n._("dev.no.vnf.types"));

    var handleMeasurementAdd = function(o) {
        var vnfId = o.vnfTypeKey;
        var meterName = o.meterType;
        var card = $("#vnf-block-" + vnfId);
        var successMsg = card.find(".metricsSuccess");
        var failMsg = card.find(".metricsFail");
        var check = card.find("." + meterName + " input");
        
        
        osa.ajax.add("measurementType", o, function() {
            successMsg.showAndHide();
        },
        function() {
            check.prop('checked', false);
            failMsg.showAndHide();
        });
    };
    
    var handleMeasurementRemove = function(o) {
        var vnfId = o.vnfTypeKey;
        var meterType = o.meterType;
        var card = $("#vnf-block-" + vnfId);
        var successMsg = card.find(".metricsSuccess");
        var failMsg = card.find(".metricsFail");
        var check = card.find("." + meterType + " input");
        
        osa.ajax.removeMetric("measurementType", o, function() {
            successMsg.showAndHide();
        },
        function() {
            check.prop('checked', false);
            failMsg.showAndHide();
        });
    };

    var updateTable = function() {

        osa.ajax.list('customOptimizations', function(custOpts) {         
            __customOptimizations = custOpts;
            
            osa.ajax.list('vnfTypeScript', function(custScripts) {         
                __customScripts = custScripts;

                osa.ajax.list('centralOfficeVirtualNetworkFunctionTypes', function(vnfList) {
                    

                $vnfTypesList.empty();
                if (vnfList.length == 0) {
                    $("#no-services-warning").clone().appendTo($vnfTypesList);
                    return;
                } 

                for (var i in vnfList) {
                    if (vnfList.hasOwnProperty(i)) {
                        var curVnf = vnfList[i];
                        var vnfkey = idify(curVnf.key);
                        var vnfId = curVnf.key;
                        var $b = $vnftypeBlockTemplate.clone().attr('id', 'vnf-block-' + vnfkey);
                        var $custOptContainer = $b.find(".CustomOptList");
                        var $custPropContainer = $b.find(".custom-property-container");
                        var $propContainer = $b.find(".propsList");
                        var $custScriptContainer = $b.find(".customScriptList");
                        var scaleProfsList = $b.find(".scaleProfsList");
                        var portNames = curVnf.portNames;
                        var hasCustomOptimizations = false;
                        var hasVnfScripts = false;
                        var hasCustomProperty = false;
                        var hasDefaultProperty = false;
                        
                        $b.appendTo($vnfTypesList);
                        
                        // ---------------------------------------------------------------
                        // I18N
                        //----------------------------------------------------------------
                        $b.find(".imageHdr").html($.i18n._("dev.image"));
                        $b.find(".numPortsHdr").html($.i18n._("dev.no.ports"));
                        $b.find(".metricsHdr").html($.i18n._("dev.col.metrics"));
                        $b.find(".metricsSuccess").html($.i18n._("dev.meas.success.msg"));
                        $b.find(".metricsFail").html($.i18n._("dev.meas.fail.msg"));
                        $b.find(".customScriptHdr").html($.i18n._("dev.ssh.scripts"));
                        $b.find(".propsHdr").html($.i18n._("dev.props"));
                        $b.find(".scaleProfsHdr").html($.i18n._("dev.alrm.scl.profs"));
                        $b.find(".customOptHdr").html($.i18n._("dev.opts"));
                        $b.find(".scaleUpdateSuccessMsg").html($.i18n._("alrm.msg.updt.success"));
                        $b.find(".scaleDeleteSuccessMsg").html($.i18n._("alrm.msg.del.success"));
                        
                        
                        
                        
                        
                        // ---------------------------------------------------------------
                        // TOP
                        // ---------------------------------------------------------------        
                        $b.find(".vnfdisplayName").html(curVnf.displayName);
                        $b.find(".vnfimagefilename").siblings("label").html($.i18n._("dev.img.file"));
                        $b.find(".vnfimagefilename").html(curVnf.imageFileName);
                        $b.find(".vnfnumOfPorts").html(portNames.length);
                        $b.find(".vnfnumOfPorts").siblings("label").html($.i18n._("dev.num.ports"));
                        
                        var isSwitch = ((curVnf.vnfTypeAttributes[0] && curVnf.vnfTypeAttributes[0].name) == "OvrSwitch");
                        
                        // REMOVE SSH Script, Properties, Scale Profiles, etc.
                        if (isSwitch) {
                            $b.find(".btnContainer").remove();
                            $b.find(".customScriptHdr").remove();
                            $b.find(".propsHdr").remove();
                            $b.find(".scaleProfsHdr").remove();
                            $b.find(".metricsHdr").remove();
                        }


                        var availString = $.i18n._("dev.stat.avail");
                        var availClass = "runningStatus";
                        switch (curVnf.availability) {
                            case "available for use":
                                break;

                            case "not available for use":
                                availClass = "failedStatus";
                                availString =  "dev.stat.unavail";
                            default:
                                break;
                        }

                        $b.find(".vnf-availability").addClass(availClass).html($.i18n._(availString));
                        
                        
                        
                        // ---------------------------------------------------------------
                        // METRICS
                        // ---------------------------------------------------------------       
                        if (!isSwitch) {
                            var measurementTypes = curVnf.measurementTypes;
                            
                            var metricsTarget = $b.find(".metricsList");
                            var nwMeter = false;
                            var diskMeter = false;
                            var cpuMeter = false;
                            
                            for (var m=0; m<measurementTypes.length; m++) {
                                var meterType = measurementTypes[m].meterType;
                                if (meterType == "network") nwMeter = true;
                                if (meterType == "disk") diskMeter = true;
                                if (meterType == "cpu") cpuMeter = true;
                            }
                            
                            metricsTarget.addCheckboxReverse("metricNetwork" + i, "Network", nwMeter, "metricsCheck network");
                            metricsTarget.addCheckboxReverse("metricDisk" + i, "Disk", diskMeter, "metricsCheck disk");
                            metricsTarget.addCheckboxReverse("metricCPU" + i, "CPU", cpuMeter, "metricsCheck cpu");
                            
                        
                            $("#metricNetwork" + i).change(function() {
                                var thisVnfId = $(this).closest(".device-list-block").attr("id").replace("vnf-block-", "");
                                var o = {"meterType" : "network",
                                         "vnfTypeKey" : thisVnfId,
                                };
                                
                                if ($(this).is(":checked")) {
                                    handleMeasurementAdd(o);
                                }
                                else {
                                    handleMeasurementRemove(o);
                                }
                            });
                            
                            $("#metricDisk" + i).change(function() {
                                var thisVnfId = $(this).closest(".device-list-block").attr("id").replace("vnf-block-", "");
                                var o = {"meterType" : "disk",
                                         "vnfTypeKey" : thisVnfId,
                                };
                                if ($(this).is(":checked")) {
                                    handleMeasurementAdd(o);
                                }
                                else {
                                    handleMeasurementRemove(o);
                                }
                            });
                            
                            $("#metricCPU" + i).change(function() {
                                var thisVnfId = $(this).closest(".device-list-block").attr("id").replace("vnf-block-", "");
                                var o = {"meterType" : "cpu",
                                         "vnfTypeKey" : thisVnfId,
                                };
                                if ($(this).is(":checked")) {
                                    handleMeasurementAdd(o);
                                }
                                else {
                                    handleMeasurementRemove(o);
                                }
                            });
                        }
                        
                
                        // ---------------------------------------------------------------
                        // PROPERTIES
                        // ---------------------------------------------------------------
                        if (!isSwitch) {
                            if (curVnf.vnfTypeProperties[0]) {
                                for (var cur = 0; cur<curVnf.vnfTypeProperties.length; cur++) {
                                    var curVnfProps = curVnf.vnfTypeProperties[cur];
                                    var isExposed   = curVnfProps.exposed;
                                    var isMandatory = curVnfProps.mandatory;
                                    var isShared    = curVnfProps.shared;
                                    var cls         = "";
                                    
                                    var clickEdit   = editCustomProperty;
                                    var clickDel    = deleteCustomProperty;
                                    
                                    var prettyName  = curVnfProps.propertyName;
                                    var key         = curVnfProps.key;
                                    
                                    if (!isExposed) {
                                        cls="notExposed";
                                    }
                                
                                    if(prettyName === "METADATA_STATUS" ||
                                            (prettyName === "METADATA_TIMESTAMP") ||
                                            (prettyName === "EVENT_TYPE")) {    
                                        hasDefaultProperty = true;
                                        $propContainer.attr("id", "propsList_" + key);
                                        var propVal = curVnfProps.propertyValue;
                                        $propContainer.append("<div class='custom-property-block " + cls + "'><label class='wideLabel' alt='"  + prettyName + " : " + propVal + "' title='"  + prettyName + " : " + propVal + "'>"  + prettyName + "</label><div>"  + propVal +  "</div></div>");
                                
                                    } else {
                                        hasCustomProperty = true;
                                      
                                        $propContainer.append("<div class='custom-property-block " + cls + "' id='id_curVnfProps" + key + "'><label class='wideLabel'>"  + prettyName + "</label><div class='fl'>"  + curVnfProps.propertyValue +  "</div>" +
                                                "<div class='btnContainer'><a class='custom-property-delete-btn btnRound fr' href='#'><img src='images/delete.png'></a>" +
                                                "<a class='custom-property-edit-btn btnRound fr' href='#'><img src='images/edit.png'></a></div></div>");
                                      
                                        var delBtn = $("#id_curVnfProps" + key).find(".custom-property-delete-btn");
                                        var edtBtn = $("#id_curVnfProps" + key).find(".custom-property-edit-btn");
                                        
                                        if (prettyName == "METADATA_POLL_FREQ" || prettyName == "METADATA_SCRIPT") {
                                            delBtn.remove();
                                        } 
                                        else {
                                            delBtn.data({'id':  key}).click(clickDel);
                                            delBtn.attr("title", $.i18n._("btn.deleteCtx", prettyName));
                                            delBtn.attr("alt", $.i18n._("btn.deleteCtx", prettyName));
                                        }
                                        edtBtn.data(curVnfProps).click(clickEdit);
                                        edtBtn.attr("title", $.i18n._("btn.editCtx", prettyName));
                                        edtBtn.attr("alt", $.i18n._("btn.editCtx", prettyName));
                                    }
                                }
                            }
                            else {
                                if(!hasCustomProperty) {
                                    $custPropContainer.append($noCustPropBlock.clone().removeAttr("id"));
                                }
                                if(!hasDefaultProperty) {
                                    $propContainer.append($.i18n._("dev.none"));
                                }
                            }
                        }
                        
                        
                         
                        // ---------------------------------------------------------------
                        // CUSTOM OPTIMIZATIONS
                        // ---------------------------------------------------------------
                        for (var j = 0; j < __customOptimizations.length; j++) {
                            if (__customOptimizations[j].vnfTypeKey == vnfId) {
                                var cur = __customOptimizations[j];
                                var clickEdit = editCustomOptimization;
                                var clickDel  = deleteCustomOptimization;
                                
                                var prettyName = cur.displayName;
                                var key = cur.key;
                                
                                hasCustomOptimizations = true;
                                var $cob = $custOptBlockTemplate.clone().removeAttr("id");
                                var delBtn = $cob.find(".custom-optimization-delete-btn");
                                var edtBtn = $cob.find(".custom-optimization-edit-btn");
                                
                                $cob.find(".custom-optimization-name").html(prettyName);
                                
                                edtBtn.data(cur).click(clickEdit);
                                edtBtn.attr("title", $.i18n._("btn.editCtx", prettyName));
                                edtBtn.attr("alt", $.i18n._("btn.editCtx", prettyName)); 
                                
                                if (!isSwitch) {
                                    delBtn.data({'id': key}).click(clickDel);
                                    delBtn.attr("title", $.i18n._("btn.deleteCtx", prettyName));
                                    delBtn.attr("alt", $.i18n._("btn.deleteCtx", prettyName));
                                }
                                else {
                                    delBtn.remove();
                                }

                               
                                $cob.appendTo($custOptContainer);
                            };
                        }
                        
                        // WARNING
                        if (!hasCustomOptimizations) {
                            $custOptContainer.append($noCustOptBlock.clone().removeAttr("id")).html("<div class='warningStatus fl'>" + $.i18n._("stat.warning") + "</div><div class='mainWarning fl'>" + $.i18n._("dev.msg.warn.need.cust.opt") + "</div>");
                        } 
                        
                        // ---------------------------------------------------------------
                        // SCRIPTS
                        // ---------------------------------------------------------------
                        if (!isSwitch) {
                            for (var j = 0; j < __customScripts.length; j++) {
                                if (__customScripts[j].vnfTypeKey == vnfId) {
                                    var cur = __customScripts[j];
                                    var clickEdit = editCustomScript;
                                    var clickDel  = deleteCustomScript;
                                    
                                    var prettyName = cur.vnfScriptType;
                                    var key = cur.key;
                                    
                                    hasVnfScripts = true;

                                    var $cscript = $custScriptBlockTemplate.clone().removeAttr("id");
                                    var delBtn = $cscript.find(".custom-script-delete-btn");
                                    var edtBtn = $cscript.find(".custom-script-edit-btn");
                                    
                                    $cscript.find(".custom-script-name").html(prettyName);
                                    
                                    edtBtn.data(cur).click(clickEdit);
                                    edtBtn.data("ports", curVnf.portNames);
                                    edtBtn.attr("title", $.i18n._("btn.editCtx", prettyName));
                                    edtBtn.attr("alt", $.i18n._("btn.editCtx", prettyName)); 
                                    delBtn.data({'id': key}).click(clickDel);
                                    delBtn.attr("title", $.i18n._("btn.deleteCScript", prettyName));
                                    delBtn.attr("alt", $.i18n._("btn.deleteCScript", prettyName));
                                
                                 $cscript.appendTo($custScriptContainer);
                              };
                            }
                            
                            if(!hasVnfScripts) {
                                $custScriptContainer.append($noCustScriptBlock.clone().removeAttr("id"));
                            }


                            if (isWriteAccess) {
                                $b.find(".addScriptBtn .btnLabel").html($.i18n._("dev.btn.add.script"));
                                $b.find(".addOptimizationBtn .btnLabel").html($.i18n._("dev.btn.add.opt"));
                                $b.find(".addPropertyBtn .btnLabel").html($.i18n._("dev.btn.add.prop"));
                                $b.find(".addAlarmScaleBtn .btnLabel").html($.i18n._("dev.btn.add.scl"));
                                $b.find(".block-delete-btn .btnLabel").html($.i18n._("dev.btn.del.vnf.type"));
                                
                                
                                $b.find(".block-delete-btn").data({'id': vnfkey}).attr("id", "block-delete-btn-" + vnfkey).click(deleteVnfType);
                                $b.find(".addOptimizationBtn").data({'id': vnfId}).click(addCustomOptimization);
                                $b.find(".addScriptBtn").data({'id': vnfId, "ports": curVnf.portNames}).click(addCustomScript);
                                $b.find(".addAlarmScaleBtn").data({'id': vnfId}).click(addAlarmScale);
                                $b.find(".addPropertyBtn").data({'id': vnfId}).click(addCustomProperty);
                            }
                            else {
                                $b.find(".block-delete-btn").remove();
                                $b.find(".addOptimizationBtn").remove();
                                $b.find(".addScriptBtn").remove();
                                $b.find(".addPropertyBtn").remove();
                                $b.find(".addAlarmScaleBtn").remove();
                                $b.find(".custom-optimization-delete-btn").remove();
                                $b.find(".custom-optimization-edit-btn").remove();
                                $b.find(".custom-script-delete-btn").remove();
                                $b.find(".custom-script-edit-btn").remove();
                                $b.find(".custom-property-delete-btn").remove();
                                $b.find(".custom-property-edit-btn").remove();
                            }
                        }

                        
                        
                        // ---------------------------------------------------------------
                        // ALARM SCALES
                        // ---------------------------------------------------------------
                        if (!isSwitch) {
                            var meterUnits = {"cpu" : $.i18n._("alrm.mtr.ns"),
                                  "cpuUtil" : $.i18n._("alrm.mtr.utl"), 
                                  "diskReadBytesRate" : $.i18n._("alrm.mtr.bps"),
                                  "diskWriteBytesRate" : $.i18n._("alrm.mtr.bps"),
                                  "diskReadRequestsRate" : $.i18n._("alrm.mtr.rps"),
                                  "diskWriteRequestsRate" : $.i18n._("alrm.mtr.rps"),
                                  "networkIncomingBytesRate" : $.i18n._("alrm.mtr.Mbps"),
                                  "networkOutgoingBytesRate" : $.i18n._("alrm.mtr.Mbps"),
                                  "networkIncomingPacketsRate" : $.i18n._("alrm.mtr.pps"),
                                  "networkOutgoingPacketsRate" : $.i18n._("alrm.mtr.pps")};

                            var curScaleProfs = curVnf.scaleAlarmTypes;
                            if (curScaleProfs.length > 0) {
                                scaleProfsList.empty();
                                for (var x=0; x<curScaleProfs.length; x++) {
                                    var cur = curScaleProfs[x];
                                    var prettyName = cur.name;
                                    var key = cur.key;
                                    
                                    
                                    var scaleBox = alarmScaleSection.clone().removeAttr("id");
                                    var delBtn = scaleBox.find(".alarmScaleDelBtn");
                                    var edtBtn = scaleBox.find(".alarmScaleEdtBtn");
                                    
                                    var clickEdit = editAlarmScaleProf;
                                    var clickDel  = deleteAlarmScaleProf;
                                    
                                    scaleBox.find(".alarmScaleName").html(prettyName);
                                    
                                    var rules = cur.meteredAlarmTraitType;
                                    for (var l=0; l<rules.length; l++) {
                                        var curRule = rules[l];
                                        var meterNameStr = $.i18n._("alrm.stat." + curRule.meterName);
                                        var meterOperStr = $.i18n._("alrm.stat." + curRule.meterOperator);
                                        var meterStatStr = $.i18n._("alrm.stat." + curRule.meterStatistic);
                                        var forStr       = $.i18n._("for");
                                        var consSampStr  = $.i18n._("alrm.sntc.cons.samps");
                                        var rateStr      = $.i18n._("alrm.sntc.cons.rate");
                                        var secondsStr   = $.i18n._("alrm.sntc.secs");
                                        
                                        var hoverStr = meterNameStr + " " + meterOperStr + " " + 
                                                       meterStatStr + " " + curRule.meterValue + " " + meterUnits[curRule.meterName] + 
                                                       " " + forStr + " " + curRule.numIntervals + " " + consSampStr + " " +
                                                       " " + rateStr + " " + curRule.cadenceInterval + " " +  secondsStr + ".";
                                        
                                        if (curRule.scaleDirection == "up"){
                                            scaleBox.find(".alarmScaleUp").html(curRule.meterDescription).attr("alt", hoverStr).attr("title", hoverStr);    
                                        }
                                        else {
                                            scaleBox.find(".alarmScaleDown").html(curRule.meterDescription).attr("alt", hoverStr).attr("title", hoverStr);
                                        }
                                        
                                        if (!rules[l].alarmEnabled)
                                            scaleBox.find(".alarmScaleUp").addClass("disabled");
                                    }

                                    edtBtn.data(cur).data({'vnfId': vnfId}).click(clickEdit);
                                    edtBtn.attr("title", $.i18n._("btn.editCtx", prettyName));
                                    edtBtn.attr("alt", $.i18n._("btn.editCtx", prettyName)); 
                                    delBtn.data({'id': key}).click(clickDel);
                                    delBtn.attr("title", $.i18n._("btn.deleteCScript", prettyName));
                                    delBtn.attr("alt", $.i18n._("btn.deleteCScript", prettyName));
                                    
                                    scaleBox.appendTo(scaleProfsList);
                                }
                            }
                            else {
                                scaleProfsList.html($.i18n._("dev.none"));
                            }
                        }
 

                    }
                }
            });
        });

     });
    
    };

    updateTable();

    var deleteVnfType = function(ev) {
        var id = $(ev.target).closest(".block-delete-btn").data('id');
        if (id) {
            if (confirm($.i18n._("dev.prmpt.vnf.type"))) {
                osa.ajax.remove('centralOfficeVirtualNetworkFunctionTypes', id, function() {
                    updateTable();
                });
            }
        }
    };

    var deleteCustomOptimization = function(ev) {
        ev.preventDefault();
        var id = $(ev.target).closest(".btnRound").data('id');

        if (id) {
            if (confirm($.i18n._("dev.prmpt.cust.opt"))) {
                osa.ajax.remove('customOptimizations', id, function() {
                    updateTable();
                });
            }
        }
    };
    
    var deleteCustomScript = function(ev) {
        ev.preventDefault();
        var id = $(ev.target).closest(".btnRound").data('id');

        if (id) {
            if (confirm($.i18n._("dev.prmpt.cust.scrpt"))) {
                osa.ajax.remove('vnfTypeScript', id, function() {
                    updateTable();
                });
            }
        }
    };
    
    var deleteCustomProperty = function(ev) {
        ev.preventDefault();
        var id = $(ev.target).closest(".btnRound").data('id');

        if (id) {
             if (confirm($.i18n._("dev.prmpt.cust.prop"))) {
                osa.ajax.remove('vnfTypeProperties', id, function() {
                    updateTable();
                });
            }
        }
    };


    // -------------------------------------------------
    // ADD OPTIMIZATION
    // -------------------------------------------------
    var addCustomOptimization = function(ev) {    
        var who = $(ev.target).closest(".addOptimizationBtn").data("id");
        ev.preventDefault();
        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.add.opt"), null, {submitLabel: $.i18n._("btn.add")});
        p.addField("displayName", $.i18n._("dev.opt.name"), "string");
        p.addField("vnfTypeKey", $.i18n._("dev.assoc.vnf.type"), "hidden", who);
        
        for (var i in __optimizationTypes) if (__optimizationTypes.hasOwnProperty(i)) {
            var n = __optimizationTypes[i].name;
            var unit = __optimizationTypes[i].unit;
            
            p.addField("opt-" + n, n + " (" + unit + ")", "string");
        }

        p.setSubmitAction(function(fields) {
            var o = {
                displayName: fields["displayName"],
                vnfTypeKey: fields["vnfTypeKey"],
                optimizationDefinition: {}
            };

            for (var i in fields) if (fields.hasOwnProperty(i)) {
                if (i.indexOf("opt-") == 0) {
                    o.optimizationDefinition[i.replace("opt-", "")] = parseInt(fields[i]);
                }
            }

            osa.ajax.add("customOptimizations", o, updateTable);
        });

        p.show();
    };
    
    var addAlarmScale = function(ev) {
        var id = $(ev.target).closest(".addAlarmScaleBtn").data("id");
        ev.preventDefault();
        genAlarmScale(id, updateTable);
    };
    
    
    // -------------------------------------------------
    // ADD PROPERTY
    // -------------------------------------------------
    var addCustomProperty = function(ev) {    
        var who = $(ev.target).closest(".addPropertyBtn").data("id");
        ev.preventDefault();
        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.add.prop"), null, {submitLabel: $.i18n._("btn.add")});
     
        
        p.addField("propertyName", $.i18n._("cmn.name"), "string");
        p.addField("vnfTypeKey", $.i18n._("dev.assoc.vnf.type"), "hidden", who);
        p.addField("propertyDescription" , $.i18n._("dev.desc"), "string");
        p.addField("propertyValue" , $.i18n._("dev.def.val"), "string");
        p.addField("mandatory", $.i18n._("dev.mandatory"), "checkbox");
        p.addField("exposed", $.i18n._("dev.exp.to.user"), "checkbox");
        p.addField("shared", $.i18n._("dev.shared.prop"), "checkbox");


        p.setSubmitAction(function(fields) {
            var o = {
                      propertyName:         fields["propertyName"],
                      vnfTypeKey:           fields["vnfTypeKey"],
                      propertyValue:        fields["propertyValue"],
                      propertyDescription:  fields["propertyDescription"],
                      exposed:              fields["exposed"] == "on",
                      mandatory:            fields["mandatory"] == "on",
                      shared:               fields["shared"] == "on"
            };

            osa.ajax.add("vnfTypeProperties", o, updateTable);
        });

        p.show();
    }; 
  
    
    // -------------------------------------------------
    // EDIT PROPERTY
    // -------------------------------------------------
    var editCustomProperty = function(ev) {
        ev.preventDefault();
        var cprop = $(ev.target).closest(".btnRound").data();

        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.update.prop"), null, {submitLabel: $.i18n._("btn.update")});
        p.addField('key', 'Key', 'hidden', cprop.key);
        p.addField('propertyName', $.i18n._("dev.prop.name"), 'string', cprop.propertyName);
        p.addField('vnfTypeKey', $.i18n._("dev.assoc.vnf.type"), 'hidden', cprop.vnfTypeKey);

        p.addField('propertyDescription' , $.i18n._("dev.desc"), 'string', cprop.propertyDescription);
        p.addField('propertyValue' , $.i18n._("dev.def.val"), 'string', cprop.propertyValue);
        p.addField('mandatory', $.i18n._("dev.mandatory"), 'checkbox', cprop.mandatory);
        p.addField('exposed' , $.i18n._("dev.exp.to.user"), 'checkbox', cprop.exposed);
        p.addField('shared' , $.i18n._("dev.shared.prop"), 'checkbox', cprop.shared);

      
        p.setSubmitAction(function(fields) {
                 var o = {
                           key:         fields['key'],
                           propertyName:         fields['propertyName'],
                           vnfTypeKey:           fields['vnfTypeKey'],
                           propertyValue:        fields['propertyValue'],
                           propertyDescription:  fields['propertyDescription'],
                           exposed:              (fields['exposed'] == 'on'),
                           mandatory:            (fields['mandatory'] == 'on'),
                           shared:               (fields['shared'] == 'on')
                 };


           osa.ajax.update('vnfTypeProperties', o, updateTable);
                 
                 
        });

        p.show();
    };


    
    // -------------------------------------------------
    // ADD SCRIPT
    // -------------------------------------------------
   var addCustomScript = function(ev) {    
       ev.preventDefault();
        var who = $(ev.target).closest(".addScriptBtn").data('id');
        var ports = $(ev.target).closest(".addScriptBtn").data("ports");
        
        var portList = [];
        
        for (var i=0; i<ports.length; i++) {
            portList.push({"displayName" : ports[i], "value" : ports[i]});
        }
  
        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.add.script"), null, {submitLabel: $.i18n._("btn.add")});
      
        p.addField('vnfTypeKey', $.i18n._("dev.assoc.vnf.type"), 'hidden', who);
        p.addField("typeOfScript", $.i18n._("dev.type.of.script"), "select", _typeOfScripts);
        p.addField('userName', $.i18n._("cmn.user.name"), 'string');
        p.addField('password', $.i18n._("cmn.password"), 'string');
        p.addField('portName', $.i18n._("dev.ssh.mgt.port"), 'select', portList);
        p.addField('usePrivateKey' , $.i18n._("dev.use.prvt.key"), 'checkbox');
        p.addField('vnfScript', $.i18n._("dev.vnf.type.script"), 'textarea');
        
        p.setRequiredFields(["portName", "typeOfScript", "userName", "password"]);
        
        p.setSubmitAction(function(fields) {
            
            var textAreaValue = fields['vnfScript'];
            textAreaValue = textAreaValue.replace(/\r\n/g, '\n'); 
            textAreaValue = textAreaValue.replace(/\t/g, '    '); 
        
            var usePrivateKey;
            if(fields['usePrivateKey'] == "on") {
                usePrivateKey = true;
            } else {
                usePrivateKey = false;
            }
            
             var o = {
                     "userName"       : fields["userName"],
                     "password"       : fields["password"],
                     "portName"       : fields["portName"],
                     "vnfScriptType"  : fields["typeOfScript"],
                     "usePrivateKey"  : usePrivateKey,
                     "vnfTypeKey"     : fields["vnfTypeKey"],
                     "script"         : textAreaValue
                 };
             
             osa.ajax.add("vnfTypeScript", o, updateTable);
        });

        p.show();
        
        
    };
    
    // -------------------------------------------------
    // EDIT OPTIMIZATION
    // -------------------------------------------------
    var editCustomOptimization = function(ev) {
        ev.preventDefault();
        var copt = $(ev.target).closest(".btnRound").data();

        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.update.opt"), null, {submitLabel: "Update"});
        p.addField("key", "Key", "hidden", copt.key);
        p.addField("displayName", $.i18n._("dev.opt.name"), "string", copt.displayName);
        p.addField("vnfTypeKey", $.i18n._("dev.assoc.vnf.type"), "hidden", copt.vnfTypeKey);

        for (var i in __optimizationTypes) if (__optimizationTypes.hasOwnProperty(i)) {
            var n = __optimizationTypes[i].name;
            var unit = __optimizationTypes[i].unit;

            p.addField("opt-" + n, n + " (" + unit + ")", "string", copt.optimizationDefinition[n]);
        }

        p.setSubmitAction(function(fields) {
            var o = {
                key: fields["key"],
                displayName: fields["displayName"],
                vnfTypeKey: fields["vnfTypeKey"],
                optimizationDefinition: {}
            };

            for (var i in fields) if (fields.hasOwnProperty(i)) {
                if (i.indexOf("opt-") == 0) {
                    o.optimizationDefinition[i.replace("opt-", "")] = parseInt(fields[i]);
                }
            }

            osa.ajax.update("customOptimizations", o, updateTable);
        });

        p.show();
    };


    // -------------------------------------------------
    // EDIT SCRIPT
    // -------------------------------------------------
    var editCustomScript = function(ev) {
        ev.preventDefault();
        var cscript = $(ev.target).closest(".btnRound").data();
        var p = osa.ui.formPopup.create($.i18n._("dev.ttl.update.script"), null, {submitLabel: $.i18n._("btn.update")});
        
        var ports = cscript.ports;
        var portList = [];
        
        for (var i=0; i<ports.length; i++) {
            portList.push({"displayName" : ports[i], "value" : ports[i]});
        }
        
        p.addField("key", "Key", "hidden", cscript.key);
        p.addField("vnfTypeKey", $.i18n._("dev.assoc.vnf.type"), "hidden", cscript.vnfTypeKey);
        p.addField("typeOfScript", $.i18n._("dev.type.of.script"),  "static", cscript.vnfScriptType);
        p.addField("userName", $.i18n._("cmn.user.name"), "string", cscript.userName);
        p.addField("password", $.i18n._("cmn.password"), "string", cscript.password);
        p.addField("portName", $.i18n._("dev.ssh.mgt.port"), "select",  portList);
        p.getField("portName").val(cscript.portName);
        p.addField("usePrivateKey" , $.i18n._("dev.use.prvt.key"), "checkbox", cscript.usePrivateKey);
        p.addField("vnfScript", $.i18n._("dev.vnf.type.script"), "textarea", cscript.script);
       

        p.setSubmitAction(function(fields) {
        
            var textAreaValue = fields["vnfScript"];
            textAreaValue = textAreaValue.replace(/\r\n/g, '\n'); 
            textAreaValue = textAreaValue.replace(/\t/g, '    '); 
        
            var usePrivateKey;
            if(fields['usePrivateKey'] == "on") {
                usePrivateKey = true;
            } else {
                usePrivateKey = false;
            }
            
             var o = {
                     "key"           : cscript.key,
                     "userName"      : fields["userName"],
                     "password"      : fields["password"],
                     "portName"      : fields["portName"],
                     "vnfScriptType" : cscript.vnfScriptType,
                     "usePrivateKey" : usePrivateKey,
                     "vnfTypeKey"    : fields["vnfTypeKey"],
                     "script"        : textAreaValue
                 };

         osa.ajax.update("vnfTypeScript", o, updateTable);
         
        });

        p.show();
    };


    // Get All of the available VNF type image filenames and store them for the popup so
    // the popup doesn't have to get the list every time.
    osa.ajax.list('vnfTypeImageFileNames', function(vnfTypeImageFileNameList) {
        __vnfTypeImageFileNameList = vnfTypeImageFileNameList;
    });

    osa.ajax.list('optimizationTypes', function(optTypes) {
        __optimizationTypes = optTypes;
    });

    osa.ajax.list('defaultVNFTypeProperties', function(defaultTypeProperties) {
        __defaultProperties = defaultTypeProperties;
    });


    $("#add-vnfType-btn").click(function(ev) {
        ev.preventDefault();

        var vnfTypeImageFileNameSelect = __vnfTypeImageFileNameList.map(function(el) {
            return {key:el.imageFileName, value:el.imageFileName};
        });

        var maxPorts = 36;
        var defPortNames = Array(maxPorts);
        for ( var loop = 0; loop < maxPorts; loop++ ) {
            defPortNames[loop] = "port" + (loop+1);
        }

        var numberPortsSelect = function() {
            var numPortsSelected = parseInt($(this).val());
            if ( isNaN(numPortsSelected) == true ) {
                numPortsSelected = 0;
            }
            var portNameField;
            for ( var showLoop = 1; showLoop <= numPortsSelected; showLoop++ ) {
                portNameField = "#" + __FORM_ID_PREFIX + "port" + showLoop;
                $(portNameField).parent().show();
            }
            for ( var hideLoop = numPortsSelected + 1; hideLoop <= maxPorts; hideLoop++ ) {
                portNameField = "#" + __FORM_ID_PREFIX + "port" + hideLoop;
                $(portNameField).parent().hide();
            }
        };

        var p = osa.ui.formPopup.create("Create a VNF Type", null, {submitLabel: $.i18n._("btn.add")});

        p.addField("vnftypeName", $.i18n._("cmn.name"), "string");
        p.addField("imageFileName", $.i18n._("dev.image"), "select", vnfTypeImageFileNameSelect);
        p.addField("numberOfPorts", $.i18n._("dev.no.ports"), "select", [], numberPortsSelect);
        p.setRange("numberOfPorts", 1, maxPorts + 1);
        p.setRequiredFields(["vnftypeName", "imageFileName", "numberOfPorts"]);

        for ( var loop = 0; loop < maxPorts; loop++ ) {
            p.addField(defPortNames[loop], "", "string", defPortNames[loop]);
        }

        p.addHeader($.i18n._("dev.props"));

        var numProperties = 0;
        var buildPropertyObj = function(fields) {
            var i = 0;
            var o = [];
            while (fields['property' + i + '-value']) {
                o.push({
                    'propertyName':         fields['property' + i + '-name'],
                    'propertyValue':        fields['property' + i + '-value'],
                    'propertyDescription':  fields['property' + i + '-description'],
                    'exposed':              (fields['property' + i + '-isExposed'] == 'on'),
                    'mandatory':            (fields['property' + i + '-isMandatory'] == 'on'),
                    'shared':               (fields['property' + i + '-isShared'] == 'on')
                });
                i++;
            }

            return o;
        };

        for (var i in __defaultProperties) if (__defaultProperties.hasOwnProperty(i)) {
            //p.addHeader(__defaultProperties[i].propertyDescription);
            p.addField('property' + numProperties + '-name'         , __defaultProperties[i].propertyName, 'hidden', __defaultProperties[i].propertyName);
            p.addField('property' + numProperties + '-description'  , __defaultProperties[i].propertyDescription, 'hidden',  __defaultProperties[i].propertyDescription);
            p.addField('property' + numProperties + '-value'        , __defaultProperties[i].propertyDescription, 'string',  __defaultProperties[i].propertyValue);
            p.addField('property' + numProperties + '-isMandatory'  , $.i18n._("dev.mandatory"),   'checkbox_hidden', true,  __defaultProperties[i].mandatory);
            p.addField('property' + numProperties + '-isExposed'    , $.i18n._("dev.exp.to.user"), 'checkbox_hidden', false, __defaultProperties[i].exposed);
            p.addField('property' + numProperties + '-isShared'     , $.i18n._("dev.shared.prop"), 'checkbox_hidden', false, __defaultProperties[i].shared);
            numProperties++;
        }

        p.setSubmitAction(function(formValues) {
            var numPortsSelected = parseInt($("#" + __FORM_ID_PREFIX + "numberOfPorts").val());
            var portNames = Array(numPortsSelected);
            for ( var loop = 0; loop < numPortsSelected; loop++ ) {
                portNames[loop] = formValues["port" + (loop + 1)];
            }
            var o = {
                "displayName"       : formValues["vnftypeName"],
                "availability"      : "",
                "imageFileName"     : formValues["imageFileName"],
                "portNames"         : portNames,
                "availableCustomOptimizations": [],
                "vnfTypeProperties" : buildPropertyObj(formValues),
                "vnfTypeAttributes" : [],
                "vnfTypeScripts"    : [],
                "scaleAlarmTypes"   : [],
        "measurementTypes"  : []
            };

            osa.ajax.add("centralOfficeVirtualNetworkFunctionTypes", o, updateTable);

        });

        p.show();

        for ( var loop = 0; loop < maxPorts; loop++ ) {
            p.getField(defPortNames[loop]).parent().hide();
        }
    });



})(osa.auth.getPageAccess('centralOfficeVirtualNetworkFunctionTypes'));

//};    