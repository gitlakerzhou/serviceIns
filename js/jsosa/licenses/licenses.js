//var run_Licensing = function() {


(function(access) {
    var PREFIX = "lic.label";
    
    var renderPage = function() {
        var target = $("#actionContainer");
        target.addBigButton("lic.btn.add", "addLicenseBtn", "hide");
        target.append('<div id="updateLicenseBtn" class="button btnSm" style="display:none">' + $.i18n._("lic.btn.update") + '</div>');


        var target = $("#licensesSection");
        target.append('<div id="licenseForm"></div><div id="licenseCards"></div>');
    };
    
    var renderFailMsg = function(idMain, idStr, failMsg) {
        var strFailed = $.i18n._("stat.failed");
        return '<div class="negativeMsg"  style="display: none;" id="' + idMain + '"><img src="images/fail.png" alt="' + strFailed + '" title="' + strFailed + '">' + $.i18n._(failMsg) + ' <div id="' + idStr + '"></div></div>';
    };
    
    var renderSuccessMsg = function(id) {
        return '<div class="affirmativeMsg"  style="display: none;" id="' + id + '"></div>';
    };
    
    var renderForms = function() {
        var target = $("#licenseForm");
        
        // --------------------------------------
        // add a new one
        // --------------------------------------
        target.append("<form style='display: none;' class='add inlineForm'></form>");
        var form = target.find(".add");

        form.addFormTitle("lic.hdr.add");
        form.append(renderSuccessMsg("successMsgAdd") + renderFailMsg("failureMsgAdd", "errorFromApiAdd", "lic.msg.fail.on.add"));
        form.append('<label for="newLicenseTxt" class="licenseLabel">' + $.i18n._("lic.add.help") + '</label>');
        form.append('<textarea id="newLicenseTxt" name="newLicenseTxt" class="licenseText"></textarea>');
        
        form.append('<div class="cancelBtn button btnCancelAdd btnSm fr">' + $.i18n._("btn.cancel") + '</div>');
        form.append('<div class="addBtn button btnSm fr">' + $.i18n._("lic.btn.save") + '</div>');
        

        
        // CANCEL SUBMIT OF A NEW LICENSE
        $(".btnCancelAdd").click(function() {
            $("#licenseForm .add").hide("slow");
            $("#licenseForm .add select").val("");
            $("#licenseForm .add textarea").val("");
        });
        
        
        // SUBMIT A NEW A LICENSE
        $(".addBtn").click(function() {
            var form = $("#licenseForm .add");
            
            if (form.valid()) {
                var successMsg = $("#successMsgAdd");
                var failMsg = $("#failureMsgAdd");
                var failMsgApi = $("#errorFromApiAdd");
                var licenseObj = $("#newLicenseTxt");
                var licenseText =  licenseObj.val();
                
                // Always only ESO now
                var o = {
                        "licenseType" : "ESO",
                        "encryptedLicense" : licenseText
                };
                
                $("#successMsgAdd").html();
                
                
                osa.ajax.add('licenses', o, function(resp) {
                    successMsg.html('<img src="images/check.png" alt="' + $.i18n._("stat.success") + '" title="' + $.i18n._("stat.success") + '"> ' + $.i18n._("lic.msg.success.add", "ESO"));
                    successMsg.show("slow");
                    successMsg.siblings().hide("slow");
                    licenseObj.val("");
                    renderLicenseStatus();
                }, 
                
                // FAIL
                function(resp) {
                    failMsgApi.html(resp.responseJSON.status);
                    failMsg.show("slow");
                });
            }
            

        });
        
        // --------------------------------------        
        // update an existing
        // --------------------------------------        
        target.append("<form style='display: none;' class='update inlineForm'></form>");
        var form = target.find(".update");

        form.append("<div class='formTitle'>" + $.i18n._("lic.hdr.update") + "</div>");
        form.append(renderSuccessMsg("successMsgUpdate") +  renderFailMsg("failureMsgUpdate", "errorFromApiUpdate", "lic.msg.fail.on.update"));
        form.append('<label for="updateLicenseTxt" class="licenseLabel"></label><textarea id="updateLicenseTxt" name="updateLicenseTxt" class="licenseText"></textarea>');
        
        form.append('<div class="cancelBtn button btnCancelUpdate btnSm fr">' + $.i18n._("btn.cancel") + '</div>');
        form.append('<div class="updateBtn button btnUpdate btnSm fr">' + $.i18n._("lic.btn.save") + '</div>');
        
        
        $(".btnCancelUpdate").click(function() {
            $("#licenseForm .update").hide("slow");
        });
        
        $(".updateBtn").click(function() {
            var key = $("#licenseForm").data("key");
            var successMsg = $("#successMsgUpdate");
            var failMsg = $("#failureMsgUpdate");
            var failMsgApi = $("#errorFromApiUpdate");
            var textBox =  $("#updateLicenseTxt");
            
            var o = {
                    "key" : key, 
                    "licenseType" : "ESO", // always ESO
                    "encryptedLicense" : textBox.val()
            };
            
            
            failMsg.hide("slow");
            
            osa.ajax.update('licenses', o, function(resp) {
                successMsg.show("slow");
                textBox.val("");
                successMsg.siblings().hide();
                renderLicenseStatus();
            }, 
            
            // FAIL
            function(resp) {
                failMsgApi.html(resp.responseJSON.status);
                failMsg.show("slow");
            });
            

            
        });
    };
    
    renderPage();
    renderForms();
    
    // SHOW ADD A LICENSE FORM
    $("#addLicenseBtn").click(function() {
        $("#licenseForm .update").hide("slow");
        $("#licenseForm .add").show("slow");
    });
    
    // SHOW UPDATE A LICENSE FORM
    $("#updateLicenseBtn").click(function() {
        var dta = $(this).data();
        var update = $("#licenseForm .update");
        var successMsg = $("#successMsgUpdate");
        var failMsg = $("#failureMsgUpdate");
        
        // in case error message or success message is showing, close this and clean house
        update.hide("slow");
        $("#licenseForm .add").hide("slow");
        
        // clean house
        $("#updateLicenseTxt").val("");
        successMsg.siblings().show();
        successMsg.hide();
        failMsg.hide();
        


        // ready to see clean form
        update.show("slow");
        update.data(dta);
        
        
        successMsg.html('<img src="images/check.png" alt="' + $.i18n._("stat.success") + '" title="' + $.i18n._("stat.success") + '"> ' + $.i18n._("lic.msg.success.update", "ESO"));
        update.find(".licenseLabel").html($.i18n._("lic.update.help", name));
    });
    
    
    var renderLicenseStatus = function() {
        osa.ajax.list('licenses', function(data) {
            
             $("#licenseCards").empty().append("<div class='' id='dataCenter'></div>");
            
            // tell the user in case there are no licenses
            if (data.length == 0) {
                $("#licenseCards").append("<div class='mainInfo'>" + $.i18n._("lic.none") + "</div>");
                $("#addLicenseBtn").show();
                $("#updateLicenseBtn").hide();
            }
            else {
                $("#addLicenseBtn").hide();
                $("#updateLicenseBtn").show();
                
                // always only 1 returned from API, so pick the 0th
                var i = 0;

                
                // render layout
                target = $("#dataCenter");
                target.append("<div id='showScriptTitle'></div><div id='showScript'></div>");
                target.append("<table id='licenseDataTable' class='fancyTable mt50'><tr id='licenseDataHeaders'></tr><tr id='licenseDataValues'></tr></table><table class='scriptAllowsPercent fancyTable mt50' id='scriptAllowsPercent'></table>");
                target.append("<div id='youAreUsingTitle'></div><div id='youAreUsing'></div>");
                
                $("#scriptAllowsTitle").html("<span class='licenseTypeName'></span>");
                            
                var curData = data[i];
                var scriptAllowsPercent = $("#scriptAllowsPercent");
                var licenseDataHeaders = $("#licenseDataHeaders");
                var licenseDataValues = $("#licenseDataValues");
                
                // need this later for update
                $("#licenseForm").data("key", curData.key);
                
                // render the pretty percents and other attributes
                scriptAllowsPercent.empty();
                scriptAllowsPercent.append('<tr><th>' + $.i18n._("lic.hdr.instance") + '</th><th>' + $.i18n._("lic.hdr.allowed") + '</th><th colspan="2">' + $.i18n._("lic.hdr.used") + '</th></tr>');
                
                // clear warnings above
                $("#mainAlerts .licensing").remove();
                
                for (var x in curData) {
                    if (x !== "encryptedLicense" && x !== "key" && x !== "licenseType" && x.indexOf("Percent") == -1) { // ignore percents because I will get them by hand
                        
                        var percentProp = x + "PercentUsed";
                        
                        if (curData[percentProp] !== undefined) {
                            var pcnt = curData[percentProp];
                            var colorStyle = "percentMeterGood";
                            
                            if (pcnt > 85) colorStyle = "percentMeterBad";
                            else if (pcnt > 75) colorStyle = "percentMeterWarn"; 
                            
                            // we may go over 100 if you have 2 clouds and now a license for 1 for example
                            var renderPcnt = pcnt;
                            
                            if (pcnt > 100)
                               renderPcnt = 100;
                               
                            var serviceMeter = '<div class="percentMeter"><div class="percentMeterFiller ' + colorStyle + '" style=width:' + renderPcnt + 'px></div></div>';
                            scriptAllowsPercent.append("<tr><td class='percentMeterName'>" + getPrettyStringOrNot(PREFIX, x) + "</td><td class='percentMeterVal'> " + curData[x] + "</td><td class='percentMeterPercent'> " + pcnt + "%</td><td>" + serviceMeter + "</td></tr>");
                        }
                        else {
                            // ------------------------------------------------------
                            // EXPIRATION - SPECIAL CASE
                            // ------------------------------------------------------
                            // if expiration date, there are some special things to check and do
                            if (x == "expiration") {
                               
                               var licDate = convertLicenseDateToDate(curData);
                               var curDate = new Date();
                               var oneMoLater = getOneMonthFromToday();
                               var classToUse = "allIsWellBox";
                               
                               // expired!!
                                if (licDate <= curDate) {
                                  classToUse = "severeBox";
                                  
                                  $("#mainAlerts").html('<div class="alarmSevere licensing">' + $.i18n._("lic.expd") + '</div>');
                                  $("#mainAlerts .licensing").click(function() {
                                      osa.page.load(licenseURL);
                                  });
                                }
                               
                                // expiring in a month or less
                                else if (licDate <= oneMoLater) {
                                   classToUse = "majorBox";
                                   
                                   var prettyDt = curData.expiration.split(" ")[0];
                                   
                                  $("#mainAlerts").html('<div class="alarmModerate licensing">' + $.i18n._("lic.exps") + ': ' + prettyDt + '</div>');
                                  $("#mainAlerts .licensing").click(function() {
                                      osa.page.load(licenseURL);
                                  });
                               }
                               
                               licenseDataHeaders.prepend("<th class='licenseDataName'>" + getPrettyStringOrNot(PREFIX, x) + " </th>");
                               licenseDataValues.prepend("<td class='licenseDataVal pr10'><div class='" + classToUse + "'>" + curData[x] + "</div></td>");
                            }
                            
                            // NOT EXPIRATION
                            else{
                                var curX = curData[x];
                                var center = "";
                                
                                if (curX == true) {
                                    curX = '<img class="stat_active" title="' + $.i18n._("lic.hvr.ebi.enabled") + '" alt="' + $.i18n._("lic.hvr.ebi.enabled") + '" src="images/check.png">';
                                    center = "center";
                                }
                                if (x == "nodeLock" && curX == "") {
                                    curX = "No lock set";
                                }
                             licenseDataHeaders.append("<th class='licenseDataName " + center + "'>" + getPrettyStringOrNot(PREFIX, x) + " </th>");
                             licenseDataValues.append("<td class='pt10 licenseDataVal " + center + "'>" + curX + "</td>");
                            }
                               
                        }
                    }
                }
            }
            



         });
    };
    
    
    renderLicenseStatus();

    
})(osa.auth.getPageAccess('licenses'));


function getPrettyStringOrNot(prefix, str) {
    var combo = prefix + "." + str;
    var translated = $.i18n._(combo);
    
    if (translated == combo)
        return str;
    else
        return translated;
}


//};