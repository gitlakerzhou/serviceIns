//@ sourceURL=http://localhost:8080/ajax/services-details.js
// --------------------------------------------------------------------------------------------------------------------
// In this file, we do several things.  
//
// Originally, this file allowed for the load of the current status of the configuration.
// now it will continue to load the current status of the current configuration as it always has. 
//  This is the fastest way to the current state. This is get servicesV2/get/{service order id}
//
// New functionality has been added to include a temporal services timebar. This timebar uses a query to get
// the list of times that the services has had a change in status.  The data from the query will render time dots
// on the time bar that represent the times on a scale from beginning to end.  The user may do several thing with
// their time dots.  They may hover to see details, they may click to show the diagram for that time, and they may
// drag them and drop them on the timebarStart (start time and date) or the timebarEnd (end time and date).
// By dropping the dot on the time, the range will be rerendered.
//
// The user may also pick from a list of times that are populated into the select boxes under the start and end times.
// in doing this, the timebar will be rerendered following a query to get elements in that range. 
//
//
// EBI data  will look like this:
//
//    [{"timeStamp":1403714699015,"temporalObjectId":280004},
//    {"timeStamp":1403714754227,"temporalObjectId":320004},
//    {"timeStamp":1403714796240,"temporalObjectId":400008}
//    ];
// --------------------------------------------------------------------------------------------------------------------

//var run_servicesDetails = function() {

// MAIN LOADING OCCURS HERE
// Show EBI if it is needed and then show the current state map/diagram
(function(access) {
    var actionContainer = $("#action-container");

    actionContainer.data("key", osa.page.getPageURLParameters().key); // save because sometimes the URL loses the key later
    $("#timeSliderWidget").data("frequency", 0);
    $("#timeSliderLabel").html($.i18n._("esi.adj.clstr.freq"));
    
    $("#timeBar").html("<div class='timebarLoading'>" + $.i18n._("srvc.msg.waiting.data") + "</div>");
    
    $("#buttonRerender").html($.i18n._("srvc.dia.repaint"));
    $("#buttonRerender").click(function(ev) {
        if (!($(this).hasClass("disabled"))) {
            $(this).addClass("disabled");
            $("#diagramField").data("locations", {});
            var hasEbi = $("#ebiControls").is(":visible");
            if (hasEbi)
                $(".timeDotSelected").trigger("click"); // TODO: there is not always a timedot selected (see range example)
            else 
                updateMap(true);
        }
    });
    
    var mapCenter = [0.5, 0.5];
    var targetName = $("#mapBox")[0];
    
    $("#buttonRerenderPlus").click(function() {
        var curZoom = $("#diagramField").data("zoom") || 1;
        var newScale = curZoom + .1;
        
        if (newScale > 1.1) {
            newScale = 1.1;
            alert($.i18n._("srvc.dia.zoom.in.limit"));
        }
        
        osa.ui.map.setZoom(newScale, jsPlumb, mapCenter, targetName);
        $("#diagramField").data("zoom", newScale);
    });
    
    $("#buttonRerenderMinus").click(function() {
        var curZoom = $("#diagramField").data("zoom") || 1;
        var newScale = curZoom - .1;
        
        if (newScale < .1) {
            newScale = .1;
            alert($.i18n._("srvc.dia.zoom.out.limit"));
        }
        
        osa.ui.map.setZoom(newScale, jsPlumb, mapCenter, targetName);
        $("#diagramField").data("zoom", newScale);
    });
    
    // --------------------------------------------
    // EBI  
    // --------------------------------------------
    // determine if EBI is present and if it is, show its tool set.
    $.get("/osa/api/systemProperties/get/ebiEnabled", function (data) {
        var hasEBI = (data.propertyValue == "true");
        var ebiControls = $("#ebiControls");
        
        
        if (hasEBI) {
            // this will let the right side time increment every second.
            // this should do this only when the rightmost point is the
            // current time represented by the square.
            var pollIntervalHandle = setInterval(pollEndDate, 1000);
            
            // running time on right and set up primary data
            $("#action-container").data("pollIntervalHandle", pollIntervalHandle); 
            $("#serviceTimeAndDate").data("timeStamp", "now");
            
            // reveal timeline
            $("#ebiHeader").html($.i18n._("srvc.hdr.timeline"));
            var frequency = $("#timeSliderWidget").data("frequency");
            
            renderTimebar(-1, -1, frequency);
            renderShowNowButton(false); 
            renderShowAllButton();
            renderTimeSlider();
            
            $("#serviceTimeAndDate").html($.i18n._("srvc.cur.state"));
        }
        else {
            ebiControls.empty(); // scrap the HTML
        }
    });
     
    


    // --------------------------------------------------------------------
    // MAP / DIAGRAM  
    // --------------------------------------------------------------------
    // Use updateMap to render the current state
    // renderMap is for a current state that will not poll and is EBI only
    // --------------------------------------------------------------------
    updateMap();
    var intervalHandle = setInterval(updateMap, 10000);
    actionContainer.data("intervalHandle", intervalHandle);
    

    
    // IMPORTANT. Old code used to clear the interval when leaving the page.  
    osa.page.onUnload(function() {
        osa.page.clearIntervals();
    });

})(osa.auth.getPageAccess('services'));




// --------------------------------------------
// EBI BUTTONS
// --------------------------------------------
// CLICK FOR SHOW NOW BUTTON
function renderShowNowButton(showNowshowNow) {
 var showNowBtn = $("#mapShowNow");
 
 if (showNowshowNow)
     showNowBtn.show("slow");
 showNowBtn.html($.i18n._("esi.btn.show.now"));
 
 
 showNowBtn.click(function() {
     var wasSelected = $(".timeDotSelected");
     var timeSquare = $(".timeSquare");
     var saveDataBox =  $("#serviceTimeAndDate");
     var storageBox = $("#action-container");
     
     // remove current reference in timebar
     wasSelected.removeClass("timeDotSelected").tooltip({ content: getPrettyDate($(".timeDotSelected").data("timeStamp")) + getTooltipCurrent(false) + getTooltipHelp()});
     timeSquare.addClass("timeDotSelected").tooltip({content: getTooltipCurrentPoll()});
     
     // set the info for rerendering later
     saveDataBox.data("timeStamp", "now");
     saveDataBox.html($.i18n._("srvc.cur.state"));
     
     // update map
     updateMap(true);
     var intervalHandle = setInterval(updateMap, 10000);
     storageBox.data("intervalHandle", intervalHandle);
     $(window).data("intervalHandle", intervalHandle);
 });
}


// CLICK FOR SHOW ALL BUTTON
function renderShowAllButton() {
 var showAllBtn = $("#buttonShowAll");
 
 showAllBtn.show("slow");
 showAllBtn.html($.i18n._("esi.btn.show.all"));
 
 
 showAllBtn.click(function() {
     var min = -1;
     var max = -1;
     var frequency = $("#timeSliderWidget").data("frequency");

     
     renderTimebar(min, max, frequency);
 });
}





//};