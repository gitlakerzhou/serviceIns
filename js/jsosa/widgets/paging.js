// moreArray can be any selector: ["#myId", ".myClass", *, label];
//
// ATTENTION!!!
// please remember to create a click function on the polling button so that you know what fn to call when clicked!


$.fn.addPaging = function(hasPolling, hasShow, moreArray) {
    var pagingTarget = this;
    var stopTableHvr = $.i18n._("pgng.btn.hvr.stop.table");
    var startTableHvr = $.i18n._("pgng.btn.hvr.start.table");
    
//  var optList = [
//  {"str" : "All", "val" : "all"}, 
//  {"str" : "3", "val" : "3"},
//  {"str" : "5", "val" : "5"},
//  {"str" : "10", "val" : "10"},
//  {"str" : "20", "val" : "20"},
//  {"str" : "50", "val" : "50"},
//];
//
//pagingTarget.addSelect("serviceListPages", "Service Orders on Page", false, false, optList, "all");
//$("#row_serviceListPages").removeClass("row").removeClass("form-input-block").addClass("pagingInput fl");
//pagingTarget.append("<div id='viewingXofY' class='fl'></div><div id='paging' class='fl'></div>");

//pagingTarget.change(function () {
//  renderTable(isWriteAccess);
//});
    
    if (hasPolling) {
        pagingTarget.append('<div id="startTablePollBtn" class="btnRound btnBigRound fr hide"><input type="image" src="images/pollTable.png" title="' + startTableHvr + '"></div>');
        pagingTarget.append('<div id="stopTablePollBtn" class="btnRound btnBigRound fr"><input type="image" src="images/stopTable.png" title="' + stopTableHvr + '"></div>');
        
        var stopPoll = $("#stopTablePollBtn");
        var startPoll = $("#startTablePollBtn");
        
        stopPoll.click(function () {
            stopPoll.addClass("hide");
            startPoll.removeClass("hide");
        });
        
        startPoll.click(function () {
            startPoll.addClass("hide");
            stopPoll.removeClass("hide");
        });
    }
    
    if (hasShow) {
        var showText = $.i18n._("pgng.show");
        var hideText = $.i18n._("pgng.hide");
        pagingTarget.append('<div id="showTableMore" class="btnRound btnBigRound fr"><input type="image" src="images/tableShowMore.png" title="' + showText + '"></div>');
        pagingTarget.append('<div id="showTableLess" class="btnRound btnBigRound fr hide"><input type="image" src="images/tableShowLess.png" title="' + hideText + '"></div>');
        
        var more = $("#showTableMore");
        var less = $("#showTableLess");
        
        more.click(function () {
            for (var i=0; i<moreArray.length; i++) {
                $(moreArray[i]).removeClass("hide");    // hide every element with a class, type, *, or id
            }
            more.addClass("hide");                     // hide more button
            less.removeClass("hide");    // show less button
        });
        
        less.click(function () {
            for (var i=0; i<moreArray.length; i++) {
                $(moreArray[i]).addClass("hide");        // hide every element with a class, type, *, or id
            }
            less.addClass("hide");                         // hide less button
            more.removeClass("hide");        // show more button
        });

    }

};



