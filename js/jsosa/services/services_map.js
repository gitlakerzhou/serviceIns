// ------------------------------------------------------------------------------------
//
// RENDER FUNCTIONS
//
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------
// EBI
// ------------------------------------------------------------------
// This is the new function to get the information from EBI
// id = Temporal object id
function renderMap(id, instance) {

    // this is used
    $.get( "/osa/api/servicesV2/history/" + id + "/instance/" + instance, function( data ) {
        var nodeMap = {nodes:[], links:[]};
        var nodes = {};
        var soStatus = data.serviceOrderStatus;

        $(".serviceTitle").html(data.serviceOrderName);
        $(".serviceStatus").html( "<span class='" + soStatus+"Status'>" + $.i18n._("stat." + soStatus) + "</span>");
        
        
        for (var i = 0; i < data.interConnectionCollection.length; i++) {
            var lft = data.interConnectionCollection[i].endPoints.left;
            var rgt = data.interConnectionCollection[i].endPoints.right;

            var rgtType = "VNF";
            var lftType = "VNF";
            
            if (lft.phyDeviceName) lftType = "PhysDev";
            else if (lft.siteName) lftType = "Site";
            
            if (rgt.phyDeviceName) rgtType = "PhysDev";
            else if (rgt.siteName) rgtType = "Site";
            
            
            nodeMap.links.push({
                from:     lft.vnfname ||  lft.phyDeviceName || lft.siteName,
                to:       rgt.vnfname || rgt.phyDeviceName || rgt.siteName,
                fromType: lftType,
                toType:   rgtType,
                fromData: lft,
                toData:   rgt
            });
        }

        for (var i = 0; i < nodeMap.links.length; i++) {
            nodes[nodeMap.links[i].from] = nodeMap.links[i].fromType;
            nodes[nodeMap.links[i].to] = nodeMap.links[i].toType;
        }

        for (var i in nodes) if (nodes.hasOwnProperty(i)) {
            var type = nodes[i];
            var desc = "";
            var loc = "";
            var cloud = "";
            
            if (nodes[i] == "Site") desc = "Site";
            if (nodes[i] == "PhysDev") desc = "Physical Device";
            
            for (var j = 0; j < data.vnfsCollection.length; j++) {
                if (data.vnfsCollection[j].displayName == i) {
                    desc = data.vnfsCollection[j].vnfTypeKey;
                    loc = data.vnfsCollection[j].cloudLocationName;
                    cloud = data.vnfsCollection[j].cloudName;
                    break;
                }
            }
            nodeMap.nodes.push({name:i, type:type, description:desc, location:loc, cloud:cloud});
        }

        
        // -----------------------------------------------------
        // RENDER MAP
        // -----------------------------------------------------
        var map = osa.ui.map.create('services-details-map', nodeMap, "mapBox", 200); // HISTORY RANGE
        map.render();

        for (var i = 0; i < data.vnfsCollection.length; i++) {
            var v = data.vnfsCollection[i];
            var n = map.getNodeByName(v.displayName);
            n.statusData = v;
        }


        var nodeList = map.getNodes();

        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].type === 'VNF') {
                var v = nodeList[i].statusData;
                var id = v.vnfTypeKey.split(" ").join() + "_" + v.displayName.split(" ").join();
                map.addStatus(id, v.virtualMachineStatus);
            }
        }
    }).fail(function() {
        var msg = $.i18n._("srvc.dia.msg.error.id", id, instance);
        alert(msg);
    });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------
// NON_EBI (ORIGINAL) DIAGRAM
//------------------------------------------------------------------
// This is from the original code and loads the order from
// the original API, not EBI
function updateMap() {
    var key = $("#action-container").data("key");
    
    if (!key) {
        console.log("no key for diagram.");
        osa.page.clearIntervals();
        return; // for some reason the polling was not turned off.
    }
    
    osa.ajax.get('servicesV2', key, function(so) {
        var nodeMap = {nodes:[], links:[]};
        var nodes = {};
        var soStatus = so.serviceOrderStatus;

        $(".serviceTitle").html(so.serviceOrderName);
        $(".serviceStatus").html( "<span class='" + soStatus+"Status'>" + $.i18n._("stat." + soStatus) + "</span>");
        
        
        for (var i = 0; i < so.interConnectionCollection.length; i++) {
            var lft = so.interConnectionCollection[i].endPoints.left;
            var rgt = so.interConnectionCollection[i].endPoints.right;

            var rgtType = "VNF";
            var lftType = "VNF";
            
            if (lft.phyDeviceName) lftType = "PhysDev";
            else if (lft.siteName) lftType = "Site";
            
            if (rgt.phyDeviceName) rgtType = "PhysDev";
            else if (rgt.siteName) rgtType = "Site";
            
            
            nodeMap.links.push({
                from:     lft.vnfname ||  lft.phyDeviceName || lft.siteName,
                to:       rgt.vnfname || rgt.phyDeviceName || rgt.siteName,
                fromType: lftType,
                toType:   rgtType,
                fromData: lft,
                toData:   rgt,
                linkData: so.interConnectionCollection[i].subnet
            });
        }

        for (var i = 0; i < nodeMap.links.length; i++) {
            nodes[nodeMap.links[i].from] = nodeMap.links[i].fromType;
            nodes[nodeMap.links[i].to] = nodeMap.links[i].toType;
        }

        for (var i in nodes) if (nodes.hasOwnProperty(i)) {
            var type = nodes[i];
            var desc = "";
            var loc = "";
            var cloud = "";
            
            if (nodes[i] == "Site") desc = "Site";
            if (nodes[i] == "PhysDev") desc = "Physical Device";
            
            for (var j = 0; j < so.vnfsCollection.length; j++) {
                if (so.vnfsCollection[j].displayName == i) {
                    desc = so.vnfsCollection[j].vnfTypeKey;
                    loc = so.vnfsCollection[j].optimizations.cloudLocationName;
                    cloud = so.vnfsCollection[j].optimizations.cloudName;
                    break;
                }
            }
            nodeMap.nodes.push({name:i, type:type, description:desc, location:loc, cloud:cloud});
        }

        
        // -----------------------------------------------------
        // RENDER MAP
        // -----------------------------------------------------
        var map = osa.ui.map.create('services-details-map', nodeMap, "mapBox", 200);  // DIAGRAM
        map.render();

        
        // -----------------------------------------------------
        // ADD STATUS DATA TO NODE DATA
        // -----------------------------------------------------
        for (var i = 0; i < so.vnfsCollection.length; i++) {
            var v = so.vnfsCollection[i];
            var n = map.getNodeByName(v.displayName);
            n.statusData = v;
        }


        var nodeList = map.getNodes();

        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].type === 'VNF') {
                var v = nodeList[i].statusData;
                var id = v.vnfTypeKey.split(" ").join() + "_" + v.displayName.split(" ").join();
                map.addStatus(id, v.virtualMachineStatus);
            }
        }
    },
    
    // Function to fire on event failure.
    function(resp, a, b) {
        osa.ui.modalBox.warn($.i18n._("srvc.unavailable"));
        osa.page.clearIntervals();
        location.href = "#services-list";
    });
};