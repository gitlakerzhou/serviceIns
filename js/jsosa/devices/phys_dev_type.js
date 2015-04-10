//@ sourceURL=http://localhost:8080/ajax/locations-centralOffices.js
//var run_cos = function() {    
(function() {
    var isWriteAccess = osa.auth.getPageAccess('physicalDevices').write;
    var page = $("#physDeviceTypes");
    
    $("#physDeviceTypeLoading").html($.i18n._("cmn.loading")).addClass("hide");
    
    page.removeClass("hide");

    osa.ajax.list('physicalDeviceType', function(phyDeviceData) {
        for (var i=0; i<phyDeviceData.length; i++) {
            renderCardForDevice(phyDeviceData[i], isWriteAccess);
        }
    });

})();


function renderCardForDevice(dataObj, isWriteAccess) {
    var id = dataObj.key;
    
    $("#physDeviceTypes").append('<div id="phyDevTypeBlock' + id + '" class="list-block"></div>');
    
    var card = $("#phyDevTypeBlock" + id);
    card.data("id", id);
    
    card.append('<div class="hdrForVNFs"><span class="vnfdisplayName">' + dataObj.displayName + '</span></div>');
    
    if (isWriteAccess) {
        card.append('<div class="row oneThird"><label>' + $.i18n._("dev.family") + '</label><div>' + dataObj.deviceFamily + '</div></div>');
        card.append('<div class="row oneThird"><label>' + $.i18n._("dev.model.num") + '</label><div>' + dataObj.modelNumber + '</div></div>');
        card.append('<div class="row oneThird"><label>' + $.i18n._("dev.vendor") + '</label><div>' + dataObj.vendor + '</div></div>');
        card.append('<div class="insideHdr clear"></div>');
    }
    
    // buttons
    if(isWriteAccess) {
        card.append('<div class="btnContainer btnGutter"></div>');
        card.find(".btnContainer").append('<a class="addBwProfileBtn button btnAdd" href="#"><span class="typcn typcn-plus"></span>' + $.i18n._("dev.btn.add.bw") + '</a>'); 
    }

  
    // location form
    card.append('<form class="bandwidthInputBlock hide"></form>');
    
    var form = card.find(".bandwidthInputBlock");
  
    form.addTextInput("name_" + id, "cmn.name", true, "", "miniLabel");
    form.addTextInput("cir_" + id, "dev.cir", true, "", "miniInput", "dev.hvr.cir");
    form.addTextInput("eir_" + id, "dev.eir", true, "", "miniInput", "dev.hvr.eir");
    form.addTextInput("cbs_" + id, "dev.cbs", true, "", "miniInput", "dev.hvr.cbs");
    form.addTextInput("ebs_" + id, "dev.ebs", true, "", "miniInput", "dev.hvr.ebs");
    
    $("#cir_" + id).after("&nbsp;bps&nbsp;&nbsp;&nbsp;");
    $("#eir_" + id).after("&nbsp;bps&nbsp;&nbsp;&nbsp;");
    $("#cbs_" + id).after("&nbsp;bytes");
    $("#ebs_" + id).after("&nbsp;bytes");
    
    form.append('<input id="cancel_bw_btn' + id + '" class="button btnClear btnCancel fr" type="submit" value="' + $.i18n._("btn.close") + '">');
    form.append('<input id="save_bw_btn' + id + '" class="button btnClear btnSave" type="submit" value="' + $.i18n._("dev.btn.save.bw") + '">');
    
    card.append('<div class="successMsg hide">' + $.i18n._("dev.msg.success.bw") + '</div>');
    
    // add table
    if (dataObj.bwprofilesCollection.length > 0) {
        var bw = dataObj.bwprofilesCollection;
        card.append("<div class='bandwidthBlock clear'><table cellspacing=0><tr><th class='innerTableHeader'>" + $.i18n._("dev.hdr.name") + "</th><th class='innerTableHeader' title='" + $.i18n._("dev.hvr.cir") + "'>" + $.i18n._("dev.hdr.cir") + "</th><th class='innerTableHeader' title='" + $.i18n._("dev.hvr.eir") + "'>" + $.i18n._("dev.hdr.eir") + "</th><th class='innerTableHeader' title='" + $.i18n._("dev.hvr.cbs") + "'>" + $.i18n._("dev.hdr.cbs") + "</th><th class='innerTableHeader' title='" + $.i18n._("dev.hvr.ebs") + "'>" + $.i18n._("dev.hdr.ebs") + "</th><th class='innerTableHeader'></th></tr></table></div>");
        repopulateBandwidthProfileTable(bw, card.find("table"), isWriteAccess);
    }
    
    
    // VALIDATION
    form.validate();

    
    $("#cancel_bw_btn" + id).click(function(ev){
        ev.preventDefault();
        var card = $(this).closest(".list-block");
        var bandwidthInputBlock = card.find(".bandwidthInputBlock");
        card.find("input").not(".button").val("");
        bandwidthInputBlock.hide("slow");
    });
    
    $("#save_bw_btn" + id).click(function(ev){
        ev.preventDefault();
        
        var card = $(this).closest(".list-block");
        
        if (card.find(".bandwidthInputBlock").valid()) {
            var id = card.data("id");
            var name = $("#name_" + id).val();
            var cir = $("#cir_" + id).val();
            var eir = $("#eir_" + id).val();
            var cbs = $("#cbs_" + id).val();
            var ebs = $("#ebs_" + id).val();
        
            var o = {
                    "displayName": name,
                    "cir" : cir,
                    "eir" : eir,
                    "cbs" : cbs,
                    "ebs" : ebs,
                    "deviceTypeKey"    : id
            };
            
            osa.ajax.add('customBandwidthProfiles', o, function() {
                osa.ajax.get("customBandwidthProfiles", id, function(data) {
                    updateTableWithBandwidthProfiles(data, "phyDevTypeBlock" + id, isWriteAccess);
                });
            });
        }
    });
    
    card.find(".addBwProfileBtn").click(function(ev){
        ev.preventDefault();
        var card = $(this).closest(".list-block");
        var bandwidthInputBlock = card.find(".bandwidthInputBlock");
        card.find("input").not(".button").val("");
        
        bandwidthInputBlock.show("slow").css("display", "inline-block");
    });
  }

    
function repopulateBandwidthProfileTable(data, table, isWriteAccess) {
    for (var j=0; j<data.length; j++) {
        var id = data[j].key;
        var deviceTypeKey = data[j].deviceTypeKey;
        var delBtn = "";
        
        if (isWriteAccess) {
            var altTxt = $.i18n._("btn.deleteCtx", $.i18n._("dev.locs"));
            delBtn = '<a id="del_loc_' + data[j].key + '"class="delete_loc_btn btnRound fr" href="#" title="' + altTxt + '" alt="' + altTxt + '"><img src="images/delete.png"></a>';
        }
    
        table.append("<tr><td>" + data[j].displayName + "</td><td>" + data[j].cir + "</td><td>" + data[j].eir + "</td><td>" + data[j].cbs + "</td><td>" + data[j].ebs + "</td><td>" + delBtn + "</td></tr>");
        
        if (isWriteAccess) {
            $("#del_loc_" + id).data("id", id);
            
            $("#del_loc_" + id).click(function(ev) {
                var bwId = $(this).data("id");
        
                if (confirm($.i18n._("dev.prmpt.del.bw"))) {
                    osa.ajax.remove('customBandwidthProfiles', bwId, function(ev) {
                        
                        osa.ajax.get("customBandwidthProfiles", deviceTypeKey, function(data) {
                            updateTableWithBandwidthProfiles(data, "phyDevTypeBlock" + deviceTypeKey, isWriteAccess);
                        });
                    });
                }
            });
        }
    }
}

function updateTableWithBandwidthProfiles(data, target, isWriteAccess) {
    var successMsg = $("#" + target).find(".successMsg");
    // show message
    successMsg.show("slow");

    // -----------
    // table
    // -----------
    var table = $("#" + target).find("table");
    
    // make sure we have a table
    if (table.length == 0) {      
        $("#" + target).append("<table cellspacing=0></table>");
        table = $("#" + target).find("table");
    }

    // now we can empty it
    table.empty();
    
    // and fill it
    if (data.length > 0) {
        table.append("<tr><th class='innerTableHeader'>" + $.i18n._("dev.hdr.name") + "</th><th class='innerTableHeader'>" + $.i18n._("dev.hdr.cir") + "</th><th class='innerTableHeader'>" + $.i18n._("dev.hdr.eir") + "</th><th class='innerTableHeader'>" + $.i18n._("dev.hdr.cbs") + "</th><th class='innerTableHeader'>" + $.i18n._("dev.hdr.ebs") + "</th><th class='innerTableHeader'></th></tr>");
        repopulateBandwidthProfileTable(data, table, isWriteAccess);
    }

    // clear up form
    var form = table.closest(".list-block");
    form.find("input").not(".button").val("");
    
    // hide success
    setTimeout(function(){successMsg.hide("slow");}, 2000);
}

//};