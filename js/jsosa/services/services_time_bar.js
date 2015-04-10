// This file manages the: 
// - rendering of the timebar, 
// - options for the selects for the times
// - clicking of its dots
// - drag and drop of the dots on the start and end dates 

function renderTimebar(min, max, freq) {
    var timebar = $("#timeBar");
    
    if (timebar.data("soId") === undefined) {
        timebar.data("soId", osa.page.getPageURLParameters().key);
    }
    
    // stop polling and draw
    clearInterval(timebar.data("timebarIntervalHandle"));

    
    // since the load takes a while, let the user know the load is taking a while
    if (!timebar.find(".timebarLoading"))
        timebar.html("<div class='timebarLoading'>" + $.i18n._("srvc.waiting.for.data") + "</div>");
    
    // --------------------------------------------
    // Get the EBI time data.  
    // --------------------------------------------
    var id = timebar.data("soId");
    
    getTimeData(id, min, max, freq);
    
    var intervalHandle = setInterval("getTimeData(" + id + "," + min + "," + max + "," + freq + ")", 10000);
    timebar.data("timebarIntervalHandle", intervalHandle);
};



function getTimeData(id, min, max, freq) {
    var esiContainer = $("#ebiControls");
    var timebar = $("#timeBar");
    var showNowButton = $("#mapShowNow");
    
    // if we are at this point, just show the timebar.
    esiContainer.data("curCall", {"min": min, "max": max, "id": id, "freq": freq});
    
    if (freq/1000 > 120) {
        $("#noEbiData").hide("slow");
        $("#failedToLoadEbiData").hide("slow");
        $("#tooMuchEbiData").html($.i18n._("esi.msg.too.much.data")).show();
        esiContainer.hide("slow");
        showNowButton.trigger("click"); // show now only 
        showNowButton.hide("slow");
    }
    else {
        $("#tooMuchEbiData").hide().html("");

        // get the data and then poll, poll, poll!
        $.get( "/osa/api/servicesV2/history/timeline/" + id + "/from/" + min + "/to/" + max + "?changeThreshold=" + freq, function( data ) {
            
            
            
            if (data.length == 0) {
                $(".timebarLoading").html($.i18n._("esi.msg.failed.call")); // not shown anymore
                $("#noEbiData").show("slow").html($.i18n._("esi.msg.empty.data"));
                $("#failedToLoadEbiData").hide("slow");
                $("#mapShowNow").hide("slow");
                esiContainer.hide("slow");
                return;
            }
            
            // We have data, its a go
            esiContainer.show();
            
            // CHECK to see if there is too much data to be worthwhile.
            var timebarWidth = timebar.innerWidth();
            var logicalNumberOfDots = Math.floor(timebarWidth/12);
            var actualNumberOfDots = data.length;
            
            // This will not work if the number of dots*12 > width of timebar.
            if (actualNumberOfDots + 30>logicalNumberOfDots) {
                timebar.html("<div class='timebarLoading'>" + $.i18n._("esi.msg.too.many.recalc") + "</div>");
                var timeslider = $("#timeSlider");
                var timesliderHandle = $("#timesliderHandle");
                var timesliderWidth = timeslider.width();
                var queryData = esiContainer.data("curCall");
              
                // now calculate the frequency
                var dataStore = $("#timeScale").data();
                var curFrequency = queryData.freq/1000;
                var newFrequency = Math.floor(curFrequency) + 10;
                
                // figure out the new position for the slider
                var delta = (newFrequency/dataStore.max) * timesliderWidth;
                var frequency = newFrequency * 1000;
                
                timesliderHandle.attr("style", "left: " + (delta - (timesliderHandle.width()/2)) + "px");
                $("#timeSliderWidget").data("frequency", frequency);
                
                
                // get the next data set and cross your fingers
                renderTimebar(queryData.min, queryData.max, frequency);  // this allows the polling to stop and restart.
            }
            else {
                var timeData = data.reverse();
                var isFirstLoad = false;
                var selectedTime = $("#serviceTimeAndDate").data("timeStamp");
                var selectedId   = $("#serviceTimeAndDate").data("temporalObjectId");

                esiContainer.show("slow");
                showNowButton.show("slow");
                $("#serviceTimeAndDate").show("slow");
                $("#mapShowNow").show("slow");
                $("#failedToLoadEbiData").hide("slow");
                $("#noEbiData").hide("slow");
                
                
                
                // ------------------------------------------------------------
                // MANAGE SELECT INPUTS FOR TIME PICKING (CALL FIRST LOAD ONLY)
                // ------------------------------------------------------------
                // 
                // If it is the very first call for the page, the data is a full data set. In the case of the full
                // data set, set up the drop down options.  Later on, if the user starts picking endpoints, we want 
                // to maintain the full set for the options.
                if (esiContainer.data("didFirstLoadOccur") === undefined) {
                    
                    esiContainer.data("didFirstLoadOccur", true);    // signal first load
                    populateTimeSelects(timeData);                        // populate option lists for start and end time selects
                    setupTimeSelectEvents();                              // Drag and Drop
                    
                    isFirstLoad = true;
                }
                    
                // ------------------------------------------------------------
                // USE EVERY TIME CALLED
                // ------------------------------------------------------------
               
                // determine if it is asking for "now" so we make a magic square after the dots
                var lastTimestamp = parseInt(this.url.split("/to/")[1]);
                var lastPos    = 0;
                var lastWasDropped = false;
                
                var max = timeData[0].timeStamp;
                var min = timeData[timeData.length-1].timeStamp;
                
                
                // show current time at the end in a square.
                // currently its data for time is -1 
                // we need to signal that this is now via the temporalObjectId, setting it to "now" (which I might not need anymore)
                if (lastTimestamp == -1) {
                    timeData.push({"timeStamp" : lastTimestamp, "temporalObjectId" : "now"});
                    min = new Date().getTime();
                }

                
                // get ready to roll
                timebar.empty();
                var thisDot = "";
                for (var i=0; i<timeData.length; i++) {
                    var curTimeData    = timeData[i];
                    var curTimestamp   = curTimeData.timeStamp;
                    var curTime4Pretty = curTimeData.timeStamp;
                    var objId          = curTimeData.temporalObjectId;
                    
                    if (curTimestamp == -1) curTime4Pretty = new Date().getTime();
                    
                    // horizontal location for dot
                    var dist = ((max - curTime4Pretty)/(max-min)*100);
                    
                    // vertical location of dot
                    var tooClose = ((dist!==0) && ((dist - lastPos) <= 1));
                    var dotWidth = 15;  // This is the CSS width for the dots.  We should make this more intellegent, though.
                    var lastDotPos = parseInt($("#timeBar :last").css("top"));

                    
                    // ----------------------------------------------------
                    // ADD DOT
                    // ----------------------------------------------------

                    if (curTimestamp == -1)  thisDot = $("<div>", {"class": "timeSquare", "id": objId});                                       // if "now"
                    else                     thisDot = $("<div>", {"class": "timeDot", "id": objId, "title": getPrettyDate(curTimestamp) });   // if a past point
                    
                    // PUT DATA ON DOT
                    thisDot.data(curTimeData);
                    
                    // in the slight case that this was already selected, make it green
                    // when it is the current time: selectedTime == objId and both are "now"
                    // when it is not the current time, selectedTime:  == curTimestamp  but we also need to exclude the bunch that all has the same timestamp, so dig deeper with selectedId  ==  objId 
                    console.log("selectedTime: " + selectedTime + " curTimestamp: " + curTimestamp + " selectedId: " + selectedId + " objId: " + objId);
//                    if (selectedTime == curTimestamp || selectedTime == objId) {
                    
                    // "NOW" - the endpoint is the current time and also the selected time.
                    if (selectedTime == "now" && objId == "now") {
                        console.log("now selected");
                        thisDot.addClass("timeDotSelected");
                    }
                    // if a time in the past is selected.
                    else if ((selectedTime == curTimestamp) && (selectedId == objId)) {
                        console.log("past selected");
                        thisDot.addClass("timeDotSelected");
                    }
                
                
                        
                    // -------------------------------------
                    // calculate position
                    // -------------------------------------
                    // HORIZONTAL
                    // Q. wow, what the heck is this?  
                    // A. The relative positioning is pushed out the width of each element in front of it. 
                    //    The first one is only half and the others are full.
                    var minus = (dotWidth/2) + (i * dotWidth); 

                    // because the border of the selected one seems to push everything over by a few pixels (border on selected has width)
                    // we need ot accomodate for that.
                    if ((curTimestamp == -1 || selectedTime < curTimestamp)){
                        if (selectedTime == "now")
                            minus = minus + 2; 
                        else
                            minus = minus + 4; 
                    }
                         
                    
                    thisDot.css("left", "calc(" + dist + "% - " + minus + "px)"); 
                    thisDot.css("z-index", i);

                    // VERTICAL
                    // If dots are right on top of each other, we move them up or down so all can be seen.
                    // Decide if it is middle, up, or down
                    if (tooClose) {
                        var nextTop = 0;
                        
                        if (lastWasDropped && lastDotPos !== -18) {
                            nextTop = lastDotPos - 6;
                            lastWasDropped = true;
                        }
                        else {
                            nextTop = lastDotPos + 6;
                            lastWasDropped = (nextTop == 18);
                        }

                        thisDot.css("top", nextTop);
                    }
                    else {
                        lastWasDropped = false;
                    }
                    
                    
                    
                    // clean up old selected dot tooltip          
                    if (curTimestamp == -1) {
                        if (selectedTime == "now")  thisDot.tooltip({ content: getTooltipCurrentPoll()});
                        else                        thisDot.tooltip({ content: getTooltipWillShowCurrent()});                
                    }

                    else {
                        var date = new Date(curTimestamp);
                        thisDot.tooltip({ content: getPrettyDate(date) + getTooltipCurrent(selectedTime == curTimestamp) + getTooltipHelp()});
                    }
                       
                    timebar.append(thisDot);
                    
                    // CLICK FUNCTION TO RENDER NEW DIAGRAM
                    thisDot.click(function() {
                        var key = $("#action-container").data("key");
                        var instance = $(this).data("temporalObjectId");
                        var wasSelected = $(".timeDotSelected");
                        var oldTime = wasSelected.data("timeStamp");
                        var curTimeBox = $("#serviceTimeAndDate");
                        

                        if (wasSelected.data("temporalObjectId") == "now")
                            wasSelected.tooltip({content: getTooltipWillShowCurrent()});
                        else 
                            wasSelected.tooltip({content: getPrettyDate(oldTime) + getTooltipCurrent(false) + getTooltipHelp()});               
                        wasSelected.removeClass("timeDotSelected");
                        
                        
                        // stop polling and draw
                        clearInterval($("#action-container").data("intervalHandle"));
                        
                        $(this).addClass("timeDotSelected");
                        if (instance == "now"){
                            var endpointStr = $("#timebarEndStr");
                            var newTime = new Date().getTime();
                            
                            $(this).tooltip({content: getTooltipCurrentPoll()});
                            
                            // update time under status
                            curTimeBox.html($.i18n._("srvc.cur.state"));
                            curTimeBox.data("timeStamp", "now");

                            updateMap();
                            var intervalHandle = setInterval(updateMap, 10000);
                            $("#action-container").data("intervalHandle", intervalHandle);
                            
                            endpointStr.html(getPrettyDate(newTime));
                            endpointStr.data("timeStamp", -1);
                            endpointStr.data("temporalObjectId", instance);
                        }
                            
                        else {
                            var newTime = $(this).data("timeStamp");
                            
                            
                            $(this).tooltip({content: getPrettyDate(newTime) + getTooltipCurrent(true) + getTooltipHelp()});
                            
                            // update time under status
                            curTimeBox.html(getPrettyDate(newTime));
                            curTimeBox.data("timeStamp", newTime);
                            curTimeBox.data("temporalObjectId", instance);
                            
                            renderMap(key, instance, true);
                        }
                    });
                    
                    
                    
                    
                    
                    lastPos = dist;
                    
                    
                    
                    // ----------------------------------------------
                    // SET THE ENDPOINTS
                    // ----------------------------------------------
                    // We know that the query only returned the range 
                    // we want so the first one is always the
                    // start and the last one is always the end.
                    // could use toUTCString instead of getPrettyDate: 
                    // timeData[0].timeStamp.toUTCString
                    // ----------------------------------------------
                    if (i==0) {                
                        var startBay = $("#timebarStartStr");
                        var endBay = $("#timebarEndStr");
                        var beginTime = timeData[0].timeStamp;
                        var endTime = timeData[timeData.length-1].timeStamp;
                        
                        startBay.html(getPrettyDate(beginTime));
                        startBay.data("timeStamp", beginTime);
                        
                        // if endTime == -1, pollEndDate is already handling the html
                        if (endTime !== -1)
                            endBay.html(getPrettyDate(endTime)); 
                        endBay.data("timeStamp", endTime);
                        endBay.data("temporalObjectId", timeData[timeData.length-1].temporalObjectId);

                        // alt text and show the hidden button
                        $("#timebarStart img").attr("title", $.i18n._("srvc.time.change.start"));
                        $("#timebarEnd img").attr("title",  $.i18n._("srvc.time.change.end"));
                        $("#timebarStart span").show();
                        $("#timebarEnd span").show();
                    }
                    
                    // ----------------------------------------------
                    // SET DRAG AND DROP
                    // ----------------------------------------------
                    if (i==timeData.length-1) {

                        // drag these
                        $(".timeDot").draggable({
                            containment: "#timebarContainer",
                            cursor: "move",
                            revert: true
                        });
                        

                        // drop here
                        $("#timebarStartStr").droppable({
                            accept: ".timeDot",
                            hoverClass: "timeDotHover",
                            drop: handleDotDrop
                        });
                        
                        $("#timebarEndStr").droppable({
                            accept: ".timeDot",
                            hoverClass: "timeDotHover",
                            drop: handleDotDrop
                        });
                        
                        // while I am here, I will set the last element to the selected one since I know that is "current"
                        if (isFirstLoad) {
                            thisDot.addClass("timeDotSelected");
                            thisDot.tooltip({content: getTooltipCurrent(true) + getTooltipHelp()});
                        }
                    }
                        

                  

                } // end iteration for timeDots
            }

        }).fail(function(msg, a, b) {
            $("#ebiControls").hide();
            $("#serviceTimeAndDate").hide();
            $("#mapShowNow").hide();
            $("#failedToLoadEbiData").html($.i18n._("esi.msg.failed.to.load")).show("slow");
            $("#noEbiData").hide("slow");
        });  
    }
    
  
};


//-----------------------------------------------------------
//
// CLICK and CHANGE events for SELECTS and DOTS
//
//-----------------------------------------------------------

function setupTimeSelectEvents() {
    // set up drop targets for dots just once
    $("#timebarStartSel").change(function() {
        var min = $(this).val();
        var max = $("#timebarEndStr").data("timeStamp");
        var frequency = $("#timeSliderWidget").data("frequency");

        renderTimebar(min, max, frequency);
        $(this).hide("slow");
        $(this).val("");
    });

    $("#timebarEndSel").change(function() {
        var min = $("#timebarStartStr").data("timeStamp");
        var max = $(this).val();
        var frequency = $("#timeSliderWidget").data("frequency");

        if (max == "now")
            max = -1;

        renderTimebar(min, max, frequency);
        $(this).hide("slow");
        $(this).val("");
    }); 
  
  
    // -----------------------------------------------------------
    // set up click events on the time select
    // -----------------------------------------------------------      
    $("#timebarStart").click(function(a, b, c) {
        $("#timebarStartSel").toggle("slow");
    });
    $("#timebarEnd .btnRound").click(function() {
        $("#timebarEndSel").toggle("slow");
    });
}

// -----------------------------------------------------------
// what to do when the dot is dropped on the start or end time
//-----------------------------------------------------------
function handleDotDrop(event, ui) {
    console.log("drop made");
    var start = 0;
    var end = 0;
    var frequency = $("#timeSliderWidget").data("frequency");

    if ($(this).attr("id") == "timebarStartStr") {
        console.log("drop made - if statement");
        start = ui.draggable.data("timeStamp");
        end = $("#timebarEndStr").data("timeStamp");
       
        // if this has a live end square then keep up the "-1" flag
        if ($("#timebarEndStr").data("temporalObjectId") == "now")
            end = -1;
    }
    else {
        console.log("drop made - if statement");
        end = ui.draggable.data("timeStamp");
        start = $("#timebarStartStr").data("timeStamp");
    }
    
    
    // get rid of drop hint
    $("#timeBar").data("needDropHint", false);
    // get rid of the crosshairs
    $("body").css("cursor", "auto");
    
    console.log("drop render now...");
    renderTimebar(start, end, frequency);
}






//--------------------------------------
// UTILITY FUNCTIONS
//--------------------------------------


// DATES / TIMES

//-------------------------------------------------
// pollEndDate
//-------------------------------------------------
// This function writes out a new time on the right every
// second so it appears like a click is ticking away.
function pollEndDate() {
  if ($(".timeSquare").is(":visible")) {
      $("#timebarEndStr").html(getPrettyDate( new Date().getTime()));
  }
}

// -------------------------------------------------
// populateTimeSelects
// -------------------------------------------------
// Populate the start date/time and end date/time for endpoints.
function populateTimeSelects(timesetList) {
    var endpointSel = $("#timebarEndSel");
    var startpointSel = $("#timebarStartSel");
    
  for (var ts=0; ts<timesetList.length; ts++) {
      var val = timesetList[ts].timeStamp;
      
      startpointSel.append("<option value='" + val + "'>" + getPrettyDate(val) + "</option>");
      endpointSel.append("<option value='" + val + "'>" + getPrettyDate(val) + "</option>");
  }
  
  // Randy needs a "now" feature
   endpointSel.append("<option value='now'>" + $.i18n._("esi.ebi.opt.now") + "</option>");
}



// -------------------------------------------------
// getPrettyDate
// -------------------------------------------------
//Pretty string for UI for time and date format.
function getPrettyDate(dateStr) {
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

// -------------------------------------------------
// TOOLTIPS
// -------------------------------------------------
// after someone drags and drops, we do not need ot hint to them anymore.
function getTooltipHelp() {
    var needHint = $("#timeBar").data("needDropHint");
    if (needHint === undefined || needHint)
        return "<div class='tipInfo'>" + $.i18n._("srvc.tip.drag.time")    + "</div>";
    else
        return "";    
}

function getTooltipWillShowCurrent()     {return "<div class='tipInfo'>" + $.i18n._("srvc.tip.show.current") + "</div>";}
function getTooltipCurrentPoll()         {return "<div class='curDot'>"  + $.i18n._("srvc.tip.current.poll") + "</div>";}
function getTooltipCurrent(isCurrent) {
    if (isCurrent)    return "<div class='curDot'>" + $.i18n._("srvc.tip.current") + "</div>";
    else              return "<div class='tipInfo'>" + $.i18n._("srvc.tip.click.info") + "</div>";
}

