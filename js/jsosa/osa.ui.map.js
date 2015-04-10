(function(o, undefined) {
    o.ui = o.ui || {};

    var __GRIDSIZE = 125;
    var __PADDING = 25;
    var WIDTH_THRESHOLD = 4;
    var lineArray = ["#000000", "#444444", "#6eaecb", "#F4C419", "#965B32"]; // Not used currently, but hold on to color selection here.
    

    o.ui.map = {
        create: function(svgId, nodeMap, diagramTargetId, parentBuffer) {
            this.nodeList = [];
            this.__positions = [];
            this.setNodeMap(nodeMap);
            this.setDiagramTarget(diagramTargetId);
            this.setParentBuffer(parentBuffer);
            this.nodeMap.links = this.sortLinksByOrder(nodeMap.links);
            return this;
        },

        getNodes: function() {
            return this.nodeList;
        },

        getLinks: function() {
            return this.nodeMap.links;
        },
        

        sortLinksByOrder: function(links) {
            var occ = {};

            // Count occurrences of each node.
            for (var i = 0; i < links.length; i++) {
                occ[links[i].from] = occ[links[i].from] ? occ[links[i].from] + 1 : 1;
                occ[links[i].to] = occ[links[i].to] ? occ[links[i].to] + 1 : 1;
            }

            for (var i = 0; i < links.length; i++) {
                if (occ[links[i].from] < occ[links[i].to]) {
                    links[i] = {
                            from:links[i].to, 
                            to:links[i].from,
                            fromData: links[i].toData,
                            toData:links[i].fromData
                    };
                }
            }

            links.sort(function(a, b) {
                return (occ[a] > occ[b]) ? 1 : -1;
            });
            return links;
        },
        
        setDiagramTarget: function(obj) {
            this.target = obj;
        },

        getDiagramTarget: function() {
            return this.target;
        },
        
        setParentBuffer: function(dim) {
            this.parentBuffer = dim || false;
        },

        getParentBuffer: function() {
            return this.parentBuffer;
        },
        

        setNodeMap: function(obj) {
            this.nodeMap = obj;
        },

        getNodeMap: function() {
            return this.nodeMap;
        },
        
        setInstance: function(jsPlumbInstance) {
            this.jsPlumbInstance = jsPlumbInstance;
        },

        getInstance: function() {
            return this.jsPlumbInstance;
        },

        // ---------------------------------------------------
        // USED FOR DIAGRAM ONLY
        // ---------------------------------------------------
        addStatus: function(partId, status) {
            var statusColor = "#000000";
            var strokeColor = "#000000";
            var statusImage = "images/success_badge.png"; 
            var isRotate = false;
            var myInstance = osa.ui.map.getInstance();

            switch (status) {
                // "Good cases"
                case "ACTIVE":
                    statusColor = "#ffffff";
                    statusImage = "images/success_badge.png"; 
                    strokeColor = "#61821F";
                    break;

                // "Bad" cases
                case "DELETED":
                case "ERROR":
                    statusColor = "#ffffff";
                    statusImage = "images/fail_badge.png"; 
                    strokeColor = "#912b1c";
                    break;

                // "Pending?" cases
                case "BUILD":
                case "HARD_REBOOT":
                case "REBOOT":
                case "REBUILD":
                    isRotate = true;
                    statusColor = "#ffffff";
                    statusImage = "images/spinning_badge.png"; 
                    strokeColor = "#82a83e";
                    break;

                // "Alert" cases
                case "PASSWORD":
                case "RESCUE":
                case "RESIZE":
                case "REVERT_RESIZE":
                case "SHUTOFF":
                case "SUSPENDED":
                case "VERIFY_RESIZE":
                    iconColor = 'rgb(255,255,170)';
                    statusColor = 'rgb(236,170,0)';
                    break;

                // "Unknown"
                case "UNKNOWN":
                default:
                    statusColor = "#ffffff";
                    statusImage = "images/pending_badge.png"; 
                    strokeColor = "#DB8313";
                    break;
            }
            
            
            // ---------------------------------------------
            // RENDER STATUS ON TO ELEMENT
            // ---------------------------------------------
            var id = osa.ui.map.target + "_" + partId;
            myInstance.addEndpoint($("#" + id)[0], {
                anchor:["TopLeft"],
                endpoint:["Image", {src: statusImage}]
            });
            
        },

        getRenderedPosition: function(obj) {
            return {
                x: (obj.position.x * __GRIDSIZE) + __PADDING,
                y: (obj.position.y * __GRIDSIZE) + __PADDING
            };
        },

        
        // ------------------------------------------------------
        // MAKE A LINK OBJECT FOR EACH LINK
        // ------------------------------------------------------
        // Used in Step 1
        // build a link object that looks like the following:
        // link: {children:[], parents:[], parentData:[], childrenData:[]}
        // now remember that there will be a fancy rule later on saying if
        // there is no parent, but many children and one child is a site,
        // ten promote that one child site to be a parent site.
        getLinkObj: function(nodeObj) {
            var l = {children:[], parents:[], parentData:[], childrenData:[]};
            for (var i = 0; i < this.nodeMap.links.length; i++) {
                if (this.nodeMap.links[i].from == nodeObj.name) {
                    l.children.push(this.nodeMap.links[i].to);
                    l.childrenData[this.nodeMap.links[i].to] = this.nodeMap.links[i];
                }
                else if (this.nodeMap.links[i].to == nodeObj.name) {
                    l.parents.push(this.nodeMap.links[i].from);
                    l.parentData[this.nodeMap.links[i].from] = this.nodeMap.links[i];
                }
            }
            return l;
        },

        getNodeByName: function(name) {
            for (var i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].name === name) {
                    return this.nodeList[i];
                }
            }
        },

        isPositionTaken: function(x, y) {
            var isFound = false;
            for (var i = 0; i < this.__positions.length; i++) {
                // not only do we need to look at x's position, but since some nodes can be
                // positioned at half-intervals, look there too.
                if (((this.__positions[i].x === x)       && (this.__positions[i].y === y)) ||
                    ((this.__positions[i].x - 0.5 === x) && (this.__positions[i].y === y)) ||
                    ((this.__positions[i].x + 0.5 === x) && (this.__positions[i].y === y))) {
                    isFound = true;
                    break;
                }
            }
            return isFound;
        },
        
        // Used to zoom the new diagram and works around a jQuery zoom bug that sets the container incorrectly
        setZoom: function(zoom, instance, transformOrigin, el) {
              transformOrigin = transformOrigin || [ 0.5, 0.5 ];
              instance = instance || jsPlumb;
              el = el || instance.getContainer();
              var p = [ "webkit", "moz", "ms", "o" ],
                  s = "scale(" + zoom + ")",
                  oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

              for (var i = 0; i < p.length; i++) {
                el.style[p[i] + "Transform"] = s;
                el.style[p[i] + "TransformOrigin"] = oString;
              }

              el.style["transform"] = s;
              el.style["transformOrigin"] = oString;

              instance.setZoom(zoom);    
        },

        render: function() {
            // ---------------------------------------------------
            // STEP 0: DEFINE INTERNAL FUNCTIONS FOR LATER
            // ---------------------------------------------------
            var getDirection = function(type) {
                switch (type) {
                    case "VNF":
                        return -1;
                        break;
                    case "PhysDev":
                        return -1;
                        break;
                    case "Site":
                    default:
                        return 1;
                        break;
                }
            };

 
            var renderDiagamLink = function(parent, child, nodeMap, myInstance) {
                var source = $("#" + getNodeId(osa.ui.map.target, parent.description, parent.name));
                var target = $("#" + getNodeId(osa.ui.map.target, child.description, child.name));
                
                // ---------------------------------------------------
                // CHILD
                // ---------------------------------------------------
                var childData;
                
                if (parent.links.childrenData[child.name])
                    childData = parent.links.childrenData[child.name];
                else 
                    childData = parent.links.parentData[child.name] && parent.links.parentData[child.name];

                // --------------------------------------------------------------------
                // Sometimes we have the case where we made the child site a parent.  
                // In this case, we sadly did not change the parent child from to data,
                // so the parent is listed under children. Look around for the parent
                // --------------------------------------------------------------------
                
                // ---------------------------------------------------
                // PARENT
                // ---------------------------------------------------
                var parentData;
                
                if (child.links.parentData[parent.name])
                    parentData = child.links.parentData[parent.name];
                else 
                    parentData = child.links.childrenData[parent.name];
                
               
                
                
                // ------------------------------------------------
                // INTERCONNECITON
                // ------------------------------------------------
                // We will know if interconnection data is passed in if there is "linkData"
                var interconnectHvr = "";
                var linkData = (child.links.parentData[parent.name] && child.links.parentData[parent.name].linkData) || (child.links.childrenData[parent.name] && child.links.childrenData[parent.name].linkData);

                
                
                if (linkData) {
                    var statIp = linkData.externalGatewayStaticIP;
                    var dhcpCol = linkData.dhcprangeCollection[0];
                    
                    if (linkData.networkCIDR) {
                        interconnectHvr = interconnectHvr + $.i18n._("srvc.ni.sub.cidr") + ": " + linkData.networkCIDR;
                    }
                    
                    if (dhcpCol && dhcpCol.endRange) {
                        var begin = dhcpCol.beginRange;
                        var end = dhcpCol.endRange;
                        
                        interconnectHvr = interconnectHvr + "<br>" + $.i18n._("srvc.ni.dhcp.range") + ": " + begin + " - " + end;
                        
                    }
                    if (statIp !== "") {
                        interconnectHvr = interconnectHvr + "<br>" + $.i18n._("srvc.via") + ": " + statIp;
                    }
                    else {
                        interconnectHvr = interconnectHvr + "<br>" + $.i18n._("srvc.via.dhcp");
                    }
                }
                
                // If there is no interconnection data, then let the user know.  We only want this on the diagram that has additional data so check for that first.
                if (parentData.fromData && interconnectHvr == "")  interconnectHvr = $.i18n._("srvc.hvr.no.subnet");
                
                if (source.length !== 0 && target.length !== 0) {
                    var cori = myInstance.connect({
                        source: source,
                        target: target,
                        endpoint:['Dot', { radius:3}],
                        anchor:[ "Perimeter", {shape:"Square", anchorCount:150 }],
                        connector: "Straight",
                        paintStyle:{"lineWidth":1, strokeStyle:"rgb(68,68,68)" },
                        detachable:false,
                        
                        overlays:[
                                  ["Label", {label:interconnectHvr, visible:false } ]
                                 ],
                        events : {
                            click : function(c) {
                                alert("clicked");
                            },
                            mouseenter : function(c) {
                                c.showOverlay();
                            },
                            mouseleave : function(c) {
                                c.hideOverlay();
                            }
                        }
                    });
                    
                    
                    // ---------------------------------------------------
                    // HOVER TEXT
                    // ---------------------------------------------------
                    var sourceHvrTxt = "";
                    var destHvrTxt = "";
                    
                    // ---------------------------------------------------
                    // PARENT HOVER
                    // ---------------------------------------------------
                    // If parent data, then we can make a hover
                    if (parentData) {
                        var ipInfo  = "";
                        var assignedIp = "";
                        var parentBwData = "";
                        var parentPortData = parentData.fromData;
                        
                        if (parentPortData) {
                            ipInfo = parentPortData.ipaddressInfoCollection;
                            assignedIp = (ipInfo && ipInfo.length > 0) && ipInfo[0].assignedIP || "";   
                            parentBwData = parentPortData.bandwidthProfileCollection;
                            
                            sourceHvrTxt = parentPortData.portName || "";
                            
                            if (assignedIp !== "")    
                                sourceHvrTxt = sourceHvrTxt  + " (" + assignedIp + ")";
                            
                            if (parentBwData && parentBwData.length > 0) {
                                sourceHvrTxt = sourceHvrTxt + "\x0A" + parentBwData[0].bandwidthDirection + ": " + parentBwData[0].displayName;
                                sourceHvrTxt = sourceHvrTxt + "\x0A" + parentBwData[1].bandwidthDirection + ": " + parentBwData[1].displayName;
                            }

                            cori.endpoints[0].canvas.setAttribute("title", sourceHvrTxt);
                        }
                    }
                    
                    


                    // ---------------------------------------------------
                    // CHILD HOVER
                    // ---------------------------------------------------
                    if (childData) {
                        var ipInfo  = "";
                        var assignedIp = "";
                        var childBwData = "";
                        var childPortData = childData.fromData;
                        
                        if (childPortData) {
                            ipInfo = childPortData.ipaddressInfoCollection;
                            assignedIp = (ipInfo && ipInfo.length > 0) && ipInfo[0].assignedIP || "";
                            childBwData = childPortData.bandwidthProfileCollection;
                            
                            destHvrTxt = childPortData.portName || "";
                            
                            if (ipInfo && assignedIp !== "")    
                                destHvrTxt = destHvrTxt + " (" + assignedIp + ")";
                            
                            if (childBwData && childBwData.length > 0) {
                                destHvrTxt = destHvrTxt + "\x0A" + childBwData[0].bandwidthDirection + ": " + childBwData[0].displayName;
                                destHvrTxt = destHvrTxt + "\x0A" + childBwData[1].bandwidthDirection + ": " + childBwData[1].displayName;
                            }

                            cori.endpoints[1].canvas.setAttribute("title", destHvrTxt);
                        }
                    }
                    

                    
                    
                    // DRAG AND DROP BOUNDARIES
                    var containment = $("#diagramField");
                    if (!containment.data("locations")) // if we do not have it, make it.
                        containment.data("locations", {});
                    
                    myInstance.draggable(source, {
                        containment:containment,
                        drag:function(e){
                            containment.data("locations")[$(this).attr("id")] =  $(this).position();
                            $("#buttonRerender").removeClass("disabled");
                        }
                    });
                    myInstance.draggable(target, {
                        containment:containment,
                        drag:function(e){
                            containment.data("locations")[$(this).attr("id")] =  $(this).position();
                            $("#buttonRerender").removeClass("disabled");
                        }
                    });
                }


            };
            
            var getNodeId = function(container, desc, name) {
                return container + "_" + desc.split(" ").join("") + "_" + name.split(" ").join("");
            };
            
            var renderDiagamNodes = function(that, n, myInstance) {
                var tgt = $("#"+osa.ui.map.getDiagramTarget());  // allows flexibility and multiple instances
                if (tgt.length !== 0) {
                    var typeClass = "switch";
                    var desc = n.description;
                    var name = n.name;
                    
                    if (n.type == "VNF") {
                        if (n.description == "SWITCH")
                            typeClass = "switch";
                        else
                            typeClass = "vnf";
                    }
                    else if (n.type == "PhysDev") typeClass = "device";
                    else if (n.type == "Site") typeClass = "site";
                    else typeClass = "diagramEndpoint"; // only seen in devices.
                    
                    var objId = getNodeId(osa.ui.map.target, desc, name);
                    var obj = $("<div>").addClass(typeClass).attr("id", objId).addClass("item").text(name);
                    var innerTitle = $("<div>").addClass("innerType").text(desc);
                    obj.append(innerTitle);
                    
                    var pos = osa.ui.map.getRenderedPosition(n);
                    var uboundDeviceX = pos.x;
                    var uboundDeviceY = pos.y;
                    var deltaX = Math.abs(leftMost);
                    var cntrWidth = tgt.width();
                    var diaWidth = (rightMost+(120) - leftMost);
                    var buffer = (cntrWidth - diaWidth)/2;
                    
                    // there is a chance that we wanted to maintain a manual position - this is not used on the composites page
                    var hasLocations = ($("#diagramField").length>0 && $("#diagramField").data().locations) || false;
                    
                    var hasSavedPosition = false;
                    
                    if (hasLocations)
                        hasSavedPosition = $("#diagramField").data().locations[obj.attr("id")];
                    
                    if (hasSavedPosition) {
                        obj.css({
                            "top": hasSavedPosition.top,
                            "left": hasSavedPosition.left,
                            "position": "absolute"
                          });
                    }
                    else {
                        obj.css({
                            "top": uboundDeviceY,
                            "left": uboundDeviceX + buffer + deltaX + 10*n.position.x, // put right side padding here
                            "position": "absolute"
                          });
                    }

                    if (cntrWidth < diaWidth) {
                        var newScale = Math.floor(cntrWidth/diaWidth * 10) / 10;
                        if (newScale < .1) newScale = .1; // never let the diagram disappear
                        osa.ui.map.setZoom(newScale, myInstance, [0.5, 0.5], tgt[0]);
                        $("#diagramField").data("zoom", newScale);
                    }
                    
                    var locStr = "";
                    if (n.location && n.location.length > 0)
                        locStr = "\n" + $.i18n._("cmn.location") +  ": " + n.location;
                    
                    obj.attr("title", n.name + " (" + n.description + ")" + locStr);
                    tgt.append(obj);
                }
            };

            var getNextPosition = function(nodeObj, parentNode, depth, childIdx) {
                var origX = 0, x = 0, y = depth;
                var direction = getDirection(nodeObj.type);
                var numParents = nodeObj.links.parents.length;
                var numSiblings = (parentNode) ? parentNode.links.children.length : 0;
                var spacing = 1;

                if (parentNode) {
                    if (numSiblings > WIDTH_THRESHOLD) {
                        spacing = 0.5;
                        depthSpacing = (childIdx % 3);
                    }

                    // Augment by:              number of siblings                      number of parents
                    origX = parentNode.position.x + (((numSiblings - 1) / -2) + childIdx) + ((numParents - 1) / 2);
                    x = origX;
                    y = depth;
                }

                while (this.isPositionTaken(x, y)) {
                    x += spacing;
                    if (x > WIDTH_THRESHOLD) {
                        x = origX;
                        y++;
                    }
                }

                this.__positions.push({x:x, y:y});
                return {x:x, y:y};
            };


            // -------------------------------------------------------------
            // STEP 1: Create nodeList from nodeMap
            // -------------------------------------------------------------
            // The nodeList is nodeMap.nodes (no nodeMap.links) plus new 
            // data added to each node.
            // nodeMap.node : cloud, description, location, name, type
            // nodeList.node: cloud, description, location, name, type, 
            //                counted, links, parentsSeen, position, 
            //                rendered, traversed
            // This helps the iterator that steps through the nodes by
            // providing tracking info (psotion, rendered, traversed)
            // as well as neccessary link data

            for (var i = 0; i < this.nodeMap.nodes.length; i++) {
                var n = this.nodeMap.nodes[i];
                this.nodeList.push({name: n.name, type:n.type, description:n.description, location:n.location, cloud:n.cloud, rendered:0, counted:0,
                                    traversed:0, parentsSeen:0, position:null, links:this.getLinkObj(n)});
            }

            
            // -------------------------------------------------------------
            // CLEAN UP THE DIAGRAM
            // -------------------------------------------------------------

            var nodeCori = {};
            var significantSites = [];
            
            for (var z=0; z<this.nodeList.length; z++) {
                nodeCori[this.nodeList[z].name] = {"type": this.nodeList[z].type, "id": z};
            }
            
            
            // ------------------------------------------------------------
            // STEP 2: SPECIAL RULE
            // ------------------------------------------------------------
            // If there are a bunch of children and no parent, but one 
            // child is a site, make it a parent.
            for (var z=0; z<this.nodeList.length; z++) {
                var cur = this.nodeList[z].links;
                var parentCount = cur.parents.length;
                var childCount = cur.children.length;
                

                if (parentCount == 0 && childCount > 1) {
                    for (var w=0; w<cur.children.length; w++) {
                        var curChild = cur.children[w];

                        if (nodeCori[curChild].type == "Site" || nodeCori[curChild].type == "PhysDev") {
                            // move him to the parent role
                            cur.parents[0] = cur.children[w];
                            
                            // now get the data that goes along with him and flip them
                            var curChildrenDetails = cur.childrenData[cur.children[w]];
                            var editedChildrenDetails = {};
                            editedChildrenDetails["from"] = curChildrenDetails.to;
                            editedChildrenDetails["fromData"] = curChildrenDetails.toData;
                            editedChildrenDetails["fromType"] = curChildrenDetails.toType;
                            editedChildrenDetails["to"] = curChildrenDetails.from;
                            editedChildrenDetails["toData"] = curChildrenDetails.fromData;
                            editedChildrenDetails["toType"] = curChildrenDetails.fromType;
                            editedChildrenDetails["linkData"] = curChildrenDetails.linkData;
                            
                            curChildrenDetails = editedChildrenDetails;
                            
                            significantSites.push(cur.children[w]);
                            
                            // fix the other list
                            var curSite = this.nodeList[nodeCori[cur.parents[0]].id];
                            curSite.links.children = curSite.links.parents;
                            curSite.links.parents = [];
                            
                            
                            
                            // now remove the Site from the children list and re-sort the children 
                            // so there is not a gap we know w is now a gap sp we move the rest down 1
                            for (var ch=w; ch<cur.children.length -1; ch++) {
                                cur.children[ch] = cur.children[ch + 1];
                            }
                            // remove the last one that is now a dupe.
                            cur.children.splice(cur.children.length-1);
                        }
                    }
                }
            }
            
            
            
            // Sort nodes by highest order first.
            this.nodeList.sort(function(a, b) {
                    return (a.links.children.length < b.links.children.length) ? 1 : -1;
            });
            
            
            // put sites on top - just bubble up if in special list.
            if (significantSites.length > 0) {
                this.nodeList.sort(function(a, b) {
                    if (significantSites.indexOf(a.name))  
                        return 1;
                    else return -1;

                });
            }
            
            
            // DRAW NEW DIAGRAM
            var leftMost = 0;
            var rightMost = 0;
            var botMost = 0;
            for (var nd = 0; nd < this.nodeList.length; nd++) {
                (function determineDiagramLimits(node, parent, depth, index) {
                    if (node.counted == 0) {    // not counted.
                        node.position = getNextPosition.call(this, node, parent, depth, index);

                        var renderedElem = osa.ui.map.getRenderedPosition(node);
                        
                        if (renderedElem.x < leftMost)
                            leftMost = renderedElem.x;
                        if (renderedElem.x > rightMost)
                            rightMost = renderedElem.x;
                        if (renderedElem.y > botMost)
                            botMost = renderedElem.y;
                        
                        // call myself
                        for (var nd = 0; nd < node.links.children.length; nd++) {
                            determineDiagramLimits.call(this, this.getNodeByName(node.links.children[nd]), node, depth + 1, nd);
                        }
                        node.counted++;    // mark as counted now.
                    }
                }).call(this, this.nodeList[nd], null, 0, 0, 0);
            }  
            
            
            var viewCont = $("#"+osa.ui.map.getDiagramTarget());  // allows flexibility and multiple instances
            var myInstance = jsPlumb.getInstance();
            osa.ui.map.setInstance(myInstance);
            
            
            
            
            myInstance.detachEveryConnection();
            if (!(myInstance.getContainer())) // if I set on the refreshing screen, it breaks.
                myInstance.setContainer(viewCont);
            
            viewCont.empty();
            viewCont.height(botMost + 100);
            for (var childIndex = 0; childIndex < this.nodeList.length; childIndex++) {
                (function renderDiagram(node, parent, depth, index) {
                    if (node.rendered == 0) {    // not rendered.
                        renderDiagamNodes(this, node, myInstance);
                        
                        for (var childIndex = 0; childIndex < node.links.children.length; childIndex++) {
                            renderDiagram.call(this, this.getNodeByName(node.links.children[childIndex]), node, depth + 1, childIndex);
                        }
                        node.rendered++;    // mark as rendered now.
                    }
                    if (parent) {
                        renderDiagamLink(parent, node, this, myInstance);
                    }
                }).call(this, this.nodeList[childIndex], null, 0, 0, 0);
            }
            
            // bufferParent is a number or false.  If a number, then make a height gives me good drag area.
            if (this.getParentBuffer()) {
                var me = $("#" + this.getDiagramTarget());
                var innerHeight = me.height();
                me.parent().height(innerHeight + this.getParentBuffer());
            }

        }

    };
    window.osa = o;

}((window.osa || {}), undefined));




// will convert "AB&amp;C" to "AB&C"
function decodeToPrettyString(html) {
    var div = document.createElement("makeStringPretty");
    div.innerHTML = html;
    return div.childNodes[0].nodeValue;
}


// will convert "AB&C" to "AB&amp;C" 
function decodeToUglyString(encoded) {
    var decoder = $("#decodeToUglyString");
     
    // clean decoder (or create if it does not exist)
    if (decoder.length == 0) {
        $("body").append("<div id='decodeToUglyString'></div>");
        decoder = $("#decodeToUglyString");
    }
    else decoder.empty();
   
    decoder.append(encoded);
    
    return decoder.html();
}