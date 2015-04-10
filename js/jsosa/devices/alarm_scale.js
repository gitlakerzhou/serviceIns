function editAlarmScale(data) {
    var rules = data.meteredAlarmTraitType;
    var ruleUp = "";
    var ruleDown = "";
    
    var p = osa.ui.formPopup.create("Edit Scale Profile", null, {submitLabel: $.i18n._("btn.update")});
    
    p.$CONTAINER.appendTo("body").hide();
    p.$FORM.attr("id", "editAlarmScale");
    
    
    renderAlarmScaleForm(p);
    
    // ---------------------------------------------------------
    // POPULATE FORM WITH EXISTING DATA
    // ---------------------------------------------------------
    $("#alrmName").val(data.name);
    $("#alrmMaxNodes").val(data.maxScaleCount);
    $("#alrmCoolDown").val(data.coolDownPeriod);
    
    // since we will only have two, this works.  If we expand - CHANGE
    // if many, then we simply iterate through and match the [i] to
    // the ruleName0 or the x0 or the y0 etc.
    for (var i=0; i<rules.length; i++) {
        if (rules[i].scaleDirection == "up")    ruleUp = rules[i];
        else                                     ruleDown = rules[i];
    }
    
    // ----------
    // UP
    // ----------
    $("#ruleBox0").data("id", ruleUp.key);
    $("#ruleName0").val(ruleUp.meterDescription);
    $("#meterName0").val(ruleUp.meterName);
    $("#meterOperator0").val(ruleUp.meterOperator);
    $("#meterStatistic0").val(ruleUp.meterStatistic);
    $("#meterValue0").val(ruleUp.meterValue);
    $("#numIntervals0").val(ruleUp.numIntervals);
    $("#cadence0").val(ruleUp.cadenceInterval);
    
    // set suffix on units
    $("#meterName0").trigger("change");
    
    if (ruleUp.alarmEnabled)
        $("#ruleEnabled0").prop("checked", "checked");
    
    // ----------
    // DOWN
    // ----------
    $("#ruleBox1").data("id", ruleDown.key);
    $("#ruleName1").val(ruleDown.meterDescription);
    $("#meterName1").val(ruleDown.meterName);
    $("#meterOperator1").val(ruleDown.meterOperator);
    $("#meterStatistic1").val(ruleDown.meterStatistic);
    $("#meterValue1").val(ruleDown.meterValue);
    $("#numIntervals1").val(ruleDown.numIntervals);
    $("#cadence1").val(ruleDown.cadenceInterval);
    
    $("#meterName1").trigger("change");
    
    if (ruleUp.alarmEnabled)
        $("#ruleEnabled1").prop("checked", "checked");
    
    
    p.show();
    
    // ------------------------------------------------------------
    // SUBMIT the ADD LINK FORM
    // ------------------------------------------------------------  
    p.setSubmitAction(function(fields) {
        if ($("#editAlarmScale").valid()) {            
            // gather the rules
            var rules = $("#scaleRules .ruleBox");
            var ruleList = [];
            var count = 0;
            
            for (var r=0; r<rules.length; r++) {
                if ($("#ruleName" + r).val() !== "") {
                    ruleList[count] = {
                            "key"                   : $("#ruleBox" + r).data("id"),
                            "meterName"             : $("#meterName" + r).val(),
                            "meterValue"            : parseInt($("#meterValue" + r).val()),
                            "meterDescription"      : $("#ruleName" + r).val(),
                            "meterOperator"         : $("#meterOperator" + r).val(),
                            "meterStatistic"        : $("#meterStatistic" + r).val(),
                            "cadenceInterval"       : parseInt($("#cadence" + r).val()),
                            "numIntervals"          : parseInt($("#numIntervals" + r).val()),
                            "severity"              : "Major",
                            "alarmEnabled"          : $("#ruleEnabled" + r).is(":checked"),
                            "alarmProfileTypeKey"   : data.meteredAlarmTraitType[r].alarmProfileTypeKey,
                            "repeatAction"          : true,
                            "scaleDirection"        : $("#ruleDirection" + r).val()
                            
                    };   
                    count++;
                }
            }
            
            
            var o = {
                    key            : data.key,
                    vnfTypeKey     : data.vnfId,
                    name           : fields.alrmName,
                    maxScaleCount  : fields.alrmMaxNodes,
                    coolDownPeriod : fields.alrmCoolDown,
                    meteredAlarmTraitType : ruleList
            };    
            
            var curVnfBlock = $("#vnf-block-" + data.vnfId);

            osa.ajax.update("scaleAlarmProfileType", o, function(resp) {
                // went well
                renderAlarmScales(data.vnfId);
                
                
                var card = curVnfBlock.closest(".device-list-block");
                var successMsg = card.find(".scaleUpdateSuccessMsg");
                  successMsg.show("slow");
                  setTimeout(function(){
                      successMsg.hide("slow");
                  }, 5000);
                  
                return true;
            },
            function(resp) { 
                // went badly
                alert($.i18n._("alrm.msg.err.save.failed"));
                return false;
            });
        }

        else {
            alert ($.i18n._("alrm.msg.err.chk.inputs"));
            return false;
        }
    });
    
}



//-----------------------------------------------
// EDIT
//-----------------------------------------------
function editAlarmScaleProf(ev) {
    ev.preventDefault();
    var data = $(ev.target).closest(".alarmScaleEdtBtn").data();
    
    editAlarmScale(data);
};

// -----------------------------------------------
// DELETE
// -----------------------------------------------
function deleteAlarmScaleProf(ev) {
    ev.preventDefault();
    var scaleId = $(ev.target).closest(".btnRound").data('id');
    var card = $(ev.target).closest(".device-list-block");
    var successMsg = card.find(".scaleDeleteSuccessMsg");
    var vnfId = card.attr('id').replace("vnf-block-", "");

    if (scaleId) {
         if (confirm($.i18n._("alrm.prmpt.del.prof"))) {
            osa.ajax.remove('scaleAlarmProfileType', scaleId, function() {
                renderAlarmScales(vnfId);
            });
            
            
            successMsg.show("slow");
            setTimeout(function(){
                successMsg.hide("slow");
            }, 5000);
        }
    }
};


function renderAlarmScales(vnfId) {
    var target = $("#vnf-block-" + vnfId + " .scaleProfsList");
    target.hide("slow").empty();
    
    osa.ajax.list('scaleAlarmProfileType', [vnfId], function(curScaleProfs) {
        var meterUnits = {"cpu" : $.i18n._("alrm.mtr.ns"),
                "cpuUtil" : $.i18n._("alrm.mtr.utl"), 
                "diskReadBytesRate" : $.i18n._("alrm.mtr.bps"),
                "diskWriteBytesRate" : $.i18n._("alrm.mtr.bps"),
                "diskReadRequestsRate" : $.i18n._("alrm.mtr.rps"),
                "diskWriteRequestsRate" : $.i18n._("alrm.mtr.rps"),
                "networkIncomingBytesRate" : $.i18n._("alrm.mtr.Mbps"),
                "networkOutgoingBytesRate" : $.i18n._("alrm.mtr.Mbps"),
                "networkIncomingPacketsRate" : $.i18n._("alrm.mtr.pps"),
                "networkOutgoingPacketsRate" : $.i18n._("alrm.mtr.pps")
        };
        
        if (curScaleProfs.length == 0) {
            target.html("none");
            target.append(structure);
        }
        else {
            for (var i=0; i<curScaleProfs.length; i++) {
                var prettyName = curScaleProfs[i].name;
                var scaleProfKey = curScaleProfs[i].key;
                var row = $("<div>", {class: "custom-script-block"});
                var name = $("<div>", {class: "alarmScaleName fl", html: curScaleProfs[i].name});
                var upName = $("<div>", {class: "alarmScaleUp fl"});
                var downName = $("<div>", {class: "alarmScaleUp fl"});
                var btnbox = $("<div>", {class: "btnContainer"});
                var edtBtn = $("<a>", {class: "alarmScaleEdtBtn btnRound fr"});
                var delBtn = $("<a>", {class: "alarmScaleDelBtn btnRound fr"});
                 
                edtBtn.append('<img src="images/edit.png">');
                edtBtn.data(curScaleProfs[i]).data({'vnfId': vnfId}).click(editAlarmScaleProf);
                edtBtn.attr("title", $.i18n._("btn.editCtx", prettyName));
                edtBtn.attr("alt", $.i18n._("btn.editCtx", prettyName)); 
                delBtn.append('<img src="images/delete.png">');
                delBtn.data({'id': scaleProfKey}).click(deleteAlarmScaleProf);
                delBtn.attr("title", $.i18n._("btn.deleteScript", prettyName));
                delBtn.attr("alt", $.i18n._("btn.deleteScript", prettyName));
                
                var rules = curScaleProfs[i].meteredAlarmTraitType;
                
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
            " " + rateStr + " " + curRule.cadenceInterval + " " + secondsStr + ".";
                    
                    if (curRule.scaleDirection == "up"){
                        upName.html(curRule.meterDescription).attr("alt", hoverStr).attr("title", hoverStr); 
                        if (!curRule.alarmEnabled)
                            upName.addClass("disabled");
                    }
                    else {
                        downName.html(curRule.meterDescription).attr("alt", hoverStr).attr("title", hoverStr);
                        if (!curRule.alarmEnabled)
                            downName.addClass("disabled");
                    }
                    

                }
                
                var structure = row.append(name).append(upName).append(downName).append(btnbox.append(delBtn).append(edtBtn));

                target.append(structure);
            }
        }
        target.show("slow");

    });
    
}


function genAlarmScale(id, fnOnSubmit) {
    var p = osa.ui.formPopup.create("Add Scale Profile", null, {submitLabel: $.i18n._("btn.add")});
    
    p.$CONTAINER.appendTo("body").hide();
    p.$FORM.attr("id", "createAlarmScale");
    
    renderAlarmScaleForm(p);
       
    p.show();
    
    p.setSubmitAction(function(fields) {
        if ($("#createAlarmScale").valid()) {
            // gather the rules
            var rules = $("#scaleRules .ruleBox");
            var ruleList = [];
            var count = 0;
            
            for (var r=0; r<rules.length; r++) {
                if ($("#ruleName" + r).val() !== "") {
                    ruleList[count] = {
                            "meterName"             : $("#meterName" + r).val(),
                            "meterValue"            : parseInt($("#meterValue" + r).val()),
                            "meterDescription"      : $("#ruleName" + r).val(),
                            "meterOperator"         : $("#meterOperator" + r).val(),
                            "meterStatistic"        : $("#meterStatistic" + r).val(),
                            "cadenceInterval"       : parseInt($("#cadence" + r).val()),
                            "numIntervals"          : parseInt($("#numIntervals" + r).val()),
                            "severity"              : "Major",
                            "alarmEnabled"          : $("#ruleEnabled" + r).is(":checked"),
                            "alarmProfileTypeKey"   : null,
                            "repeatAction"          : true,
                            "scaleDirection"        : $("#ruleDirection" + r).val()
                            
                    };   
                    count++;
                }
            }
            
            
            var o = {
                    vnfTypeKey     : id,
                    name           : fields.alrmName,
                    maxScaleCount  : fields.alrmMaxNodes,
                    coolDownPeriod : fields.alrmCoolDown,
                    meteredAlarmTraitType : ruleList
            };
            
            osa.ajax.add("scaleAlarmProfileType", o, fnOnSubmit);
        }
        else {
            console.log("need to validate here");
        };



    });
};


function renderAlarmScaleForm(p) {
    var form = p.$FORM;
    
    // ---------------------------------------------------------
    // INPUTS
    // ---------------------------------------------------------
    form.addTextInput("alrmName", "alrm.scl.name");
    form.addTextInput("alrmMaxNodes", "alrm.scl.max.nodes");
    form.addTextInput("alrmCoolDown", "alrm.scl.cool.down");
    $("#row_alrmCoolDown").append("<span class='unitsOnRight'>" + $.i18n._("alrm.sntc.secs") + "</span>");
    form.append('<div id="scaleRules"></div>');
    // for future release - do not delete
    //    form.append('<div id="addRule" class="button btnSm btnAdd"><span class="typcn typcn-plus"></span>Rule</div>');
    
    // tidy buttons
    $("#scaleRules").after(p.$BUTTONCONTAINER);
    
    // Validation on the old submit call for now
    $("#alrmName").data({'required': true});
    $("#alrmMaxNodes").data({'required': true});
    $("#alrmCoolDown").data({'required': true});
    
    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------
    form.validate({
        rules : {
            "alrmName" : {
                required : true
            },
            "alrmMaxNodes" : {
                required : true,
                min: 1,
                max: 12,
                digits: true
            },
            "alrmCoolDown" : {
                required : true,
                digits: true
            }
        },
        messages: {
            "alrmName" : {
                required: $.i18n._("err.msg.required"),    
            },
            "alrmMaxNodes" : {
                required: $.i18n._("err.msg.required"),    
                min        : $.i18n._("Digit from 1-12"),
                max        : $.i18n._("Digit from 1-12")
            },
            "alrmCoolDown" : {
                required: $.i18n._("err.msg.required"),    
            }
        },
        errorPlacement : function(error, element) {
            error.appendTo(element.parent());
        }
    });
    
    // Use this click function in a future release.
    //  $("#addRule").click(function() {
      var scaleRules = $("#scaleRules");
      
      
      
      var meterNames = [//{"key": "cpu", "displayName": "alrm.type.cpu.time"},
                        {"key": "cpuUtil", "displayName": "alrm.type.cpu.util"},
                        {"key": "diskReadBytesRate", "displayName": "alrm.type.dsk.r.bt"},
                        {"key": "diskWriteBytesRate", "displayName": "alrm.type.dsk.w.bt"},
                        {"key": "diskReadRequestsRate", "displayName": "alrm.type.dsk.r.rq"},
                        {"key": "diskWriteRequestsRate", "displayName": "alrm.type.dsk.w.rq"},
                        {"key": "networkIncomingBytesRate", "displayName": "alrm.type.nw.in.bt"},
                        {"key": "networkOutgoingBytesRate", "displayName": "alrm.type.nw.out.bt"},
                        {"key": "networkIncomingPacketsRate", "displayName": "alrm.type.nw.in.pkt"},
                        {"key": "networkOutgoingPacketsRate", "displayName": "alrm.type.nw.out.pkt"}
                        ];
      
      var meterOperators = [{"key": "lt", "displayName": "<"},
                            {"key": "le", "displayName": "<="},
                            {"key": "eq", "displayName": "="},
                            {"key": "ge", "displayName": ">="},
                            {"key": "ge", "displayName": ">"}
                            ];
      
      var meterStatistics = [{"key": "min",   "displayName" : "alrm.mtr.stat.min"},
                             {"key": "max",   "displayName" : "alrm.mtr.stat.max"},
                             {"key": "avg",   "displayName" : "alrm.mtr.stat.avg"},
                             {"key": "sum",   "displayName" : "alrm.mtr.stat.sum"},
                             {"key": "count", "displayName" : "alrm.mtr.stat.cnt"}
                            ];
      
      var ruleDirection = [{"key": "up", "displayName": "alrm.mtr.dir.up"},
                           {"key": "down", "displayName": "alrm.mtr.dir.down"}
                           ];
      
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
      
      scaleRules.append('<div class="formSubTitle header">' + $.i18n._("alrm.sub.hdr.scale.up") + '</div>');
      makeScaleForm(0);
      $("#ruleDirection0").val("up");
      scaleRules.append('<div class="formSubTitle header">' + $.i18n._("alrm.sub.hdr.scale.down") + '</div>');
      makeScaleForm(1);
      $("#ruleDirection1").val("down");
      
      function makeScaleForm(i) {
          scaleRules.append("<div class='ruleBox' id = 'ruleBox" + i + "'></div>");
          var ruleBox = $("#ruleBox" + i);
          
          ruleBox.addTextInput("ruleName" + i, "alrm.rule.name");
          $("#row_ruleName" + i + " label").addClass("scaleLabel");
          ruleBox.addSelect("ruleDirection" + i, "alrm.rule.direction", false, false, ruleDirection, "", "hide", "alrm.hvr.rule.dir"); 
          ruleBox.append("<div id='scaleRow1_" + i + "' class='scaleRow scaleRow1'><div>");
          ruleBox.append("<div id='scaleRow2_" + i + "' class='scaleRow scaleRow2'><div>");
          ruleBox.append("<div id='scaleRow3_" + i + "' class='scaleRow scaleRow3'><div>");
          
          var scaleRow1 = $("#scaleRow1_" + i + "");
          var scaleRow2 = $("#scaleRow2_" + i + "");
          var scaleRow3 = $("#scaleRow3_" + i + "");
          scaleRow1.append('<label class="scaleLabel">' + $.i18n._("alrm.sntc.scale.when") + '</label>');
          
          // contain the inputs so they do not wrap under the label
          var scaleRow1Inputs = $('<div/>', {"class" : "manyInputs"}).appendTo(scaleRow1);
          scaleRow1Inputs.append(' <select id="meterName' + i + '" class="text-input meterName scaleSelect" name="meterName"></select>');
          scaleRow1Inputs.append('<select id="meterOperator' + i + '" class="text-input meterOperator scaleSelect" name="meterOperator"></select>');
          scaleRow1Inputs.append('<select id="meterStatistic' + i + '" class="text-input meterStatistic scaleSelect" name="meterStatistic"></select>');
          scaleRow1Inputs.append('<input id="meterValue' + i + '" name="meterValue" class="scaleInput meterValue"></input>');
          scaleRow1Inputs.append('<span id="meterValueUnit' + i + '" class="meterValueUnit"></span>');
          
          scaleRow2.append('<label class="scaleLabel">' + $.i18n._("alrm.sntc.for") + '</label> <input id="numIntervals' + i + '" name="numIntervals" class="scaleInput numIntervals"></input> ' + $.i18n._("alrm.sntc.cons.samps"));
          scaleRow3.append('<label class="scaleLabel">' + $.i18n._("alrm.sntc.cons.rate") + '</label><input id="cadence' + i + '" name="cadence" class="scaleInput cadence"></input> ' + $.i18n._("alrm.sntc.secs") + '.');
          
          ruleBox.find(".meterName").populateSelect(meterNames);
          ruleBox.find(".meterOperator").populateSelect(meterOperators);
          ruleBox.find(".meterStatistic").populateSelect(meterStatistics);
          
          
          var curMeterVal = $("#meterName" + i);
          
          ruleBox.addCheckbox("ruleEnabled" + i, $.i18n._("cmn.enabled"));
          $("#row_ruleEnabled" + i + " label").addClass("scaleLabel");
          
          curMeterVal.change(function() {
              var val = $(this).val();
               $(this).siblings(".meterValueUnit").html(meterUnits[val]);
          });
          
          // make sure the units match the first default in teh unit type
          curMeterVal.trigger("change");
      }     
}