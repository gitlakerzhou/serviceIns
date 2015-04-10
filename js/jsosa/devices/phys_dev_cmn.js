function renderUneditableSlots(data) {
    $("#slotSets").addClass("hide");
    $("#slotSetsUneditable").removeClass("hide");
    
    
    var target = $("#slotSetsUneditable");
    target.empty();
    
    for (var i=1; i<data.maxSlots+1; i++) {
        target.append("<div class='portSlot row'><div class='portSlotSlot'>" + $.i18n._("dev.ps.slot") + ": " + i + "</div><div class='portSlotPort'> " + $.i18n._("dev.ps.ports") + ": " + data.maxPorts + "</div></div>");
        addSlotBlock(parseInt(i)-1, i, data.maxPorts); // for submit
    }
};

// RENDER AND INTERACT WITH SLOT DATA
function addSlotBlock(portSlots, slot, port) {
    var slotNums = [];
    var portNums = [];
    var slotn = "slotName" + portSlots;
    var portn = "portName" + portSlots;
    var slotSets = $("#slotSets");
    var form = $("#physDevPopupForm");
    
    var data = {}; //$("#physDevPopupForm").data("typeData")[$("#form-switchType").val()];
    var editData = form.data("editData");
    if (editData)
        data = form.data("typeData")[editData.physicalDeviceTypeKey];
    else {
        data = form.data("typeData")[$("#form-switchType").val()];
    }
    
    var maxPorts = data.maxPorts;
    var maxSlots = data.maxSlots;
    
    
    
    if (portSlots == maxSlots-1) {
        $("#addSlotButton").hide("slow");
    }
    
    
    slotSets.append("<div class='slotSet' id='slotCntr" + portSlots + "'></div>");
    
    var target = $("#slotCntr" + portSlots);
    
    // set up select data
    for (var i=1; i<maxSlots+1; i++) {slotNums.push({val: i, str: i});}
    for (var j=1; j<maxPorts+1; j++) {portNums.push({val: j, str: j});}
    
    target.addSelect(slotn, $.i18n._("dev.sw.slt.num"), true, true, slotNums, slot, "portWithSlot slotInput");
    target.addSelect(portn, $.i18n._("dev.sw.num.prts"), true, true, portNums, port, "portWithSlot portInput");
    target.append('<div class="slotDeleteBtn btnRound fl"><img src="images/delete.png" title="' + $.i18n._("cmn.delete") + '"></div>');
    
    target.find(".slotDeleteBtn").click(function() {
        $(this).closest(".slotSet").remove();
        
        // remove any port slots above
        if (editData){
            var portsMap = form.data("portsMap");
            editCurrentPortData($("#slotSets"), $("#form-providerPort"), portsMap);
        }
        else 
            setCurrentPortData($("#slotSets"), $("#form-providerPort"));
        
    });
    
    
    // DISABLE SLOTS ALREADY DEFINED
    target.find("select:first").click(function() {
        var others = $(this).closest(".slotSet").siblings(".slotSet");
        
        for (var i=0; i<others.length; i++) {
            var usd = $(others[i]).find("select option:selected").val();
            $(this).find("option[value='" + usd + "']").attr("disabled","disabled");
        }
    });
};

function editCurrentPortData(dataSet, target, portsMap) {
    var rows = dataSet.children(".slotSet");
    var iter=0;
    var portsObj = [];

    
    for (var i=0; i< rows.length; i++) {
        var curRow = $(rows[i]);

        
        // get current slot number
        var n = curRow.children(".slotInput").attr("id").replace("row_slotName", "");
        var curSlot = curRow.find("#slotName" + n).val();
        var curPort = curRow.find("#portName" + n).val();
        
        if (curSlot !== "" && curPort !== "") {
            for (var j=1; j<parseInt(curPort)+1; j++)  {
                var portNum = curSlot + "." + j;
                var portKey = portsMap[portNum] || curSlot + "_" + j;

                portsObj[iter] = {"displayName" : curSlot + "." + j, "key" : portKey};
                iter++;
            }
        }
    }
    var curVal = target.val();
    target.populateSelect(portsObj, true, curVal);
}

function setCurrentPortData(dataSet, target) {
    var rows = dataSet.children(".slotSet");
    var iter=0;
    var portsObj = [];
    
    for (var i=0; i< rows.length; i++) {
        var curRow = $(rows[i]);

        
        // get current slot number
        var n = curRow.children(".slotInput").attr("id").replace("row_slotName", "");
        var curSlot = curRow.find("#slotName" + n).val();
        var curPort = curRow.find("#portName" + n).val();
        
        if (curSlot !== "" && curPort !== "") {
            for (var j=1; j<parseInt(curPort)+1; j++)  {
                portsObj[iter] = {"displayName" : curSlot + "." + j, "key" : curSlot + "_" + j};
                iter++;
            }
        }
    }
    var curVal = target.val();
    target.populateSelect(portsObj, true, curVal);
}

function generatePortData(fields) {

    var p=[];

    for (var i in fields) if (fields.hasOwnProperty(i)) {
        if (i.indexOf('portName') == 0)  {
            // Find the corresponding slot for the port list;
            var slotNum = fields['slotName' + i.replace('portName', '')];

            for (var j = 0; j < parseInt(fields[i]); j++) {
                p.push({
                    'displayName': slotNum + '.' + (j + 1),
                    'ipAddressCollection': []
                });
            }
        }
    }
    
    return p;
}

function comparePortData(data1, data2) {
    var p= [];
   
    for (var i in data1) if (data1.hasOwnProperty(i)) {
        var found = false;
        for (var j in data2) if (data2.hasOwnProperty(j)) {
             if(data1[i].displayName == data2[j].displayName) { 
               p.push({
                    'key' : data2[j].key,
                    'displayName': data2[j].displayName,
                    'ipAddressCollection': []
                });
                found = true;
                break;
                 }  
            }
        if(!found) {
             p.push({
                 'displayName': data1[i].displayName,
                 'ipAddressCollection': []
             });
           }
         }
   
    return p;
}
