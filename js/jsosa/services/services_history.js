//var run_ServiceHistory = function() {

    

// called after a submit even before the success dialog is closed.
(function(access) {
    var isWriteAccess = access.write;
       
    renderServiceHistoryPage(isWriteAccess);
    renderServiceHistoryFilters(isWriteAccess);
    renderServiceHistoryTable(isWriteAccess);


    // --------------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------------
    
    // Called when the Create button is clicked and when the creation is submitted
    osa.page.onUnload(function() {
//        endTablePoll();
//        endLogsPoll();
    });



})(osa.auth.getPageAccess('services'));


// --------------------------------------------------------------
//
// RENDER FUNCTIONS
//
// --------------------------------------------------------------

//--------------------------------------------------------------
// PAGE
//--------------------------------------------------------------
function renderServiceHistoryPage(isWriteAccess) {
    $("#historyTableDeleteSuccess").html($.i18n._("srvc.msg.success.delete"));
    
    // strings for table headers
    $("#serviceHistory .serviceOrderNameHdr").html($.i18n._("cmn.name"));
    $("#serviceHistory .serviceOrderTimeHdr").html($.i18n._("cmn.time"));
    $("#serviceHistory .serviceOrderTenantHdr").html($.i18n._("cmn.tenant"));
    $("#soListLoading").html($.i18n._("cmn.loading"));
    
    $("#serviceHistory .crtBtn").html($.i18n._("srvc.hdr.crt.srvc"));
    $("#serviceHistory .delBtn").html($.i18n._("srvc.hdr.del.srvc"));
    
    $("#serviceHistoryLimits").appendLicenseStatus("ESO", ["maxServices", "maxVNFs"], "serviceHistoryLimitTable");
}

//--------------------------------------------------------------
// FILTERS
//--------------------------------------------------------------
function renderServiceHistoryFilters(isWriteAccess) {
    var target = $("#serviceHistoryFilter");
    
    
    // TENANT
    osa.ajax.list('tenants', function(data) {
        var optList = [{"val": "", "str" : $.i18n._("cmn.all")}];
        var specStr = $.i18n._("cmn.fltr.show.me") + (" ") + $.i18n._("cmn.tenant");
        
        for (var i=0; i<data.length; i++) {
            optList.push({"val": data[i].key, "str" : data[i].tenantName});
        }
        target.addSelect("serviceListTenant", specStr, false, false, optList, "", "");
        
        $("#serviceListTenant").change(function () {
            renderServiceHistoryTable(isWriteAccess);
        });    
    });
    
}


//--------------------------------------------------------------
// TABLE
//--------------------------------------------------------------
function renderServiceHistoryTable(isWriteAccess) {
    var tenantId = $("#serviceListTenant").val();
    
    osa.ajax.list('serviceOrderHistory', [tenantId], function(data) {
        $("#soListLoading").hide();
        
        $("#service-block-template").siblings().remove();
        
        var createButton = "";
        var deleteButton = "";
        var hvrTxtCreate = $.i18n._("srvc.hvr.crt.srvc");
        var hvrTxtDelete = $.i18n._("srvc.hvr.del.srvc");
        
        for (var i=0; i<data.length; i++) {
            createButton = '<div class="btnRound btnCreate" id="create_off_of_' + i + '" + title="' + hvrTxtCreate + '" alt="' + hvrTxtCreate + '"><img src="images/create_from.png"></div>';
            deleteButton = '<div class="btnRound btnDelete" id="delete_' + i + '" + title="' + hvrTxtDelete + '" alt="' + hvrTxtDelete + '"><img src="images/delete.png"></div>';
            $("#serviceHistory").append("<tr id='history_of_" + i + "'>" +
                    "<td class='padright'>" + data[i].serviceOrderName + "</td>" +
                    "<td class='padright'>" + getPrettyDate(data[i].timestamp) + "</td>" + 
                    "<td class='padright'>" + data[i].tenantName + "</td><td></td>" +
                    "<td align='center'>" + createButton + "</td>" +
                    "<td align='center'>" + deleteButton + "</td>" +
                    "</tr>");
            $("#history_of_" + i).data("data", data[i]);
        }
        
        $(".btnCreate").click(function(ev) {
            ev.preventDefault();
            var sohId = $(this).closest("tr").data("data").serviceOrderHistoryId;
            location.href = "#services-create-from/key=" + sohId;
        });
        
        $(".btnDelete").click(function(ev) {
            ev.preventDefault();
            var sohId = $(this).closest("tr").data("data").serviceOrderHistoryId;
            var deleteSuccess = $("#historyTableDeleteSuccess");
            var deleteFailure = $("#historyTableDeleteFailure");
            
            if (confirm($.i18n._("srvc.prmpt.delete.history"))) {
                osa.ajax.remove('serviceOrderHistory', sohId, 
                        function() { 
                                deleteFailure.hide("slow");
                                deleteSuccess.showAndHide();

                            renderServiceHistoryTable(isWriteAccess);
                                       
                            }, 
                            function (resp) {
                                deleteSuccess.hide("slow");
                                deleteFailure.html($.i18n._("srvc.msg.failure.delete") + " " + resp.responseJSON.status);
                                deleteFailure.showAndHide();
                });
            }
        });
        
    });
}


function getPrettyDate(dateStr) {
    if (dateStr == undefined || dateStr == null) return "";
    
    var date  = new Date(dateStr);
    var day   = date.getDate();
    var month = date.getMonth();
    var year  = date.getFullYear();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();
    
    if (hour < 10) hour = "0" + hour;
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    
    return ($.i18n._("date.month." + month) + " " + day + " " + year + " at " + hour + ":" + min + ":" + sec);
}

//};