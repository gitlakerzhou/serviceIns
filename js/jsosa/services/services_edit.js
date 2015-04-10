//@ sourceURL=http://localhost:8080/ajax/services-edit.js
//var run_servicesEdit = function() {
    

// -----------------------------------------------------------------
// DATA
//
// FORM:     Object { validator={...}, COs={...}, cloudNameById={...}}
//
//          cloudNameById Example:
//            1    "Westford"
//            2    "Boston"
//
//            cloudIdByName:
//            "Westford"    1
//            "Boston"      2
//
//            COs:
//            key            1
//            displayName    "Ashland"
//
//            vnfByName    Object { SWITCH={...}, DEEP_PACKET_INSPECTION={...}...}
//    
// VNF:     Object { VNFInstanceObjs[], vnf-co="1", vnf-instance-name="sw_1", vnf-instance="1", more...}
// 
//            isConnectExtRtr              boolean
//            extGW                        "ip"
//            rangeSet                     array[]
//            subnetCIDR                   "ip"
//            subnetCIDRext                "int"
//            isSwitch                     boolean
//            vnf-instance                 "int"
//            vnf-instance-name            "string"
//            vnf_target_cloud             "int"
//            vnf_target_cmpt_node         "int"
//            vnf-optimization             "string"
//            vnf-portNames                array[]
//            vnfType                      "SWITCH" for example
//
//            Example: $("#so-device--cori_sw_1").data()
//
//    LINKS:  Object { COs, sitesUsed={...}, areIPsEditable, mainForm}
//
//            sitesUsed Example:
//             1    "Site_1"
//             2    "Site_2"
//
//            areIPsEditable    boolean
//            mainForm          "service-edit-form"
//            
//            Example: $("#service_links_container").data()
// -----------------------------------------------------------------


// -----------------------------------------------------------------
// RENDER FORM
// -----------------------------------------------------------------
function services_edit_render_form () {
    var divLeft = $("#service-edit-left"); //service-edit-left

    divLeft.addTextNoInput("service-edit-form-name", "srvc.name");
    divLeft.addTextNoInput("service-edit-form-tenant", "srvc.tenant");
    $("#row_service-edit-form-name").append('<span id="serviceStatus" class="fr"></span>');
    
    service_vdevs_render(divLeft, "edit");
    service_links_render(divLeft, "edit");
    service_btns_render(divLeft, "edit", "save");
    
    $("#edit_service_create_btn").val($.i18n._("srvc.btn.orchestrate"));
    

}

//-----------------------------------------------------------------
// GET DATA
//-----------------------------------------------------------------
function services_edit_get_data() {
    holdTenantMap($("#service-edit-form-tenant"));
    $("#service_links_container").data("areIPsEditable", false);
    $("#service_links_container").data("mainForm", "service-edit-form");
    holdVnfList($("#vnf-instance-list"));
}
    
//------------------------------------------------
// ON LOAD
//------------------------------------------------

(function (__soKey) {
    $("#fs2").hide();
    // FORM
    services_edit_render_form();
    services_edit_get_data();
    
    var $linkListContainer = $("#service_links_container"),
        _vnfList = [],
        _phyDevs =[],
        vnfMetadataForLink =[];
        
        
    $linkListContainer.data("sitesUsed", {});
    

    // TARGET CLOUD DISPLAY NAME
    // Create and Edit are unique
    var getOptimizations = function(fields) {
        var opts = [];

        var cloudName = fields['vnf-optimization'].cloudName || "";
        var aZone = fields['vnf-optimization'].availabilityZone;
        var aggregate = fields['vnf-optimization'].hostAggregate;
        var computeNode = fields['vnf-optimization'].computeNode;
        // sometimes the API used cloudLocaiton and other times CloudLocaitonName
        var cloudLocationName = fields['vnf-optimization'].cloudLocationName;
        
        var cloudID = fields['vnf-optimization'].cloudKey || "0";
        var aZoneID = fields['vnf-optimization'].availabilityZoneKey || "0";
        var aggregateID = fields['vnf-optimization'].hostAggregateKey || "0";
        var computeNodeID = fields['vnf-optimization'].computeNodeKey || "0";
        var cloudLocationID = fields['vnf-optimization'].cloudLocationKey || "0";
        
        
        opts.push({"@cloudName" : cloudName, "@cloudID" : cloudID, 
                   "@cloudLocationName" : cloudLocationName, "@cloudLocationID" : cloudLocationID, 
                   "@availabilityZone" : aZone, "@availabilityZoneID" : aZoneID, 
                   "@hostAggregate" : aggregate, "@hostAggregateID" : aggregateID,
                   "@computeNodeGuid" : computeNode, "@computeNodeGuidID" : computeNodeID });
        return opts;
    };

    var getVNFTypeByName = function(name) {
        for (var i = 0; i < _vnfList.length; i++) {
            if (_vnfList[i].displayName == name) {
                return _vnfList[i];
            }
        }
    };
    
    // Load the service order from the system and populate the page.
    var processServiceOrderDesc = function(key) {
        
        $("#buttonRerender").html($.i18n._("srvc.dia.repaint"));
        $("#buttonRerender").click(function(ev) {
            if (!($(this).hasClass("disabled"))) {
                $(this).addClass("disabled");
                $("#diagramField").data("locations", {});
                generateMap();
            }
        });
        
        // INITIAL POPULATION
        osa.ajax.get('servicesV2', key, function(soData) {
            var tenantInpt = $("#service-edit-form-tenant");
            var soStatus = soData.serviceOrderStatus;
            var tenantId = soData.tenantKey;
            
            $("#service-edit-form-name").html(soData.serviceOrderName);
            tenantInpt.html(soData.tenantName);
            tenantInpt.data("tenantKey", tenantId);
            $("#service-edit-form").data("tenantId", tenantId);
            
            
            $("#serviceStatus").addClass(soStatus + "Status");
            $("#serviceStatus").html( $.i18n._("stat." + soStatus));
            if (soStatus !== "running") $("#edit_service_create_btn").attr("disabled", "disabled");
            
            
            if (soData.tenantName == "") {
                $.get( "/osa/api/tenants/get/", function( data ) {
                    tenantInpt.html(data.tenantName);
                    tenantInpt.data("tenantKey", data.key);
                    // Used for building links, but timely to call when the tenant id is certain.
                    holdSitesOfTenant(data.key, "service_links_container");
                    getCOsAndFreeEditLinks(data.key);
                });
            } else {
                // Used for building links, but timely to call when the tenant id is certain.
                holdSitesOfTenant(tenantId, "service_links_container");
                getCOsAndFreeEditLinks(tenantId);
            }


            // VIRTUAL DEVICES
            // Process the VNFs and add the instances to the list.
            for (var i = 0; i < soData.vnfsCollection.length; i++) {
                var currVnf = soData.vnfsCollection[i];
                var vnfDisplayName = currVnf.displayName;
                var customOpt = currVnf.optimizations;
                var cloudName = customOpt.cloudName;
             
                var portList = currVnf.portCollection.map(function(e) {
                    return e.displayName;
                });

                var metadata = {
                    "vnf-instance": getVNFTypeByName(currVnf.vnfTypeKey).key,
                    "vnf_target_cloud": $("#service-edit-form").data("cloudIdByName")[cloudName], 
                    "vnf-optimization": customOpt,
                    "vnf-instance-name": currVnf.displayName,
                    "vnfType" : soData.vnfsCollection[i].vnfTypeKey,
                    "isSwitch" : $("#vnf-instance-list").data("switchMap")[soData.vnfsCollection[i].vnfTypeKey],
                    "scaleAlarmProfileDTO" : soData.vnfsCollection[i].scaleAlarmProfileDTO,
                };
                
                // add properties
                var custProps = currVnf.vnfInstanceProperties;
                for (var p = 0; p<custProps.length; p++) {
                    // if (custProps[p].) // no signal for custom proptery to enter
                    metadata["property-" + custProps[p].vnfTypePropertyKey] = custProps[p].propertyValue;
                }
                
                
              
                vnfMetadataForLink.push({"key": currVnf.key, 
                    "vnf-instance": getVNFTypeByName(currVnf.vnfTypeKey).key,
                    "vnf_target_cloud": $("#service-edit-form").data("cloudIdByName")[cloudName],
                    "vnf-optimization": customOpt,
                    "vnf-instance-name": currVnf.displayName,
                    "vnfType" : soData.vnfsCollection[i].vnfTypeKey,
                    "scaleAlarmProfileDTO" : soData.vnfsCollection[i].scaleAlarmProfileDTO,
                    "portCollection": currVnf.portCollection, "vnf-portNames": portList});

                createVirtualDevice(vnfDisplayName, portList, metadata);
            }
            
            var getMetaData = function(key) {
                for (var i = 0; i < vnfMetadataForLink.length; i++) {
                    if (vnfMetadataForLink[i].key == key) {
                        return vnfMetadataForLink[i];
                    }
                }
                return;
            };
            
            var getDeviceData = function(key, dname, pkey, pname) {
                  var phyDevSize = _phyDevs.length; 
                  for( var i= 0; i <phyDevSize; i++) {
                      if(_phyDevs[i].key == key) {
                          var pc = _phyDevs[i].portCollection;
                          for(var j=0 ; j<pc.length;j++) {
                              if(pc[j].key == pkey) {
                                  return;  
                              }
                          }
                          pc.push({'displayName': pname, 'key': pkey});
                          return;
                      }
                  }
                  var portSCollection = [{'displayName': pname, 'key': pkey}];
                  _phyDevs.push({'displayName': dname, 'key': key, 'portCollection': portSCollection});
           };
            
           
            var getPDeviceData = function(key) {
                for (var i = 0; i < _phyDevs.length; i++) {
                    if (_phyDevs[i].key == key) {
                         return {'key': _phyDevs[i].key, 
                                   'displayName': _phyDevs[i].displayName,
                                   'portCollection': _phyDevs[i].portCollection}; 
                    }
                }
                return;
            };
            
            
            // LINKS
            // Process the interconnections and add them to the list of links.
            for (var i in soData.interConnectionCollection) if (soData.interConnectionCollection.hasOwnProperty(i)) {
                var src = soData.interConnectionCollection[i].endPoints.left;
                var dst = soData.interConnectionCollection[i].endPoints.right;
                var subnet = soData.interConnectionCollection[i].subnet;
                var srcIsSwitch = false;
                var srcName = "";
                var dstName = "";
                var srcMetaData = "";
                var dstMetaData = "";
                var srcDevId = "";
                var dstDevId = "";
                
                var srcStatIpStr = "";
                var dstStatIpStr = "";
                var srcSubnetStr = "";
                var dstSubnetStr = "";
                var subnetStr = "";
                

                
                var srcEpIpData = (src.ipaddressInfoCollection && src.ipaddressInfoCollection[0]) || {};
                var dstEpIpData = (dst.ipaddressInfoCollection && dst.ipaddressInfoCollection[0]) || {};
                
                // Endpoints
//                var srcHasFlIp = false;
//                var dstHasFlIp = false;
                
                
//                SOURCE
                var srcDevType = "site";
                
                // PHYSICAL DEVICE
                if (src.phyDeviceName !== undefined) {
                    srcDevType = "physical";
                    srcName = src.phyDeviceName;
                    srcDevId = src.phyDeviceKey;
                    getDeviceData(srcDevId, srcName, src.portKey, src.portName);
                    srcMetaData = getPDeviceData(src.phyDeviceKey);
                    srcMetaData["location"] = {"centralOfficeKey": src.locationKey, "displayName": src.locationName};
                }
                // VNF
                else if (src.vnfname !== undefined) {
                    srcDevType = "virtual";
                    srcName = src.vnfname;
                    srcDevId = src.vnfname;
                    srcMetaData = getMetaData(src.vnfid);                    
                    var asgndIP = src.ipaddressInfoCollection[0].assignedIP;
                    if (asgndIP !== null && asgndIP !== "") srcStatIpStr = " (" + src.ipaddressInfoCollection[0].assignedIP + ")";
                    if (srcEpIpData.assignFloatingIP) srcSubnetStr = $.i18n._("srvc.has.float.ip");      
                    srcIsSwitch = $("#vnf-instance-list").data("switchMap")[srcMetaData.vnfType];
                }
                // SITE
                else { // "site"
                    srcName = src.siteName;
                    srcDevId = src.siteKey;
                    src["location"] = {"centralOfficeKey": src.locationKey, "displayName": src.locationName},
                    srcMetaData = src; 
                }                
                
//              DESTINATION
                var dstDevType = "site";
                if (dst.phyDeviceName !== undefined) {
                    dstDevType = "physical";
                    dstName = dst.phyDeviceName;
                    dstDevId = dst.phyDeviceKey;
                    getDeviceData(dstDevId, dstName, dst.portKey, dst.portName);
                    dstMetaData = getPDeviceData(dstDevId); 
                    dstMetaData["location"] = {"centralOfficeKey": dst.locationKey, "displayName": dst.locationName};
                }
                else if (dst.vnfname !== undefined) {
                    dstDevType = "virtual";
                    dstName = dst.vnfname;
                    dstDevId = dst.vnfname;
                    dstMetaData = getMetaData(dst.vnfid);
                    var asgndIP = dst.ipaddressInfoCollection[0].assignedIP;
                    if (asgndIP !== null && asgndIP !== "") dstStatIpStr = " (" + dst.ipaddressInfoCollection[0].assignedIP + ")";
//                    dstHasFlIp = dst.ipaddressInfoCollection[0].assignFloatingIP;
                    if (dstEpIpData.assignFloatingIP) dstSubnetStr = $.i18n._("srvc.has.float.ip");
                }
                else { // "site"
                    dstName = dst.siteName;
                    dstDevId = dst.siteKey;
                    dst["location"] = {"centralOfficeKey": dst.locationKey, "displayName": dst.locationName},
                    dstMetaData = dst; 
                }
                
                // Interconnections
                var subnetCidrForVNF = "";
                var rangeSetForVNF = [];
                var extGwForVNF = "";
                var hasExtGW = false;
                
                if (subnet !== null) {
                    var subnetRange  = "";
                    var nwCIDR = subnet.networkCIDR;
                    
                    // CIDR
                    if (nwCIDR !== null && nwCIDR !== "") {
                        subnetStr = $.i18n._("srvc.ni.sub.cidr") + ": " + nwCIDR;
                        subnetCidrForVNF = nwCIDR;
                    }
                    
                    // RANGE
                    if (subnet.dhcprangeCollection.length > 0) {
                        var rangeCol =  subnet.dhcprangeCollection;
                        for (var j = 0; j< rangeCol.length; j++) {
                            subnetRange = subnetRange + "<br>" + $.i18n._("srvc.ni.dhcp.range") + ": " + rangeCol[j].beginRange + " - " + rangeCol[j].endRange;
                            rangeSetForVNF.push({"begin" : rangeCol[j].beginRange, "end" : rangeCol[j].endRange}); 
                        }
                    }
                        
                    subnetStr = subnetStr + subnetRange;
                    
                    // EXTERNAL GW
                    if (subnet.externalGatewayStaticIP !== "" && subnet.externalGatewayStaticIP !== null) {
                        subnetStr = subnetStr + "<br>" + $.i18n._("srvc.via") + ": " + subnet.externalGatewayStaticIP;
                        extGwForVNF = subnet.externalGatewayStaticIP;
                    }
                    
                    if (subnet.externalGatewayStaticIP == "" && subnet.externalGateway) {
                        if (subnetStr.length !== 0)
                            subnetStr = subnetStr + "<br>";
                        subnetStr = subnetStr + $.i18n._("srvc.via.dhcp");
                    }
                    
                    // ----------------------------------------------------
                    // Deal with VNF object box to carry data into edit
                    // ----------------------------------------------------
                    // assume destination is the switch at first.
                    var vnfBox = $("#so-device--" + dstName);
                    
                    // but if it is the source, reset vnfBox target.
                    if (srcIsSwitch) {
                        vnfBox = $("#so-device--" + srcName);
                    }
                    
                    if (subnet.externalGateway !== null && subnet.externalGateway !== "")
                        hasExtGW = subnet.externalGateway;
                    extGwIp = subnet.externalGatewayStaticIP || "";
                    var subnetCidrArr = subnetCidrForVNF.split("/");
                    
                    vnfBox.data("extGW", extGwIp);
                    vnfBox.data("isConnectExtRtr", hasExtGW);
                    vnfBox.data("subnetCIDR", subnetCidrArr[0]);
                    vnfBox.data("subnetCIDRext", subnetCidrArr[1]);
                    vnfBox.data("rangeSet", rangeSetForVNF);                    
                } 
                
                // BANDWIDTH
                var srcBwStr = "";
                var srcBwTo = "";
                var srcBwFrom = "";
                var srcBwToId = "";
                var srcBwFromId = "";
                
                
                if (srcDevType == "site" || srcDevType == "physical") {
                    var bwData = src.bandwidthProfileCollection;
                    
                    if (bwData !== undefined) {
                        for (var bw=0; bw<bwData.length; bw++) {
                            if (bwData[bw].bandwidthDirection == "ToCustomer") {
                                srcBwTo = bwData[bw].displayName;
                                srcBwToId = bwData[bw].key;
                            }
                            if (bwData[bw].bandwidthDirection == "FromCustomer") {
                                srcBwFrom = bwData[bw].displayName;
                                srcBwFromId = bwData[bw].key;
                            }            
                        }
                        
                        srcMetaData.bandwidthProfileCollection = [];
                        srcMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "ToCustomer", "displayName" : srcBwTo, "key" : ""});
                        srcMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "FromCustomer", "displayName" : srcBwFrom, "key" : ""});
                        
                        srcBwStr = prettyBandwidth(srcBwTo, srcBwFrom);
                    }

                }
                
                var dstBwStr = "";
                var dstBwTo = "";
                var dstBwFrom = "";
                var dstBwToId = "";  
                var dstBwFromId = "";
                
                if (dstDevType == "site" || dstDevType == "physical") {
                    var bwData = dst.bandwidthProfileCollection;

                    
                    if (bwData !== undefined) {
                        for (var bw=0; bw<bwData.length; bw++) {
                            if (bwData[bw].bandwidthDirection == "ToCustomer") {
                                dstBwTo = bwData[bw].displayName;
                                dstBwToId = bwData[bw].key;
                            }
                            if (bwData[bw].bandwidthDirection == "FromCustomer") {
                                dstBwFrom = bwData[bw].displayName;
                                dstBwFromId = bwData[bw].key;
                            }            
                        }
                        
                        dstMetaData.bandwidthProfileCollection = [];
                        dstMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "ToCustomer", "displayName" : dstBwTo, "key" : ""});
                        dstMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "FromCustomer", "displayName" : dstBwFrom, "key" : ""});
                        
                        dstBwStr = prettyBandwidth(dstBwTo, dstBwFrom); 
                    }
                }
                
                
                if (srcBwStr !== "") srcSubnetStr = srcBwStr;
                if (dstBwStr !== "") dstSubnetStr = dstBwStr;
                
                // ------------------------------------------------------------
                //    ADD LINK FORM
                // ------------------------------------------------------------ 
                linkBox = $("#so-link-block").clone().removeAttr("id");
                renderPrLnkDataMain(linkBox, srcName, src.portName, dstName, dst.portName, subnetStr);
                renderPrLnkDataAux(linkBox, srcStatIpStr, srcSubnetStr, dstStatIpStr, dstSubnetStr);   

                
                linkBox.data({
                    'src-dev'        :  srcDevId,
                    'src-port'       : src.portName,
                    'src-name'       : srcName,
                    'src-type'       : srcDevType,
                    'src-metadata'   : srcMetaData,
                    'src_site_name'  : src.siteName,
                    'src_site_id'    : src.siteKey,
                    "srcCentOfcName" : src.centralOfficeName || "",
                    "srcCentOfcId"   : src.centralOfficeKey || "",
                    "srcEpIpData"    : srcEpIpData,
                    'dst-dev'        : dstDevId,
                    'dst-port'       : dst.portName,
                    'dst-name'       : dstName,
                    'dst-metadata'   : dstMetaData,
                    'dst-type'       : dstDevType,  
                    'dst_site_name'  : dst.siteName,
                    'dst_site_id'    : dst.siteKey,   
                    "dstCentOfcName" : dst.centralOfficeName || "",
                    "dstCentOfcId"   : dst.centralOfficeKey || "",
                    "dstEpIpData"    : dstEpIpData,
                    'nwIntCIDR'      : subnetCidrForVNF,
                    'nwHasExtGW'     : hasExtGW,
                    'nwExtGW'        : extGwForVNF,
                    'nwDhcpRanges'   : rangeSetForVNF,

                    // BANDWIDTH PROFILES
                    "srcBwFrom"    : srcBwFromId,
                    "srcBwFromStr" : srcBwFrom,
                    "srcBwTo"      : srcBwToId,
                    "srcBwToStr"   : srcBwTo,
                    
                    "dstBwFrom"    : dstBwFromId,
                    "dstBwFromStr" : dstBwFrom,
                    "dstBwTo"      : dstBwToId,
                    "dstBwToStr"   : dstBwTo
                }).appendTo($linkListContainer);
            }

            $("#edit_service_add_link").parent().removeClass("hide");
            $("#edit_service_add_link").removeAttr("disabled").removeClass("disabled");
            
            updatePortAvailability();
            generateMap();
        });
    };

    // Get All of the available VNF images and store them for the popup so
    // the popup doesn't have to get the list every time.
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        var form = $("#service-edit-form");
        var vnfByName = {};
        
        for (var i = 0; i < vnfList.length; i++) {
            _vnfList.push(vnfList[i]);
            vnfByName[vnfList[i].displayName] = vnfList[i];
        }

        osa.ajax.list('centralOfficeCompositeVNFTypes', function(cvnfList) {
            for (var j = 0; j < cvnfList.length; j++) {
                cvnfList[j].availableCustomOptimizations = [];
                cvnfList[j].vnfTypeProperties = [];
                _vnfList.push(cvnfList[j]);
                vnfByName[cvnfList[j].displayName] = cvnfList[j];
            }
            
            form.data("vnfByName", vnfByName, false, true);

            // Pull the list of clouds
            osa.ajax.list('clouds', function(cloudList) {
                var cloudIdByName = {};
                var cloudNameById = {};

                for (var j=0; j<cloudList.length; j++) {
                    cloudIdByName[cloudList[j].displayName] = cloudList[j].key;
                    cloudNameById[cloudList[j].key] = cloudList[j].displayName;

                }
                form.data("cloudIdByName", cloudIdByName);
                form.data("cloudNameById", cloudNameById);

                processServiceOrderDesc(__soKey);
            });
            
            // put a map in the data object for later
            var mapVNFsIsSwitch = [];
            
            for (var i=0; i< _vnfList.length; i++) {
                // does it have a switch attribute?
                var attrs = _vnfList[i].vnfTypeAttributes;
                
                // first test is to see if there is a property called vnfTypeAttributes 
                // which may or may not contain switch information
                if (attrs !== undefined && attrs.length > 0) {
                    for (var j=0; j<attrs.length; j++) {
                        if (attrs[j].name == "OvrSwitch" && attrs[j].value == "true")
                            mapVNFsIsSwitch[_vnfList[i].displayName] = true;
                        else // does not have a switch
                            mapVNFsIsSwitch[_vnfList[i].displayName] = false;
                    }
                }
                else  // does not have vnfTypeAttributes therefore is not a switch 
                    mapVNFsIsSwitch[_vnfList[i].displayName] = false;
            }
            
            $("#vnf-instance-list").data("switchMap", mapVNFsIsSwitch);
        });
        
        $("#edit_service_add_vnf").parent().removeClass("hide");
    });

    
    // Pull the list of clouds
    getCloudDataForCreate($("#service-edit-form"));

    // ---------------------------------------------------
    // ADD LINK
    // ---------------------------------------------------
    // Adding a link to the Service Order will clone the block that currently exists and
    // renumbers the elements to keep them in order.
    $("#edit_service_links_hdr .rightBtn").on('click', function(ev) {
        ev.preventDefault();
        if ($(this).hasClass("disabled")) { // do not let the user click until the tenant is selected
            return false;
        }

        var tenantId = $("#service-edit-form-tenant").data("tenantKey");
        var hasPhysDev = osa.auth.getPageAccess('physicalDevices').read;
        var isForCustomer = $("#service-edit-form-tenant").data("tenantToTypeStrMap")[$("#service-edit-form-tenant").html()] == "CUSTOMER";    // used to determine if site is required
        var p = osa.ui.formPopup.create($.i18n._("srvc.edtLink"), null, {submitLabel: $.i18n._("srvc.edtLink")});
        
        
        p.$CONTAINER.appendTo('body').hide();
        
        var linkBox = $("#service_links_container");
        services_create_link_render_form(isForCustomer, hasPhysDev);
        services_create_link_populate_data(tenantId, hasPhysDev, linkBox);
        services_create_link_events(tenantId, linkBox);        
        
        // ------------------------------------------------------------
        // SUBMIT the ADD LINK FORM
        // ------------------------------------------------------------  
        p.setSubmitAction(function(fields) {
            if ($("#servicesCreateLinkForm").valid()) {
                services_create_link_save_link("service_links_container", fields);
                updatePortAvailability();
                generateMap();
                return true;
            }
            else return false;
        });

        
        // ------------------------------------------------------------
        // SHOW the ADD LINK FORM
        // ------------------------------------------------------------         
        p.reveal();
    });
    
    // ------------------------------------------------------------
    //
    // ADD VNF BUTTON
    //
    // ------------------------------------------------------------
    // Popup creation for adding a VNF to the SO   
    $("#edit_service_devices_hdr .rightBtn").on('click', function(ev) {
        ev.preventDefault();
        var form = $("#service-edit-form");
        
        // ------------------------------------------------------------
        // ADD VNF FORM
        // ------------------------------------------------------------
        p = services_create_vnf_render_form(form);
        services_create_vnf_populate_data("service-edit-form");
        services_create_vnf_events("service-edit-form");

        // ------------------------------------------------------
        // SAVE THE NEW VNF
        // ------------------------------------------------------
        p.setSubmitAction(function(fields) {
            // determine if I need to explode out the items in the VNF list due to a composite
            var compData = $("#vnf-instance-list").data("VNFCompositeObjs");
            var comp = compData[ $("#vnf-instance").val()];
            
            if (comp !== undefined) {
                explodeComposite(comp, fields);
            }
            else {
                create_vnf(fields, _vnfList);
            }
            
            generateMap();
        });

        p.setRequiredFields(['vnf-instance-name', 'vnf-instance']);
        p.hideField('vnf-optimization');
        p.reveal();
    });



    // --------------------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------------------
    $("#service-edit-form").submit(function(ev) {
        ev.preventDefault();
        var so = {}, cos = {};
        
        // -----------------------------------------------------------------
        // BUILD XML
        // -----------------------------------------------------------------
        so['ServiceOrderDesc'] = {
                '@serviceName': $("#service-edit-form-name").html(),
                '@tenantName':  $("#service-edit-form-tenant").html(),
                '@tenantKey': $("#service-edit-form-tenant").data("tenantKey"),
                '@xsi:schemaLocation': __ROOTURL + "/xml/ServiceOrderRequestVersion2_1.xsd",
                '@xmlns': "http://www.overturenetworks.com/ServiceOrderRequestVersion2_1",
                '@xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                'ServiceOrderCarrier': []
            };
        
        $linkListContainer.find(".so-link-block").each(function(i, el) {
            var linkData = $(el).data();
            var co = linkData["co"]; // create has undefined as well and it works

            // If the existing object already exists, use it, otherwise, create the buckets to
            // to store things in.
            cos[co] = cos[co] || {VNF: {}, PhysDevs: {}, InterConnections: [], Sites: {} };

            // ---------------------------------------
            // Add the source device
            // ---------------------------------------
            if (linkData['src-type'] === 'physical') {
                cos[co].PhysDevs[linkData['src-dev']] = linkData['src-metadata'];
                for (var i = 0; i < linkData['src-metadata'].portCollection.length; i++) {
                    cos[co].PhysDevs[linkData['src-dev']].portCollection[i].soid = generateID();
                }
            }
            else if (linkData['src-type'] === 'virtual') {
                cos[co].VNF[linkData['src-dev']] = linkData['src-metadata'];
                cos[co].VNF[linkData['src-dev']].portCollection = [];
                var portNames = linkData['src-metadata']['vnf-portNames'];
                for (var i = 0; i < portNames.length; i++) {
                    cos[co].VNF[linkData['src-dev']].portCollection.push({key:i, soid: generateID(), displayName: portNames[i]});
                }
                
                var vnfDataObj =$("#so-device--" + cos[co].VNF[linkData['src-dev']]["vnf-instance-name"]).data();
                
                
                for (var v in vnfDataObj) {
                    if (v.indexOf("property-") !== -1) {
                        cos[co].VNF[linkData['src-dev']][v] = vnfDataObj[v];
                    }                    
                }
                
            } else {
                // src-type is "site" and we do not care about the ports
                cos[co].Sites[linkData['src-dev']] = linkData['src-metadata'];
            }

            // ---------------------------------------
            // Add the destination device
            // ---------------------------------------
            if (linkData['dst-type'] === 'physical') {
                cos[co].PhysDevs[linkData['dst-dev']] = linkData['dst-metadata'];
                for (var i = 0; i < linkData['dst-metadata'].portCollection.length; i++) {
                    cos[co].PhysDevs[linkData['dst-dev']].portCollection[i].soid = generateID();
                }
            }
            else if (linkData['dst-type'] === 'virtual') {
                cos[co].VNF[linkData['dst-dev']] = linkData['dst-metadata'];
                cos[co].VNF[linkData['dst-dev']].portCollection = [];
                var portNames = linkData['dst-metadata']['vnf-portNames'];
                for (var i = 0; i < portNames.length; i++) {
                    cos[co].VNF[linkData['dst-dev']].portCollection.push({key:i, soid: generateID(), displayName: portNames[i]});
                }
                var vnfDataObj =$("#so-device--" + cos[co].VNF[linkData['dst-dev']]["vnf-instance-name"]).data();
                
                for (var v in vnfDataObj) {
                    if (v.indexOf("property-") !== -1) {
                        cos[co].VNF[linkData['dst-dev']][v] = vnfDataObj[v];
                    }                    
                }
            } else { // src-type is "site"
                cos[co].Sites[linkData['dst-dev']] = linkData['dst-metadata'];
            }

            // Add the interconnection
            cos[co].InterConnections.push({
                                'src-dev':  linkData['src-dev'],
                                'src-port': linkData['src-port'],
                                'src-site': linkData['src-site'],
                                'dst-dev':  linkData['dst-dev'],
                                'dst-port': linkData['dst-port'],
                                'dst-site': linkData['dst-site']
            });
        });
        
        // Now that we have the data transformed in the right way,
        // build the json that represents the XML object
        var xmlSOCs = {};

        for (var i in cos) if (cos.hasOwnProperty(i)) {
            xmlSOCs[i] = {}; // may not always have a VNF since we have sites now.
            xmlSOCs[i].VirtualizedNetworkFunctions = {}; // require the container even if empty
            
            // Build the VNF Information
            if (Object.keys(cos[i].VNF).length > 0) {
                xmlSOCs[i].VirtualizedNetworkFunctions.VirtualizedNetworkFunction = [];
                for (var j in cos[i].VNF) if (cos[i].VNF.hasOwnProperty(j)) {
                    cos[i].VNF[j].soid = generateID();
                    
                    // removed id
                    var curObj = cos[i].VNF[j];
                    xmlSOCs[i].VirtualizedNetworkFunctions.VirtualizedNetworkFunction.push({
                        '@name': curObj['vnf-instance-name'],
                        '@type': getVNFType(curObj['vnf-instance'], _vnfList),
                        'Ports': getPorts(curObj.portCollection),
                        '@customOptimization': curObj["vnf-optimization"].customOptimization || '',
                        'Optimizations': getOptimizations(curObj),
                        'InstanceProperties': getProperties(curObj),
                        "ScaleAlarmProfile" : getScaleAlarmProfiles(curObj),
                    });
                }
            }

            // --------------------------------------------------------------------------
            // INTERCONNECTIONS
            // Build the Interconnection information (Removed old way and replaced with this.)
            // --------------------------------------------------------------------------
            var xmlIntrCntcs = {};            // This is the object we will build and place in the XML
            xmlIntrCntcs['InterConnections'] = {};
            var intrCnctns = xmlIntrCntcs.InterConnections;
            
            $linkListContainer.find(".so-link-block").each(function(i, el) {
                var linkData = $(el).data();
                
                var dstObj = {id:           linkData["dst-dev"],
                              metadata:     linkData["dst-metadata"],
                              name:         linkData["dst-name"],
                              port:         linkData["dst-port"],
                              site:         linkData["dst_site_name"],
                              siteID:       linkData["dst_site_id"],
                              type:         linkData["dst-type"],
                              hasFlIp:      linkData.dstEpIpData.assignFloatingIP,
                              statIP:       linkData.dstEpIpData.staticIP,
                              centOfcId:    linkData.dstCentOfcId || "",
                              centOfcName:  linkData.dstCentOfcName || "",
                              bwFromStr:    linkData.dstBwFromStr,
                              bwToStr:      linkData.dstBwToStr,
                };

                var srcObj = {id:           linkData["src-dev"],
                              metadata:     linkData["src-metadata"],
                              name:         linkData["src-name"],
                              port:         linkData["src-port"],
                              site:         linkData["src_site_name"],
                              siteID:       linkData["src_site_id"],
                              type:         linkData["src-type"],
                              hasFlIp:      linkData.srcEpIpData.assignFloatingIP,
                              statIP:       linkData.srcEpIpData.staticIP,
                              centOfcId:    linkData.srcCentOfcId || "",
                              centOfcName:  linkData.srcCentOfcName || "",
                              bwFromStr:    linkData.srcBwFromStr,
                              bwToStr:      linkData.srcBwToStr,                               
                };

                // build our schema
                if (typeof (intrCnctns.InterConnection) === "undefined")
                    intrCnctns.InterConnection = [];
                
                // insert both endpoints
                var endPointSrc = {};
                endPointSrc = getEndpoint(srcObj);
                
                var endPointDst = {};
                endPointDst = getEndpoint(dstObj);
                
                // Subnet and CIDR info
                var nwCIDR = linkData.nwIntCIDR;
                
                // no CIDR, just dump the endpoints
                if ((nwCIDR == undefined || nwCIDR == "") && (!linkData.nwHasExtGW)) {
                    intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst]});
                }
                else {
                    var gw = "";
                    
                    if (linkData.nwHasExtGW !== undefined) gw = linkData.nwHasExtGW + "";
                    
                    var subnet = {"@networkCIDR": nwCIDR,"@externalGatewayStaticIP" : linkData.nwExtGW, "@externalGateway": gw};
                    intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst], Subnet: [subnet]});


                    // If Ranges, include
                    if (linkData.nwDhcpRanges && linkData.nwDhcpRanges.length > 0) {
                        for (var l=0; l<linkData.nwDhcpRanges.length; l++) {
                            intrCnctns.InterConnection[i].Subnet[0]['DHCPRange'] = {'@begin': linkData.nwDhcpRanges[l].begin, '@end': linkData.nwDhcpRanges[l].end};
                        }
                    }
                }
            });
            
            xmlSOCs[i].InterConnections = xmlIntrCntcs.InterConnections;
            
            so['ServiceOrderDesc']['ServiceOrderCarrier'].push(xmlSOCs[i]);
        }

        osa.ajax.update('serviceOrdersV2', '<?xml version="1.0" encoding="UTF-8"?>' + json2xml(so), function(r) {
            osa.ui.modalBox.warn($.i18n._("srvc.ttl.done"), $.i18n._("srvc.msg.create.submitted"));
            location.href = "#services-list";
        });

        return false ;
    });
    
    // ----------------------------------------------------------
    // EVENTS
    // ----------------------------------------------------------

    osa.page.addPageEvent('.so-port-list', 'change', function() {
        $("#" + $(this).val()).addClass('used');
    });

    osa.page.addPageEvent('.so-link-remove-btn', 'click', function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("srvc.prmpt.dltLnk"))) {
            removeLinkBlock($(this).parents('.so-link-block'));
        }
    });
    
    // EDIT LINK
    osa.page.addPageEvent('.so-link-edit-btn', 'click', function(ev) {
        ev.preventDefault();
        setUpEditLink(this, "edit_service_add_link");
    }); 

})(osa.page.getPageURLParameters()['key']);





function getCOsAndFreeEditLinks(tenantId) {
    // Since we know the tenant, get the central offices for him
    osa.ajax.list('centralOffices', [tenantId], function(coList) {
        coList.sort(function(a, b) {
            if (a.displayName > b.displayName)          return 1;
            else if (a.displayName == b.displayName)    return 0;
            else                                        return -1;
        });
        
        $("#service_links_container").data("COs", coList);
        
        $("#fs2").show("slow");
    });
};




//};