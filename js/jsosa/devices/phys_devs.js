//var run_switches = function () {

(function(access) {
    var isWriteAccess = access.write;
    
    renderPhysDevsCreateBtn(isWriteAccess);
    renderPhysDevsFilters($("#physDevListFilter"), isWriteAccess);
    renderPhysDevsTableHeader(); 
    getCoDataAndRenderTable(isWriteAccess);   
    renderTopPagination(isWriteAccess);
    
    $("#physDevicesLoading").html($.i18n._("cmn.loading"));
    
    
    var pagingTarget = $("#tablePaging");    
    pagingTarget.addPaging(false, true, [".showMore"]);
    

    $("#showTableMore").click(function() {
        $(".physDevSlots").removeClass("hide");
    });
    $("#showTableLess").click(function() {
        $(".physDevSlots").addClass("hide");
    });
    // ----------------------------------------------------------------------
    // IMPORTANT. Code used to clear the interval when leaving the page.  
    // ----------------------------------------------------------------------
    osa.page.onUnload(function() {
        clearInterval($("#physDevList").data("pollIntervalHandle"));
    });

})(osa.auth.getPageAccess('physicalDevices'));


function renderPhysDevsTableHeader() {
    var status = $.i18n._("dev.hdr.status");
    var name = $.i18n._("dev.hdr.name");
    var ip = $.i18n._("dev.hdr.ip.addr");
    var co = $.i18n._("dev.hdr.co");
    var slots = $.i18n._("dev.hdr.slots");
    var edit = $.i18n._("dev.hdr.edit");
    var del = $.i18n._("dev.hdr.delete");
    var cloud = $.i18n._("cmn.cloud");
    var connectedTo = $.i18n._("dev.hdr.connected.to");
    var devType = $.i18n._("cmn.type");
    
    $("#physDevList").append('<tr id="physDevListHdr"><th class="thStatus">' + status + '</th><th class="thServOrd">' + name + '</th><th class="buff">' + devType + '</th><th class="buff">' + ip + '</th><th class="buff">' + connectedTo + '</th><th class="buff">' + co + '</th><th class="buff">' + cloud + '</th><th class="buff physDevSlots hide">' + slots + '</th><th class="actnBtn" align="center">' + edit + '</th><th class="actnBtn" align="center">' + del + '</th></tr>');
}




///////////////////////////////////////

// render page
function renderPhysDevsCreateBtn(isWriteAccess) {
    var actionContainer = $("#action-container");
    
    // add button to create
    if (actionContainer.length !== 0) {
        actionContainer.append('<a href="#" id="device-add-switch-btn" class="button btnMain"><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._("dev.create.phys.dev") + '</div></a>');
        
        
        $("#device-add-switch-btn").click(function(ev) {
            ev.preventDefault();
            renderCreatePhysDevice(isWriteAccess);
        });
    }
}

function getCoDataAndRenderTable(isWriteAccess) {
    var targetSel = $("#physDevCO");
    var coData = {};
    
    osa.ajax.list('centralOffices', function(coList) {
        
        if (coList.length == 0) {
            $("#tablePaging").addClass("hide");
            $("#physDevListFilter").addClass("hide");
            $("#physDevicesLoading").addClass("hide");
            
            $("#action-container").append('<div id="noCoAlert" class="statsContainer fr"><div class="warningStatus fl">Warning</div><div class="mainWarning fl">' + $.i18n._("dev.warn.need.co") + '</div></div>');
        }
        
        else {
            
            $("#tablePaging").removeClass("hide");
            $("#physDevListFilter").removeClass("hide");
            
            
            __coList = coList.sort(function(a, b) {
                if (a.displayName < b.displayName) {     return -1;}
                else {                                    return  1;}
            });
            
            targetSel.append("<option value=''>" + $.i18n._("cmn.all") + "</option>");
            
            for (var i=0; i<coList.length; i++) {
                coData[coList[i].key] = coList[i];
                targetSel.append("<option value='" + coList[i].key + "'>" + coList[i].displayName + "</option>");
            }
            
            // now render the table
            getDeviceData("", isWriteAccess);
            $("#physDevList").data("coData", coData);
            $("#physDevList").data("coList", __coList);
        }
        

        
    });    
}

function getDeviceData(co, isWriteAccess) {    
    var pollFreq = 3000;
    var pollContainer = $("#physDevList");
    
    clearInterval(pollContainer.data("pollIntervalHandle"));
    
    // do the first one immediately or you wait 5 seconds
    osa.ajax.list('physicalDevices', [co], function(data) {        
        renderDeviceTable(data, isWriteAccess);
        renderTopStatus(data);
    });
    
    
    // now set up polling
    var pollIntervalHandle = setInterval(function() {
        osa.ajax.list('physicalDevices', [co], function(data) {        
            renderDeviceTable(data, isWriteAccess);
            renderTopStatus(data);
        });
    }, pollFreq);
    pollContainer.data("pollIntervalHandle", pollIntervalHandle);
}

function renderDeviceTable(data, isWriteAccess) {
    var numberShown = 0;
    var numbertoShow = $("#serviceListPages").val();
    var target = $("#physDevList tbody");
    target.find("#physDevListHdr").siblings().remove();
    
    $("#physDevicesLoading").remove();
    
    // show no devices if there are none
    // add note where we later show it in the case of no devices
    var msgBox = $("#noPhysDevsWarning");
    if (data.length == 0) {
        
        msgBox.parent().removeClass("hide");
        msgBox.empty().append("<div class='mainInfo'>" + $.i18n._("devs.phys.devs.warn.none") + "</div>");
    }
    else {
        msgBox.parent().addClass("hide");
        $("#physDevList").removeClass("hide");
    }
    
    // -----------------------------------------
    // RENDER TABLE
    // -----------------------------------------
    var isEven = true;
    showHideClass = "";
    if ($("#showTableMore").is(":visible")) {
        showHideClass = "hide";
        $("#physDevList th.physDevSlots").addClass("hide");
    }
    else {
        $("#physDevList th.physDevSlots").removeClass("hide");
    }
        
    
    for (var j=0; j<data.length; j++) {
        var curDev = data[j];
        var coName = curDev.location.displayName;
        var devName = curDev.displayName;
        var status = curDev.readyStatus;
        var ip = curDev.adminIPAddress;
        var devType = curDev.physicalDeviceTypeName;
        var ports = curDev.portCollection;
        var portCollection = parsePorts(curDev.portCollection);
        var cloudName = curDev.networkCloudConnection && curDev.networkCloudConnection.cloudName || "";
        var cloudPort = curDev.networkCloudConnection && curDev.networkCloudConnection.networkFacingPortName || "";
        var connectName = curDev.networkPhysicalConnection && curDev.networkPhysicalConnection.networkPhysicalDeviceName;
        var connectPort = curDev.networkPhysicalConnection && curDev.networkPhysicalConnection.networkPhysicalDevicePortName;
        var devicePort =  curDev.networkPhysicalConnection && curDev.networkPhysicalConnection.networkFacingPortName;
        
        if (connectName == null) connectName  = "";
        if (devicePort == null)     devicePort = "";
        if (connectPort == null) connectPort = "";
        
        
        if (numbertoShow == "all" || numberShown < parseInt(numbertoShow)) { // stop rendering on number to show
            if ($("#physDevListFilter ." + data[j].readyStatus + " input").is(":checked")) { // filter on the filter.  If the status is checked, draw, else skip
                numberShown = numberShown + 1;
                var buttons = "<td></td><td></td>";
                
                if (isWriteAccess && status !== "deleting" && status !== "creating") {
                    var edtTxt = $.i18n._("btn.edit");
                    var delTxt = $.i18n._("btn.delete");
                    buttons = '<td align="center"><div id="edit-btn-' + j + '" class="block-edit-btn btnRound"><img title="' + edtTxt + '" src="images/edit.png"></div></td>' + 
                              '<td align="center"><div id="delete-btn-' + j + '" class="block-delete-btn btnRound"><img title="' + delTxt + '" src="images/delete.png"></div></td>';
               }
                
                target.append("<tr></tr>");
                
                var slots = "";
                
                for (var l in portCollection) {
                    // start with the 1 and get his babies then go to the 2 and get his

                    
                    var numInCol = portCollection[l];
                    var portBoxes = "";
                    
                    var physCnctNwFacingPort = data[j].networkPhysicalConnection && data[j].networkPhysicalConnection.networkFacingPortName;
                    var portClass = "";
                    
                    for (var n=0; n<numInCol; n++) {
                        var portNo = l + "." + (parseInt(n)+1);
                        if (physCnctNwFacingPort == portNo) portClass = "used";
                        else portClass = "";
                        
                        portBoxes = portBoxes + '<div id="device-port-block-' + portNo + '" class="portCollection-block device-port ' + portClass + '" title="' + portNo + '"><p class="displayName"></p></div>';
                    }
                    
                    slots = slots + '<div class="slot-collection"><span class="fl slotNumber">' + l + '</span>' + portBoxes + "</div>";
                }

                

                var cloudTitle = "";
                var devTitle = "";
                var conTitle = "";
                
                if (cloudPort !== undefined)
                    cloudTitle = ' title="' + cloudPort + '"';
                
                if (devicePort !== undefined) 
                    devTitle = ' title="' + devicePort + '"';
                
                if (connectPort !== undefined) 
                    conTitle = ' title="' + connectPort + '"';

                // STRIPE ROWS
                var trClass = "odd";
                if (isEven) trClass = "even";
                
                target.append('<tr id="row_' + j + '" class="physDev-list-block list-block-wide ' + trClass + '">' + 
                '<td class="mt10"><div class="status' + status + '">' + $.i18n._("dev.stat." + status) + '</div></td>' +                       
                '<td class="physDevName mt10" ' + devTitle + '>' + devName + '</td> ' +   
                '<td class="physDevLogin mt10">' + devType + '</td>' + 
                '<td class="physDevIP mt10">' + ip + '</td>' + 
                '<td class="physDevConnection mt10" ' + conTitle + '>' + connectName + '</td>' +
                '<td class="physDevCO mt10">' + coName + '</td>' +
                '<td class="physDevCloud mt10" ' + cloudTitle + '>' + cloudName + '</td>' + 
                '<td class="physDevSlots mt10 keyBox ' + showHideClass + '">' + slots + '</td>' +             
                buttons + '</tr>');   
                
                $("#edit-btn-" + j).data(data[j]).click(function() {
                    renderEditPhysDevice($(this).data());
                });
                $("#delete-btn-" + j).data({"id": data[j].key}).click(function() {
                    deletePhysDevice($(this).data());
                });
            }
        }
        

        

        
        isEven = !isEven;
    } // end for
        

}

function renderPhysDevsFilters(target, isWriteAccess) {
    target.addSelect("physDevCO", "cmn.cntrl.offc", false, false, "", "", "filterIndent");
    
    target.append("<div class='statsContainer fr' id='statusCenter'></div>");
//    target.append('<div class="filterShowMe" >Show me: </div>'); // TODO: use class
    
    // STATUS - need the class to ID the filter.  Do not remove.
    target.addCheckboxReverse("physDevReady", $.i18n._("dev.stat.readyForUse"), true, "statusFilter readyForUse clear") ; // = function (id, lbl, isChk, cls, hlp) {
    target.addCheckboxReverse("physDevCreateFailed", $.i18n._("dev.stat.createFailed"), true, "statusFilter createFailed") ; // = function (id, lbl, isChk, cls, hlp) {
    target.addCheckboxReverse("physDevDeleteFailed",  $.i18n._("dev.stat.deleteFailed"),  true, "statusFilter deleteFailed") ; // = function (id, lbl, isChk, cls, hlp) {
    target.addCheckboxReverse("physDevCreating", $.i18n._("dev.stat.creating"), true, "statusFilter creating") ; // = function (id, lbl, isChk, cls, hlp) {
    target.addCheckboxReverse("physDevDeleting", $.i18n._("dev.stat.deleting"), true, "statusFilter deleting") ; // = function (id, lbl, isChk, cls, hlp) {
    

    

    $("#physDevReady").change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });
    $("#physDevCreateFailed").change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });
    $("#physDevDeleteFailed").change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });
    $("#physDevCreating").change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });
    $("#physDevDeleting").change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });    
    $("#physDevCO").change(function () {
        getDeviceData($(this).val(), isWriteAccess);
    });
}

// UTILITY

function parsePorts (portList) {
    var slots = {};

    for (var i = 0; i < portList.length; i++) {
        slotNum = portList[i].displayName.split('.')[0];
        slots[slotNum] = (slots[slotNum]) ? (slots[slotNum] + 1) : 1;
    }

    return slots;
};


function deletePhysDevice(data) {

   if (confirm($.i18n._("dev.prmpt.dltDev"))) {
       osa.ajax.remove('physicalDevices', data.id, function() {
           $("#physDevCO").trigger("change");
       });
   }
};


function renderTopPagination(isWriteAccess) {
    // PAGINATION
    
    var target = $("#tablePaging");
    var optList = [
        {"str" : $.i18n._("cmn.all"), "val" : "all"}, 
        {"str" : "3", "val" : "3"},
        {"str" : "5", "val" : "5"},
        {"str" : "10", "val" : "10"},
        {"str" : "20", "val" : "20"},
        {"str" : "50", "val" : "50"},
    ];
    
    target.attr("style", "height:24px")
    
    target.addSelect("serviceListPages", $.i18n._("dev.fltr.num.page"), false, false, optList, "all");
    $("#row_serviceListPages").removeClass("row").removeClass("form-input-block").addClass("pagingInput fl");
    target.append("<div id='viewingXofY' class='fl'></div><div id='paging' class='fl'></div>");
    
    target.change(function () {
        getDeviceData($("#physDevCO").val(), isWriteAccess);
    });
}




function renderTopStatus(data) {
    // TODO: replace this when I get a good API for status based numbers
    var statusCenter = $("#statusCenter");
    // Failed
    var createFailedCount = 0;
    var deleteFailedCount = 0;
    // Pending
    var creatingCount = 0;
    var deletingCount = 0;
    for (var i in data) {
        var status = data[i].readyStatus;
        
        if (status == "createFailed") createFailedCount++;
        if (status == "deleteFailed") deleteFailedCount++;
        
        if (status == "creating") creatingCount++;
        if (status == "deleting") deletingCount++;
    }
    
    statusCenter.empty();
    
    if (createFailedCount == 0 && creatingCount == 0 && deleteFailedCount == 0 && deletingCount == 0){ // show all is well
        if (data.length !== 0)
            statusCenter.append("<div class='soDetails statusreadyForUse'>" + $.i18n._("dev.stat.all.ready") + "</div>");
    }
    else {
        
        // Failed
        var physDevCreateFailedStat = "<div class='soDetails fl clickStatus statuscreateFailed'>" + createFailedCount + " " + $.i18n._("dev.stat.createFailed") + "</div>";
        var physDevDeleteFailedStat = "<div class='soDetails fl clickStatus statusdeleteFailed'>" + deleteFailedCount + " " + $.i18n._("dev.stat.deleteFailed") + "</div>";
        
        if (createFailedCount > 0) statusCenter.append(physDevCreateFailedStat);
        if (deleteFailedCount > 0) statusCenter.append(physDevDeleteFailedStat);
        
        // Pending
        var physDevCreatingStat = "<div class='soDetails fl clickStatus statuscreating'>" + creatingCount + " " + $.i18n._("dev.stat.creating") + "</div>";
        var physDevDeletingStat = "<div class='soDetails fl clickStatus statusdeleting'>" + deletingCount + " " + $.i18n._("dev.stat.deleting") + "</div>";
        
        if (creatingCount > 0) statusCenter.append(physDevCreatingStat);
        if (deletingCount > 0) statusCenter.append(physDevDeletingStat);
    }
    
    
    $(".statuscreateFailed").click(function() {
        var check = $("#physDevCreateFailed");
        check.parent().siblings(".form-input-block").children("input").removeAttr("checked");
        check.prop("checked", "checked");
        check.trigger("change");
    });
    
    
    $(".statusdeleteFailed").click(function() {
        var check = $("#physDevDeleteFailed");
        check.parent().siblings(".form-input-block").children("input").removeAttr("checked");
        check.prop("checked", "checked");
        check.trigger("change");
    });
    
    $(".statuscreating").click(function() {
        var check = $("#physDevCreating");
        check.parent().siblings(".form-input-block").children("input").removeAttr("checked");
        check.prop("checked", "checked");
        check.trigger("change");
    });
    
    $(".statusdeleting").click(function() {
        var check = $("#physDevDeleting");
        check.parent().siblings(".form-input-block").children("input").removeAttr("checked");
        check.prop("checked", "checked");
        check.trigger("change");
    });
}


//};