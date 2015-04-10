//--------------------------------------------
// TIME SLIDER WIDGET
//--------------------------------------------
// make this a plugin later.
function renderTimeSlider() {
    var target = $("#timeSliderWidget");
    var sections = 12;
    var numbers=  [0, 10, 20, 30, "", "", 60, "", "", 90, "", "", 120];
    var hairWidth =  "24px";
    
    var timesliderWidth = (parseInt(hairWidth) * (sections + 1) - 2) + "px";
    
    target.append('<div class="timeSlider"  id="timeSlider" style="width: ' + timesliderWidth + ';"><div id="timesliderHandle" class="timesliderHandle"></div></div>');
    
    var times = "";
    
    for (var i=0; i<=sections; i++) {
        var extraClass = "";
        
        if (numbers[i] < 10)    
            extraClass = "timeOne timeSelected";
        
        times = times + '<div class="timeslot" id="slot' + i + '"><span class="timelabel ' + extraClass + '">' + numbers[i] + '</span></div>';
    } 
    
    target.append('<div id="timeScale" class="timeScale">' + times + "</div></div>");
    
    var dataStore = $("#timeScale");
    dataStore.data("min", numbers[0]);
    dataStore.data("max", numbers[numbers.length-1]);
    
    // onclick functions
    $(".timelabel").click(function(ev) {
        var timesHandle = $("#timesliderHandle");
        var slotNo = parseInt($(this).parent().attr("id").replace("slot", ""));
        var percent = slotNo/sections;
        var widgetWidth = $("#timeSlider").width();
        var handleWidth = timesHandle.width();
        var distFromLeft = (widgetWidth * percent) - (handleWidth/2);
        var min = numbers[0];
        var max = numbers[numbers.length -1];
        var returnNum = (max-min) * percent;
        
        timesHandle.attr("style", "left: " + distFromLeft  + "px");
        $(".timeSelected").removeClass("timeSelected");
        $(this).addClass("timeSelected");
        

        var frequency = returnNum * 1000;
        var end = $("#timebarEndStr").data("timeStamp");
        var start = $("#timebarStartStr").data("timeStamp");

        $("#timeSliderWidget").data("frequency", frequency);
        
        renderTimebar(start, end, frequency);
    });
    
    // drag and drop
    // drag these
    $("#timesliderHandle").draggable({
        containment: "#timeSlider",
        cursor: "move"
    });
    

    // drop here
    $("#timeSlider").droppable({
        accept: "#timesliderHandle",
        hoverClass: "handleHover",
        drop: handleHandleDrop
    });
    
};

function handleHandleDrop(ev, ui) {
    var dataStore = $("#timeScale").data();
    var percent = ui.position.left / $("#timeSlider").width();
    var frequency = Math.floor(percent * (dataStore.max-dataStore.min) * 1000);
    var end = $("#timebarEndStr").data("timeStamp");
    var start = $("#timebarStartStr").data("timeStamp");
    
    $("#timeSliderWidget").data("frequency", frequency);
    
    renderTimebar(start, end, frequency);
}