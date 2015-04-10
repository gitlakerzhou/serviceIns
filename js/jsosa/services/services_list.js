// Copyright 2014 Overture Networks
//var run_ServiceList = function() {

// ----------------------------------------------------------------
// ANATOMY of the DATA OBJECT - managing log line and polling
// ----------------------------------------------------------------
// Initial load. The page is polling
//
// (page interval handle)  (# of handle)
// intHandlePage           11
//
// ----------------------------------------------------------------
// Show logs while page is reloading
//
// (soID)            (scrollTop)
// 4                        0
// 100                      0
//
// tablePollHandle         11
//
//
// ----------------------------------------------------------------
// Show logs while page is reloading after scrolling the logs
//
// 4                      457
// 100                    615
//
// tablePollHandle         11
//
//
//
// ----------------------------------------------------------------
// Stop Updates (useless?)
//  
// 4                      457
// 100                    615
//
// tablePollHandle         11
//
//
//
// ----------------------------------------------------------------
// Show Updates for one of two open logs with no page reload
//
// 4                      457
// 100                    615
//
// tablePollHandle         11
//
// logPollHandles         {}
//
//        (soID)              (# of handle)
//          100                    62
//
//
// ----------------------------------------------------------------
// Show Updates for two open logs with no page reload
//
// 4                      457
// 100                    615
//
// tablePollHandle         11
//
// logPollHandles          {}
//        4                       60
//        100                     62
// ----------------------------------------------------------------





    

// called after a submit even before the success dialog is closed.
(function(access) {
    var isWriteAccess = access.write;
    var REFRESH_TIMER = 10000;
    
    // jQUERY DIALOG STUFF
    $("#dialogLog").dialog({ autoOpen: false, title: $.i18n._("srvc.ttl.errLog"), resizable: true });
    if ($("#logRefreshButton").length == 0)
        $("#dialogLog").siblings(".ui-dialog-titlebar").append('<button id="logRefreshButton" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-refresh" role="button" aria-disabled="false"> <span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span> <span class="ui-button-text">' + $.i18n._("btn.rfrsh.log") + '</span> </button>');
    
    // I18N
    $("#soListLoading").html($.i18n._("cmn.loading"));
    
    // START THE PAGE
    renderServiceListPage();
    renderServiceListStatuses();
    renderServiceListFilters(isWriteAccess);
    $("#no-services-warning").append("<div class='mainInfo'>" + $.i18n._("srvc.warn.none") + "</div>");
    
    // jQUERY DIALOG STUFF
    $("#logRefreshButton").click(function() {
        $("#" + $("#logRefreshButton").data("targetName")).trigger("click");
    });


    // RENDER THE TABLE
    // first get data that the table will use later
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        var table = $("#servicelist");
        var mapVNFsIsSwitch = {};
        
        for (var i = 0; i < vnfList.length; i++) {
            mapVNFsIsSwitch[vnfList[i].displayName] = (vnfList[i].vnfTypeAttributes[0] && vnfList[i].vnfTypeAttributes[0].name == "OvrSwitch") || false;
        }
        table.data("switchMap", mapVNFsIsSwitch);
        
        // THIS DRAWS MOST OF THE PAGE
        renderTable(isWriteAccess);       
    });

    
    // JUNK
    $serviceList = $("#servicelist");
    $serviceBlockTemplate = $("#service-block-template");
    $serviceOrderDetails = $("#service_order_details");


    // --------------------------------------------------------------
    // SET UP POLLING
    // --------------------------------------------------------------    
    var tablePollHandle = setInterval(function(isWriteAccess) {
        renderTable(isWriteAccess);
    }, REFRESH_TIMER, isWriteAccess);
    
    $("#servicelist").data("tablePollHandle", tablePollHandle);

    
    // --------------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------------
    
    // Called when the Create button is clicked and when the creation is submitted
    osa.page.onUnload(function() {
        endTablePoll();
        endLogsPoll();
    });

    // DELETE BUTTON
    osa.page.addPageEvent('.stop-btn', 'click', function(ev) {
        ev.preventDefault();
        var who = $(ev.target).parent().data('id');
        if ((who) && (confirm($.i18n._("srvs.prmpt.dltSrvc")))) {
            osa.ajax.remove('services', who, function() { 
                renderTable(isWriteAccess);
            });
        };
    });
    
    // EDIT BUTTON
    osa.page.addPageEvent('.edit-btn', 'click', function(ev) {
        ev.preventDefault();
        var who = $(ev.target).parent().data('id');
        location.href = "#services-edit/key=" + who;
    });
    
    // EDIT BUTTON 2
    osa.page.addPageEvent('.edit-btn-2', 'click', function(ev) {
        ev.preventDefault();
        var who = $(ev.target).parent().data('id');
        location.href = "#services-edit-2/key=" + who;
    }); 
    
    // VIEW VNF LOG BUTTON
    osa.page.addPageEvent('.logVnfBtn', 'click', function(e) {
        var data = $(this).data();
        var vnfId = data.vnfId;
        var serviceOrderId = data.soId;
        var esoServerLogId = '0';
        
        e.preventDefault();
        
        osa.ajax.list('logDetails', [ esoServerLogId, serviceOrderId, vnfId], function(data) {
            renderLog(e, data, "vnf_id_" + vnfId);
        });
    });
    
    // ------------------------------------------------------
    // BOOKKEEPING 
    // ------------------------------------------------------
    var sl = $("#servicelist");
    if (!sl.data("openRows")) sl.data("openRows", {});     // for the openRows for reload
    if (!sl.data("openLogs")) sl.data("openLogs", {});     // for the open logs' scroll depth for reload
    
    osa.page.addPageEvent(".showRow", "click", function(e) {
        var data = $(this).data();
        var serviceOrderId = data.id;
        var thisTd = $(this).closest("td");
        var hideRowBtn = thisTd.find(".hideRow");
        
        sl.data("openRows")[serviceOrderId] = true;   
        
        $("#vnfInstances_" + serviceOrderId).removeClass("hide");
        $("#intrCnctList_" + serviceOrderId).removeClass("hide");

        $(this).addClass("hide");
        hideRowBtn.removeClass("hide");
    });

    osa.page.addPageEvent(".hideRow", "click", function(e) {
        var data = $(this).data();
        var serviceOrderId = data.id;
        var thisTd = $(this).closest("td");
        var showRowBtn = thisTd.find(".showRow");
        
        delete(sl.data().openRows[serviceOrderId]);
        
        $("#vnfInstances_" + serviceOrderId).addClass("hide");
        $("#intrCnctList_" + serviceOrderId).addClass("hide");
        
        $(this).addClass("hide");
        showRowBtn.removeClass("hide");
    });
    
    // CALLER NETWORK CONNECTIVITY TEST INIT
    osa.page.addPageEvent('.cncBtn', 'click', function(ev) {
        ev.preventDefault();
        var soid = $(ev.target).closest("td").data("id");
        var o = {"key" : soid};
        
        osa.ajax.add('networkConnectivityTest', o, function() { // success
            alert($.i18n._("srvc.msg.nct.init.success"));
        }, function() { // fail
            alert($.i18n._("srvc.msg.nct.init.fail"));
        });

    });
        
    // VIEW LOG BUTTON
    osa.page.addPageEvent('.logBtn', 'click', function(e) {        
        var serviceOrderId = ($(this).data("id"));
        var esoServerLogId = "0";
        
        e.preventDefault();

        renderServiceOrderLog(esoServerLogId, serviceOrderId);

        return false;
    });    

})(osa.auth.getPageAccess('services'));


// --------------------------------------------------------------
// RENDER FUNCTIONS
// --------------------------------------------------------------

function renderServiceListPage() {
    var actionBar = $("#action-container");
    if (actionBar.length !== 0) {
        actionBar.append('<a href="#services-create" id="add-service-btn-2" class="button btnMain"><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._("srvc.crtService") + '</div></a>');        
        actionBar.append("<div class='statsContainer fr pl20px' id='statusCenter'></div>");
           
    }
    
    $("#serviceListLimits").appendLicenseStatus("ESO", ["maxServices", "maxVNFs", "maxCores"], "serviceListLimitTable");     
}


function renderServiceListStatuses() {
    var statusCenter = $("#statusCenter");

    var tenantId = "0"; // use carrier tenant_id (or 0) for all services and customer tenant_id for specific tenant
    osa.ajax.get('servicesStatistics', [tenantId], function(data) {
        var failedCount = data.failedServices;
        var pendingCount = data.pendingServices;
        var deletingCount = data.deletingServices;
        var terminatedCount = data.terminatedServices;
            
            
        if ((failedCount + pendingCount + deletingCount + terminatedCount) == 0 && data.length > 0) // show all is well
            statusCenter.empty().append("<div class='soDetails runningStatus'>" + $.i18n._("srvc.msg.all.running") + "</div>");
        else {
            var failStat = getIssueBadge("failed", failedCount);
            var pendingStat = getIssueBadge("pending", pendingCount);
            var deletingStat = getIssueBadge("deleting", deletingCount);
            var terminatedStat = getIssueBadge("terminated", terminatedCount);

            
            // Clear
            statusCenter.empty();
            
            // Render
            if (pendingCount > 0) statusCenter.append(pendingStat);
            if (deletingCount > 0) statusCenter.append(deletingStat);
            if (terminatedCount > 0) statusCenter.append(terminatedStat);
            if (failedCount > 0) statusCenter.append(failStat);
                
        }
            
        
        // click actions
        $(".failedClickStatus").click(function() {
            $(".statusFilter input").removeAttr("checked");
            $("#serviceListFailed").prop("checked", "checked");
            $("#serviceListFailed").trigger("change");
        });
        
        $(".pendingClickStatus").click(function() {
            $(".statusFilter input").removeAttr("checked");
            $("#serviceListPending").prop("checked", "checked");
            $("#serviceListPending").trigger("change");
        });
        
        $(".deletingClickStatus").click(function() {
            $(".statusFilter input").removeAttr("checked");
            $("#serviceListDeleting").prop("checked", "checked");
            $("#serviceListDeleting").trigger("change");
        });

        $(".terminatedClickStatus").click(function() {
            $(".statusFilter input").removeAttr("checked");
            $("#serviceListTerminated").prop("checked", "checked");
            $("#serviceListTerminated").trigger("change");
        });               
    });
}

function renderLogToTable(id, data, origin) {
    var target = $("#logbox_" + id);
    
    target.closest(".serviceOrderLogTR").show("slow");
    
    if (data.length == 0) {
        target.html("there is no data for this log");
    } 
    else {
        var dataSafe = $("#servicelist");
        var scrollTop = 0;
        var innerTable = "";
        
        var openLogs = dataSafe.data("openLogs");
        
        if (openLogs[id.toString()] === undefined)
            openLogs[id.toString()] = scrollTop;
        else
            scrollTop = openLogs[id.toString()];
            
        
        
        
        for (var j=0; j<data.length; j++) {
            var curData = data[j];
            var sev = curData.level;
            var msg = curData.message;
            var msgArray = msg.split(" ");
            
            msg = msgArray.join("&nbsp");
                
            
            if (msg.length < 1) msg= ":*(";  // why did we not get data from the back end?
            
            var d = new Date(data[j].time);
            var yr = d.getFullYear();
            var mn = d.getMonth() + 1;
            var dt = d.getDate();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            
            if (s < 10) s = "0" + s;

            innerTable = innerTable + "<div class='logrow'><div class='fl sev sev" + sev + "'>" + sev + "&nbsp;</div><div class='logTime fl'>" + mn + "/" + dt + "/" + yr + " " + h + ":" + m + ":" + s + "</div><div class='fl logmsg'>" + msg + "</div></div>";
        } 
    }
    
    // already empty when table refreshes, but we do the best we can with what we have.
    target.empty().append(innerTable);
    target.scrollTop(scrollTop);
    
}

function getEndpointType(data) {
    var type = "site";
    if (data.vnfname !== undefined) type = "vnf";
    else if (data.phyDeviceName !== undefined && data.phyDeviceName !== null) type = "physical";
    
    return type;
}

function getEndpointName(data) {
    var name = "";
    if (data.vnfname !== undefined) name = data.vnfname;
    else if (data.phyDeviceName !== undefined && data.phyDeviceName !== null) name = data.phyDeviceName;
    else name = data.siteName;
    
    return name;
}


//--------------------------------------------------------------
// RENDER INTERCONNECTION
//--------------------------------------------------------------

$.fn.appendIntrcnctStr = function(data, portIpAddress) {
    var leftEndpoint =  data.endPoints.left;
    var rightEndpoint =  data.endPoints.right;
    
    // IP ADDRESS
    var dispLeftIpAddr = "";
    var dispRightIpAddr = "";
    var leftIpAddress = "";
    var rightIpAddress = "";
    var dispLeftFloatingAddr = "";
    var dispRightFloatingAddr = "";
    var leftFloatingAddress = "";
    var rightFloatingAddress = "";
    
    var leftIpData = leftEndpoint.ipaddressInfoCollection;
    var rightIpData = rightEndpoint.ipaddressInfoCollection;    
    
    if (leftIpData !== undefined) leftIpAddress = leftEndpoint.ipaddressInfoCollection[0].assignedIP;
    if (rightIpData !== undefined) rightIpAddress = rightEndpoint.ipaddressInfoCollection[0].assignedIP;
    
    if (leftIpData !== undefined) leftFloatingAddress = leftEndpoint.ipaddressInfoCollection[0].floatingIP;
    if (rightIpData !== undefined) rightFloatingAddress = rightEndpoint.ipaddressInfoCollection[0].floatingIP;
    
    if (leftIpAddress !== "") dispLeftIpAddr = " (" + leftIpAddress + ")";
    if (rightIpAddress !== "") dispRightIpAddr = " (" + rightIpAddress + ")";
    
    if (leftFloatingAddress !== "" && leftFloatingAddress !== null) dispLeftFloatingAddr = " [" + leftFloatingAddress + "]";
    if (rightFloatingAddress !== "" && rightFloatingAddress !== null) dispRightFloatingAddr = " [" + rightFloatingAddress + "]";
    
    // PORT
    // if "site" for customer, this will print out clean
    var leftPortName = (leftEndpoint.portName === undefined) ? "" : leftEndpoint.portName;
    var rightPortName = (rightEndpoint.portName === undefined) ? "" : rightEndpoint.portName;
    
    var leftColon = (leftPortName == "") ? "" : ":";
    var rightColon = (rightPortName == "") ? "" : ":";
    
    // SITE specified on a physical device
    var leftSiteType = getEndpointType(leftEndpoint);
    var rightSiteType = getEndpointType(rightEndpoint);
    
    var leps = leftEndpoint.siteName;
    var reps = rightEndpoint.siteName;
    var leftSite = (leftSiteType == "physical" && (leps !== undefined && leps !== null)) ? '<span class="left-site">' +  "(" + leps + ")" + '</span>' : "";
    var rightSite = (rightSiteType == "physical" && (reps !== undefined && reps !== null)) ? '<span class="right-site">' +  "(" + reps + ")" + '</span>' : "";
    
    // SUBNET for hover
    var subnet = data.subnet;
    
    var hvr = "";
    if (subnet !== null) {
        var extGwStaticIP = subnet.externalGatewayStaticIP;
        var networkCIDR = subnet.networkCIDR;
        
        hvr = getEndpointName(leftEndpoint) + leftColon + leftPortName + " - " + getEndpointName(rightEndpoint) + rightColon + rightPortName + "&#10;";
        
        if (subnet.externalGateway) {
            hvr = hvr + "&#10;" + $.i18n._("srvc.has.ext.rtr");
        }
        
        if (extGwStaticIP !== "" && extGwStaticIP !== null) {
            hvr = hvr + "&#10;" + $.i18n._("srvc.via") + ": " + extGwStaticIP;
        }
        
        if (subnet.dhcprangeCollection.length > 0) {
            for (var j=0; j<subnet.dhcprangeCollection.length; j++) {
                hvr = hvr + "&#10;" + $.i18n._("srvc.ni.dhcp.range") + ": " + subnet.dhcprangeCollection[j].beginRange + " - " + subnet.dhcprangeCollection[j].endRange;
            }
        }
        
        if (networkCIDR !== "" && networkCIDR !== null) {
            hvr = hvr + "&#10;" + $.i18n._("srvc.ni.sub.cidr") + ": " + networkCIDR;
        }            
    }
    else {
        hvr = $.i18n._("srvc.hvr.no.subnet");
    }
    
    
    // If BANDWIDTH, then append to the hover
    var rightHover = "";
    var leftHover = "";

    if (leftSiteType == "site" || leftSiteType == "physical") {
        var col = data.endPoints.left.bandwidthProfileCollection;
        if (col.length > 0) {
            if (hvr !== "")
                leftHover = "&#10; &#10;";
            leftHover = leftHover + col[0].bandwidthDirection + " " + col[0].displayName + "&#10;" + col[1].bandwidthDirection + " " + col[1].displayName;
        }
    }

    if (rightSiteType == "site" || rightSiteType == "physical") {
        var col = data.endPoints.right.bandwidthProfileCollection;
        if (col.length > 0) {
            if (hvr !== "")
                rightHover = "&#10; &#10;";
            rightHover = rightHover + col[0].bandwidthDirection + " " + col[0].displayName + "&#10;" + col[1].bandwidthDirection + " " + col[1].displayName;
        }
    }
    
    // ASSEMBLE STRING and RENDER
    var left  = '<span title="' + hvr + leftHover + '"><span class="left-deviceKey">' + getEndpointName(leftEndpoint) + '</span>' + leftColon + '<span class="left-portKey">' + leftPortName + dispLeftIpAddr + dispLeftFloatingAddr + '</span>' + leftSite + "</span>";
    var cnct  = '<span title="' + hvr + '"><span class="typcn typcn-arrow-left"></span><span class="typcn typcn-arrow-right"></span></span>';
    var right = '<span title="' + hvr + rightHover + '"><span class="right-deviceKey">' + getEndpointName(rightEndpoint) + '</span>' + rightColon + '<span class="right-portKey">' + rightPortName + dispRightIpAddr + dispRightFloatingAddr + '</span>' + rightSite + "</span>";


    this.append('<div class="interConnection-block">' + left + cnct + right + '</div>');
};

function renderLog(e, data, targetName) {
    // no log data
    if (data.length == 0) {
        $("#logRefreshButton").data("targetName", targetName);
        var tbl = $("#soLogDialogTable");
        tbl.empty();
        $("#noLogMsg").empty();
        $("#noLogMsg").append($.i18n._("srvc.ttl.errNoLog"));
        $("#dialogLog").dialog("open"); 
    }
    
    // has log data
    else {
         $("#noLogMsg").empty();
         
        // set up refresh button
        $("#logRefreshButton").data("targetName", targetName);
        
        var tbl = $("#soLogDialogTable");
        tbl.empty();                
        tbl.append("<tr><th>" + $.i18n._("srvc.hdr.severity") + "</th><th>" + $.i18n._("srvc.hdr.time") + "</th><th>" + $.i18n._("srvc.hdr.msg") + "</th></tr>");
        for (var j=0; j<data.length; j++) {
            var curData = data[j];
            var sev = curData.level;
            var msg = curData.message;
            var msgArray = msg.split(" ");
            
            msg = msgArray.join("&nbsp");
                
            
            if (msg.length < 1) msg= ":*(";  // why did we not get data from the back end?
            
            var d = new Date(data[j].time);
            var yr = d.getFullYear();
            var mn = d.getMonth() + 1;
            var dt = d.getDate();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            
            if (s < 10) s = "0" + s;
            
            tbl.append("<tr><td class='sev" + sev + "'>" + sev + "</td><td class='logTime'>" + mn + "/" + dt + "/" + yr + " " + h + ":" + m + ":" + s + "</td><td nowrap>" + msg + "</td></tr>");
        } 
        
        $("#dialogLog").dialog("open"); 
        
        
        var wdth = $("#dialogLog table").width() + 20;
        $("#dialogLog").dialog({ width: wdth });
        $("#dialogLog").closest(".ui-dialog").css("overflow", "auto");
        $("#dialogLog").closest(".ui-dialog").css("height", "600px");

        // not sure where this came from
        $("#dialogLog").dialog("option", maxWidth, 600);
        $("#dialogLog").dialog("option","alsoResize", true);
        $("#dialogLog").dialog("option", "handles", "n, e, s, w");

    }
}

function renderServiceListFilters(isWriteAccess) {
    var target = $("#serviceListFilter");
    target.append('<div class="filterShowMe" >' + $.i18n._("cmn.fltr.show.me") + ' </div>');
    
    // STATUS
    target.addCheckboxReverse("serviceListRunning", $.i18n._("stat.running"), true, "statusFilter affirmativeMsg") ; // = function (id, lbl, isChk, cls, hlp) {
    target.addCheckboxReverse("serviceListPending", $.i18n._("stat.pending"), true, "statusFilter cautionaryMsg") ; 
    target.addCheckboxReverse("serviceListDeleting", $.i18n._("stat.deleting"), true, "statusFilter cautionaryMsg") ; 
    target.addCheckboxReverse("serviceListTerminated", $.i18n._("stat.terminated"), true, "statusFilter negativeMsg") ; 
    target.addCheckboxReverse("serviceListFailed",  $.i18n._("stat.failed"),  true, "statusFilter negativeMsg") ; 
    
    $("#serviceListRunning").change(function () {
        renderTable(isWriteAccess);
    });
    $("#serviceListPending").change(function () {
        renderTable(isWriteAccess);
    });
    $("#serviceListDeleting").change(function () {
        renderTable(isWriteAccess);
    });
    $("#serviceListTerminated").change(function () {
        renderTable(isWriteAccess);
    });
    $("#serviceListNotOrchestrated").change(function () {
        renderTable(isWriteAccess);
    });
    $("#serviceListFailed").change(function () {
        renderTable(isWriteAccess);
    });
    
    // TENANT
    osa.ajax.list('tenants', function(data) {
        var optList = [{"val": "", "str" : $.i18n._("cmn.all")}];
        
        for (var i=0; i<data.length; i++) {
            optList.push({"val": data[i].tenantName, "str" : data[i].tenantName});
        }
        target.addSelect("serviceListTenant", "cmn.tenant", false, false, optList, "", "filterIndent");
        
        $("#serviceListTenant").change(function () {
            renderTable(isWriteAccess);
        });    
        
        

    });
    
    // -------------------------------------------
    // PAGINATION
    // -------------------------------------------    
    var pagingTarget = $("#serviceListPaging");    
    pagingTarget.addPaging(true, true, ["#servicelist .keyBox", "#servicelist .intrCnctList"]);

    $("#showTableMore").click(function() {
    	$(".moreLessBtn").addClass("hide");
    	$(".showMoreLessHdr").addClass("hide");
    	delete $("#servicelist").data().openRows;
    	$("#servicelist").data()["openRows"] = {};
//    	$(".showRow").removeClass("hide");
//    	$(".hideRow").addClass("hide");
    });
    
    $("#showTableLess").click(function() {
    	$(".moreLessBtn").removeClass("hide");
    	$(".showMoreLessHdr").removeClass("hide");
    	$(".showRow").removeClass("hide");
    	$(".hideRow").addClass("hide");
    });
}


function renderTable(isWriteAccess) {
    renderServiceListStatuses();
    
//    /api/servicesV2Filtered/list/{tenantId}/{running}/{pending}/{deleting}/{failed}/{terminated}
    
    // If I do not do the toString, the false is ignored ;)
    var tenantId        = "0"; // use carrier tenant_id (or 0) for all services and customer tenant_id for specific tenant
    var running         = $("#serviceListRunning").prop("checked").toString();
    var pending         = $("#serviceListPending").prop("checked").toString();
    var deleting        = $("#serviceListDeleting").prop("checked").toString();
    var failed          = $("#serviceListFailed").prop("checked").toString();
    var terminated      = $("#serviceListTerminated").prop("checked").toString();
    
    osa.ajax.list('servicesV2Filtered', [tenantId, running, pending, deleting, failed, terminated], function(data) {
        // show parts of table or all
        var showHideClass = "";
        var showRowMoreLess = "";
        var table = $("#servicelist");
        
        if (table.data().length !== 0) {
            table.width("100%");
        }
        
        if ($("#showTableMore").is(":visible"))
            showHideClass = "hide";
        
        if ($("#showTableLess").is(":visible"))
        	showRowMoreLess = "hide";
        	
        
        // show status
        $("#serviceListLimits").updateLicenseStatus("ESO", ["maxServices", "maxVNFs", "maxCores"], "serviceListLimitTable");
 
        
        // show count
        var showingXofY = $("#viewingXofY");
        var paging = $("#paging");
        var count = 0;
        var perPage = $("#serviceListPages").val(); 
        var curPage = $("#pagingPage") && parseInt($("#pagingPage").html()) || -1;
        var numRendered = 0;
        var total = data.length;
        var ceiling = $("#serviceListPages").val();
        var showing = data.length;
        
        if (ceiling !== "all")
            showing = Math.min(total, ceiling);
        else
            ceiling = total; 
        
        if (ceiling == total) {
            showingXofY.html("Showing " + ceiling + " of " + total);
            paging.html("");
        }
            
        else {
            showingXofY.html("Showing " + ceiling + " of " + total);
            paging.html("<span id='pagingPrevious' class='pagingPrevious'>Previous</span> <span id='pagingLabel' class='pagingLabel'>Page <span id='pagingPage'>1</span></span><span id='pagingNext' class='pagingNext'>Next</span>");
            
            $("#pagingNext").click(function() {
                alert("need an API to support paging. Try again later. Or perhaps we should not really do paging.  If you can't filter for it and get it in the first 50, you may never really find it after that.");
            });
            
            $("#pagingPrevious").click(function() {
                $("#pagingNext").trigger('click');
            });
        }
        
        
        // determine if there is any scrolled logs before you flush the table
        logData = $("#servicelist").data();
        var logsShowing = $(".logbox:visible");
        
        logsShowing.each(function() {
            var idPlus = $(this).attr("id");
            var id = idPlus.replace("logbox_", "");
            var scrollTop = $(this).scrollTop();
            
            $("#servicelist").data("openLogs")[id] = scrollTop;
        });
        
        $serviceList.empty();
        if (data.length == 0) {
            $("#no-services-warning").clone().appendTo($serviceList);
            $("#soListLoading").hide();
            return;
        }

        $("#soListLoading").hide();
        var hdrStat = $.i18n._("srvc.hdr.stat");
        var hdrSO   = $.i18n._("srvc.hdr.so");
        var hdrEdt  = "";
        var hdrDlt  = $.i18n._("srvc.hdr.dlt");
        var hdrLog  = $.i18n._("srvc.hdr.log");
        var hdrDtls = $.i18n._("srvc.hdr.details");
        var hdrCnc  = $.i18n._("srvc.hdr.cnc");
        var hdrDia  = $.i18n._("srvc.hdr.diag");
        var hdrFor  = $.i18n._("srvc.hdr.for");
        var hasEdit = osa.auth.getPageAccess('physicalDevices').read;
        
        
        if (isWriteAccess) {
            hdrEdt = $.i18n._("srvc.hdr.edit");
        }
        
        // TABLE HEADER
        $serviceList.append('<tr><th class="thStatus">' + hdrStat + '</th><th class="thServOrd buff"><span class="miniStatus"></span>' + hdrSO + '</th><th class="buff">'  + hdrFor + '</th><th></th><th class="actnBtn" align="center">' + hdrEdt + '</th><th class="actnBtn" align="center">' + hdrDia + '</th><th class="showMoreLessHdr actnBtn ' + showRowMoreLess + '" align="center">' + hdrDtls + '</th><th class="actnBtn" align="center">' + hdrLog + '</th><th class="actnBtn" align="center">' + hdrCnc + '</th><th class="actnBtn" align="center">' + hdrDlt + '</th></tr>');            
        
        var isEven = true;
        
        for (var i in data) {
            // stop if paging has been exceeded
            if (perPage !== "all" && numRendered >= perPage) break;
            
            if (data.hasOwnProperty(i)) {
                var soId = data[i].key;
                var soStatus = data[i].serviceOrderStatus;
                var $box = $serviceBlockTemplate.clone().removeAttr('id');
                var $details = $serviceOrderDetails.clone().removeAttr("id");
                var tenantName = data[i].tenantName;
                var soName = data[i].serviceOrderName;
                
                var stopLogHvr = $.i18n._("srvc.btn.hvr.stop.log");
                var startLogHvr = $.i18n._("srvc.btn.hvr.start.log");
                var closeLogHvr = $.i18n._("srvc.btn.hvr.close.log");
                var stopTableHvr = $.i18n._("pgng.btn.hvr.stop.table");
                var startTableHvr = $.i18n._("pgng.btn.hvr.start.table");
                
                if ($serviceList.data("openRows")[soId]) {
                    showThisRow=""; // if the user opened a row to peek, leave it open
                }
                else {
                    showThisRow = showHideClass;
                }
                
                // STRIPE ROWS
                var trClass = "odd";
                if (isEven) trClass = "even";
                
                $box.addClass(trClass);
                $details.addClass(trClass);

                
                // also may need to filter on tenant
                var tenant = $("#serviceListTenant").val() || ""; // the || is for the first load in case the select has not been rendered yet.
                var continu = false; 
                
                if (tenant == "")
                    continu = true;
                else if (tenantName == tenant)
                    continu = true;
                else if (tenantName == "" && tenant == "OVERTURE NETWORKS") // TODO: total hack to work around missing data from API
                    continu = true;
                

                if (continu) {
                    numRendered = numRendered + 1;
                    
                    // add background color if terminated but not gone
                    $box.addClass(soStatus);
                    $details.addClass(soStatus);
                    
                    // add to table in UI
                    $box.appendTo($serviceList);
                    $details.appendTo($serviceList);
                    
                    // determine if log is already open
                    var trStyle = "style=display:none";
                    
                    if ($("#servicelist").data()[soId] !== undefined) {trStyle = "";}
                    
                    
                    $serviceList.append('<tr class="serviceOrderLogTR ' + trClass + '" ' + trStyle + ' id="log_target_' + soId + '"><td colspan="11" class="serviceOrderLogTD">' + 
                            '<div class="logButtons"><div class="btnGutter">' + 
                            '<div class="btnRound btnBigRound fr btnCloseLog"><input type="image" src="images/closeLog.png" title="' + closeLogHvr + '"></div>' +
                            '<div class="btnRound btnBigRound fr btnStartLogPoll hide"><input type="image" src="images/pollLog.png" title="' + startLogHvr + '"></div>' +
                            '<div id="btnStopLogPoll_' + soId + '" class="btnRound btnBigRound fr btnStopLogPoll hide"><input type="image" src="images/stopLog.png" title="' + stopLogHvr + '"></div>' +
                            '<div class="btnRound btnBigRound fr btnStopTablePoll"><input type="image" src="images/stopTable.png" title="' + stopTableHvr + '"></div>' +
                            '<div class="btnRound btnBigRound fr btnStartTablePoll hide"><input type="image" src="images/pollTable.png" title="' + startTableHvr + '"></div>' +
                            
                            '</div></div>' + 
                            '<div id="logbox_' + soId + '" class="logbox"></div>' +
                            '</td></tr>');
                    $("#log_target_" + soId).data("soId", soId);
    //FIRST ROW       
                    // STATUS (Running, Failed, Pending)
                    var $statusBox = $box.find(".serviceOrderStatus");
                    $statusBox.append("<span class='" + soStatus+"Status'>" + $.i18n._("stat." + soStatus) + "</span>");
                    
                    // SO NAME
                    $box.find(".serviceOrderName").html('<span class="miniStatus"></span>' + soName);
                    
                    
                    // TENNANT (in Name <td>)
                    var tenant = data[i].tenantName;
                    if ( typeof tenant === 'string' && tenant.length > 0 ) {
                        $box.find(".serviceOrderTenant").append("<span class='tntName'>" + tenant + "</span>");
                    }                    

                    // VIEW DIAGRAM BUTTON
                    $box.find(".viewBtn").append("<div class='btnRound'><a href='#services-details/key="  + data[i].key + "' class=''><img src='images/diagram.png' alt='" + $.i18n._("btn.hvr.vwDiag") + "' title='" + $.i18n._("btn.hvr.vwDiag") + "'></a></div>");
                    
                    // VIEW LOG BUTTON
                    var logBtn = $box.find(".logBtn");
                    logBtn.append("<div class='btnRound' id='logBtn_" + soId + "'><img src='images/log.png' alt='" + $.i18n._("btn.hvr.vwLog") + "' title='" + $.i18n._("btn.hvr.vwLog") + "'></div>");
                    logBtn.data({'id': soId});
                    
                    // SHOW / HIDE ROW BUTTON
                    var showHideTd = $box.find(".moreLessBtn");
                    var hideRowClass = "hide";
                    var showRowClass = "";
                    if (showThisRow == "") {
                        showRowClass = "hide";
                        hideRowClass = "";
                    }
                    
                    showHideTd.addClass(showRowMoreLess);
                    showHideTd.append("<div class='btnRound showRow " + showRowClass + "' id='showBtn_" + soId + "'><img src='images/rowShow.png' alt='" + $.i18n._("btn.hvr.row.show") + "' title='" + $.i18n._("btn.hvr.row.show") + "'></div>");
                    showHideTd.append("<div class='btnRound hideRow " + hideRowClass + "' id='hideBtn_" + soId + "'><img src='images/rowHide.png' alt='" + $.i18n._("btn.hvr.row.hide") + "' title='" + $.i18n._("btn.hvr.row.hide") + "'></div>");
                    $("#showBtn_" + soId).data({'id': soId});
                    $("#hideBtn_" + soId).data({'id': soId});
                    
                    // INIT NETWORK CONNECTIVITY TEST BUTTON
                    var cncBtn = $box.find(".cncBtn");
                    cncBtn.append("<div class='btnRound' id='cncBtn_" + soId + "'><img src='images/add_test.png' alt='" + $.i18n._("btn.hvr.add.cnc.tst") + "' title='" + $.i18n._("btn.hvr.add.cnc.tst") + "'></div>");
                    cncBtn.data({'id': soId});
                    
                    // EDIT
                    // set key on the data object (later in code) and a click event below deals with retrieving that and placing it on the URL
                    $box.find(".edtBtn").append('<div class="btnRound"><a href="#" class="edit-btn-2" title="' + $.i18n._("btn.edit") + '"><img src="images/edit.png"></a></div>');
                    
                    
                    // DELETE
                    $box.find(".delBtn").append('<div class="btnRound"><a href="#" class="stop-btn" title="' + $.i18n._("btn.delete") + '"><img src="images/delete.png"></a></div>');
                    // set key on the data object (later in code) and a click event below deals with retrieving that and placing it on the URL                    
      
    // THIRD ROW
                    // if there is an open log, go to it and update it
                    
                    var openLogs = $serviceList.data("openLogs");
                    if (openLogs && openLogs[soId] !== undefined) {
                        $("#log_target_" + soId).height("317px");
                        $("#log_target_" + soId).show();
                        $("#logBtn_" + soId).trigger("click");
                    }
                    
    //SECOND ROW                        
                    // VNF title
                    var vnfTd =$details.find(".vnfInstancesCollection .keyBox");
                    vnfTd.attr("id", "vnfInstances_" + soId);
                    vnfTd.addClass(showThisRow);
                    vnfTd.append("<table class='vnfTable'></table>");
                    
                    
                    // VNFs (write VNFs to the left side one by one)
                    for (var l = 0; l < data[i].vnfsCollection.length; l++) {
                        var curVnf = data[i].vnfsCollection[l];
                        var type = curVnf.vnfTypeKey;
                        var name = curVnf.displayName;
                        var curStat = curVnf.virtualMachineStatus;
                        
                        var hvr = name + " " + $.i18n._("srvc.hvr.ttl.cust.opt") + "&#10;";
                        var curOpt = curVnf.optimizations;
                        var cloudName = curOpt.cloudName;
                        var custOpt = curOpt.customOptimization;
                        var computeNode = curOpt.computeNode;
                        
                        if (cloudName !== "")
                            hvr = hvr + "&#10;" + cloudName;
                        
                        if (custOpt !== "")
                            hvr = hvr + "&#10;" + custOpt;
                        
                        if (computeNode !== "")
                            hvr = hvr + "&#10;" + computeNode;
                        
                        if (curVnf.scaleAlarmProfileDTO !== null)
                        {
                            hvr = hvr + "&#10;" + "&#10;" +  $.i18n._("srvc.hvr.ttl.scale.profs") + "&#10;";
                            hvr = hvr + curVnf.scaleAlarmProfileDTO.name;
                        }
                        
                        
    //TODO: Cori make nice icons
                        var vnfId = curVnf.key;
                        var btnLog = '<div class="btnRound logVnfBtn" id="vnf_id_' + vnfId + '"><img src="images/log.png" alt="' + $.i18n._("btn.hvr.vwLog") + '" title="' + $.i18n._("btn.hvr.vwLog") + '">';
                        var btnFlot = '<div class="btnRound plotVnfBtn" id="plot_for_vnf_id_' + vnfId + '" onclick="launchVNF(\'' + vnfId + '\', \'' + soName + '\', \'' + name + '\')"><img src="images/chart.png" alt="' + $.i18n._("btn.hvr.chart") + '" title="' + $.i18n._("btn.hvr.chart") + '">';
                        var btnVNC = "";
                        var isSwitch = $("#servicelist").data("switchMap")[curVnf.vnfTypeKey];

                        if (isSwitch || curStat !== "ACTIVE") btnFlot = "";
                        
                        if(curStat == "ACTIVE" && !isSwitch)
                            btnVNC = '<div class="btnRound noVncBtn" id="vnc_id_' + vnfId + '" onclick="launchVNC(\'' + vnfId + '\', \'' + soName + '\')"><img src="images/novnc.png" alt="' + $.i18n._("btn.hvr.vnc") + '" title="' + $.i18n._("btn.hvr.vnc") + '">';
             

                        vnfTd.find("table").append('<tr><td><div class="vnfInstRow" title="' + hvr + '"><div class="leftSide"><span class="miniStatus">' + getVNFStatusIcon(curStat) + '</span>' + name + ' (' + type + ')</div></td>' +
                                '<td class="vnfBtn">' + btnFlot + '</td>' + 
                                '<td class="vnfBtn">' + btnLog + '</td>' + 
                                '<td class="vnfBtn">' + btnVNC + '</td>' +
                                '</tr></div></div>');
                        $("#vnf_id_" + vnfId).data("vnfId", vnfId);
                        $("#vnf_id_" + vnfId).data("soId", soId);
                    }  

                    
                    // INTERCONNECTIONS BOX
                    var intTd = $details.find(".interConnectionCollection");
                    var intrCnctBox = $("<div></div>").addClass("intrCnctList").attr("id", "intrCnctList_" + soId);
                    intrCnctBox.appendTo(intTd);
                    intrCnctBox.addClass(showThisRow);
                    
                    // INTERCONNECTION HEADER
                    intrCnctBox.append("<div class='innerTableHeader'>" + $.i18n._("srvs.ttl.intrcnct") + "</div>");
                    
                    // INTERCONNECTIONS
                    var portIpAddress = {};
                    for (var a = 0; a < data[i].vnfsCollection.length; a++) {
                        var portCollection = data[i].vnfsCollection[a].portCollection;
                        for (var b = 0; b < portCollection.length; b++) {
                            portIpAddress[portCollection[b].key] = portCollection[b].ipAddressCollection;
                        };
                    }
                    
                    for (var k = 0; k < data[i].interConnectionCollection.length; k++) {
                        var inctData = data[i].interConnectionCollection[k];
                        intrCnctBox.appendIntrcnctStr(inctData, portIpAddress);
                    }
                    
                    // BUTTONS
                    var editBtn = $box.find(".edit-btn-2");
                    var stopBtn = $box.find(".stop-btn");
                    var status = data[i].serviceOrderStatus;

                    // TODO: add a start Service button (when we have a start service api call)
                    // TODO: do not need the logical code in the JSP since we can do this here.
                    if (isWriteAccess && (status !== "deleting" && status !== "pending")) {
                        stopBtn.data({'id': soId});
                        stopBtn.find("img").data({'id': soId});
                        editBtn.data({'id': soId});
                        editBtn.find("img").data({'id': soId});
                    }
                    else { // no write access so remove
                        editBtn.parent().remove();
                        stopBtn.parent().remove();
                    }
                }

            };
            
            isEven = !isEven;
        }
        
        
        var dataSafe = $("#servicelist");
        var esoServerLogId = "0";
        
//        $("#serviceListLimits").updateLicenseStatus("ESO", ["maxServices", "maxVNFs", "maxCores"], "serviceListLimitTable");
        
        // -----------------------------
        // START LOG POLLING
        // -----------------------------
        $(".btnStartLogPoll").click(function() {
            var serviceOrderId = $(this).closest("tr").data("soId").toString();
            
            $(this).addClass("hide");
            $("#btnStopLogPoll_" + serviceOrderId).removeClass("hide");
            
            // get the log poll going asap
            // 1. save its position
            var scrollTop = $("#logbox_" + serviceOrderId).scrollTop();
            dataSafe.data()[serviceOrderId] = scrollTop;
            
            // 2. then load it
            renderServiceOrderLog(esoServerLogId, serviceOrderId);
            
            // set up the log polling interval
            logPollHandle = setInterval(function() {
                $("#servicelist").data()[serviceOrderId] = $("#logbox_" + serviceOrderId).scrollTop();
                renderServiceOrderLog(esoServerLogId, serviceOrderId);
            }, 5000);     // if I am watching them I want this to be quick.                     
            
            if (dataSafe.data("logPollHandles") === undefined)
                dataSafe.data("logPollHandles", {});
            dataSafe.data("logPollHandles")[serviceOrderId] = logPollHandle;
        });
        
        // -----------------------------
        // STOP LOG POLLING
        // -----------------------------
        $(".btnStopLogPoll").click(function() {
            var serviceOrderId = $(this).closest("tr").data("soId").toString();
//            var esoServerLogId = "0";

            $(this).addClass("hide");
            $(this).siblings(".btnStartLogPoll").removeClass("hide");
            clearInterval(dataSafe.data("logPollHandles")[serviceOrderId]);
            dataSafe.data("logPollHandles")[serviceOrderId] = 0;
        });
        
        // -----------------------------
        // START TABLE POLLING
        // -----------------------------
        $(".btnStartTablePoll").click(function(ev) {
            startTablePollAndEndLogPolls(isWriteAccess);
        });
         
         
        
        // ---------------------------
        // STOP TABLE POLL
        // ---------------------------
        $(".btnStopTablePoll").click(function(ev) {
            endTablePoll();
   
            $(".btnGutter").each(function() {
                $(this).find(".btnStartLogPoll").removeClass("hide");
            });
        });
        
        
        // ---------------------------
        // CLOSE LOG WINDOW
        // ---------------------------
        $(".btnCloseLog").click(function(ev) {
            var serviceOrderId = $(this).closest("tr").data("soId").toString();
            
            // if the table is not polling but the log is polling, do this.
            if (dataSafe.data("logPollHandles")) {
                clearInterval(dataSafe.data("logPollHandles")[serviceOrderId]);
                dataSafe.data("logPollHandles")[serviceOrderId] = 0;    
            }
            
            // if the table is polling, do this. (stop telling the table this should be open)
            delete(dataSafe.data("openLogs")[serviceOrderId]);
            $("#log_target_" + serviceOrderId).hide("slow");

        });
    });
};




function getVNFStatusIcon (status) {
    var statCls = "";
    var hvrTxt = "";
    var src = "";
    

    switch (status) {
        // "Good cases"
        case "ACTIVE":
            statCls = "stat_active";
            hvrTxt = $.i18n._("stat.active");
            src = "images/check.png";
            break;

        // "Bad" cases
        case "DELETED":
        case "ERROR":
            statCls = "stat_fail";
            hvrTxt = $.i18n._("stat.failed");
            src = "images/fail.png";                
            break;

        // "Pending?" cases
        case "BUILD":
        case "HARD_REBOOT":
        case "REBOOT":
        case "REBUILD":
            statCls = "stat_pending";
            hvrTxt = $.i18n._("stat.pending");
            src = "images/pending.png";                
            break;

        // "Alert" cases
        case "PASSWORD":
        case "RESCUE":
        case "RESIZE":
        case "REVERT_RESIZE":
        case "SHUTOFF":
        case "SUSPENDED":
        case "VERIFY_RESIZE":
            statCls = "stat_fail";
            hvrTxt = $.i18n._("stat.failed");
            src = "images/fail.png";                  
            break;

        // "Unknown"
        case "UNKNOWN":
        default:
            statCls = "stat_warning";
            hvrTxt = $.i18n._("stat.warning");
            src = "images/warning.png";
            break;
    }
    return  "<img class='" + statCls + "' src='" + src + "' alt='" + hvrTxt + "' title='" + hvrTxt + "'>";
};


// -----------------------------------------------------------
// STOP LOGS FORM POLLING
// -----------------------------------------------------------
function endLogsPoll() {
    var dataSafe = $("#servicelist");
    var logIntervalHandles = dataSafe.data("logPollHandles");
    
    // clear the polling handles
    for (var serviceOrderId in logIntervalHandles) {
        clearInterval(logIntervalHandles[serviceOrderId]);
        dataSafe.data("logPollHandles")[serviceOrderId] = 0;
    }
    
    // remove the log handle IDs from the jQuery .data()
    dataSafe.removeData("logPollHandles");
}


// -----------------------------------------------------------
// STOP TABLE POLLING
// -----------------------------------------------------------
function endTablePoll() {
    var tablePollHandle = $("#servicelist").data("tablePollHandle");
    clearInterval(tablePollHandle);
    $("#servicelist").removeData("tablePollHandle");
    $("#stopTablePollBtn").addClass("hide");
    $("#startTablePollBtn").removeClass("hide");
    $(".btnStopTablePoll").addClass("hide");
    $(".btnStartTablePoll").removeClass("hide");
}


// -----------------------------------------------------------
// START TABLE POLLING
// -----------------------------------------------------------
// Stop polls of logs if they exist so we do not have a 
// billion unneeded polls, then start up the table polling
//-----------------------------------------------------------
function startTablePollAndEndLogPolls(isWriteAccess) {
    var dataSafe = $("#servicelist");
    
    // clean up log polling
    endLogsPoll();
    
    
    // kick off call immediately to make user happy
    // Remember when the table loads it will need to call each open log
    // so one call to the table can kick off a slew of calls for each log
    // Do not mistake this as the clearInterval not working.  It is working
    // and the calls are now made via the table.
    renderTable(isWriteAccess);
    
    
    // start up page polling
    tablePollHandle = setInterval(function(isWriteAccess) {
        renderTable(isWriteAccess);
    }, 10000, isWriteAccess);
    
    dataSafe.data("tablePollHandle", tablePollHandle);   

    
    // clean up buttons
    $("#stopTablePollBtn").removeClass("hide");
    $("#startTablePollBtn").addClass("hide");
    $(".btnStopTablePoll").removeClass("hide");
    $(".btnStartTablePoll").addClass("hide");
};



// AJAX CALLS
function renderServiceOrderLog(esoServerLogId, serviceOrderId) {
    osa.ajax.list('logDetails', [esoServerLogId, serviceOrderId], function(data) {
        renderLogToTable(serviceOrderId, data, "logBtn_" + serviceOrderId);
    });
};

// UTILITY
function getIssueBadge(str, count) {
    return "<div class='soDetails " + str + "Status fl clickStatus " + str + "ClickStatus'>" + count + " " + $.i18n._("stat." + str + "") + "</div>";
};

// SHOW NO VNC WINDOW
function launchVNC(vnfId, soName) {
    osa.ajax.get("vnfVncConsole", vnfId, function(data) {
        var vncUrl = data.novncConsole;
        var name = data.displayName;
        
        url = "vnc.jsp?name=" + name + "&so=" + soName +"&url=" + vncUrl;
        
        var win = window.open(url, '_blank');
        win.focus();
    });   
};


//SHOW NO VNC WINDOW
function launchVNF(vnfId, soName, vnfName) {
        url = "vnfMeters.jsp?vnfId=" + vnfId + "&soName=" + soName +"&vnfName=" + vnfName;
        var win = window.open(url, '_blank');
        win.focus();
};


//}; 