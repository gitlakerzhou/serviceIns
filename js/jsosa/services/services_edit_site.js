//@ sourceURL=http://localhost:8080/ajax/services-edit.js
//var run_servicesEditSite = function() {
    

// -----------------------------------------------------------------
// DATA
//
// FORM:     Object { COs={...}, vnfByName={...}}
//
//            vnfByName    Object { SWITCH={...}, DEEP_PACKET_INSPECTION={...}...}
//
//            COs:
//            key            1
//            displayName    "Ashland"
//    
// VNF:     Object { VNFInstanceObjs[], vnf-co="1", vnf-instance-name="sw_1", vnf-instance="1", more...}
// 
//            isConnectExtRtr                boolean
//            extGW                        "ip"
//            rangeSet                    array[]
//            subnetCIDR                    "ip"
//            subnetCIDRext                "int"
//             isSwitch                    boolean
//            vnf-instance                "int"
//            vnf-instance-name            "string"
//            vnf_target_cloud            "int"
//            vnf_target_cmpt_node    "int"
//            vnf-optimization            "string"
//            vnf-portNames                array[]
//            vnfType                    "SWITCH" for example
//
//            Example: $("#so-device--cori_sw_1").data()
//
//    LINKS:     Object { sitesUsed={...}, areIPsEditable, mainForm}
//
//            sitesUsed Example:
//             1    "Site_1"
//            2    "Site_2"
//
//            areIPsEditable    boolean
//            mainForm        "service-edit-form"
//            
//             Example: $("#service_links_container").data()
// -----------------------------------------------------------------


// -----------------------------------------------------------------
// RENDER FORM
// -----------------------------------------------------------------
function services_edit_render_form () {
    var divLeft = $("#service-edit-left");

    divLeft.addTextNoInput("service-edit-form-name", "srvc.name");
    divLeft.addTextNoInput("service-edit-form-tenant", "srvc.tenant");
    
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

    // FORM
    services_edit_render_form();
    services_edit_get_data();
    
    var $linkListContainer = $("#service_links_container"),
        _vnfList = [],
        _sites =[];
        vnfMetadataForLink =[];
        
        
    $linkListContainer.data("sitesUsed", {});
    
    // TARGET CLOUD DISPLAY NAME - different than create
    var getOptimizations = function(fields) {
        var opts = [];
        var cloudName = "";

        opts.push({'@cloudName' : cloudName || "", '@computeNodeGuid' : fields['vnf-optimization'].computeNode});
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
            
            // Used for building links, but timely to call when the tenant id is certain.
            holdSitesOfTenant(soData.tenantKey, "service_links_container");

            $("#service-edit-form-name").html(soData.serviceOrderName);
            tenantInpt.html(soData.tenantName);
            tenantInpt.data("tenantKey", soData.tenantKey);
            
            $("#service-edit-form").data("tenantId", soData.tenantKey);
            
            if (soData.tenantName == "") {
                $.get( "/osa/api/tenants/get/", function( data ) {
                    tenantInpt.html(data.tenantName);
                    tenantInpt.data("tenantKey", data.key);
                });
            }


            // VIRTUAL DEVICES
            // Process the VNFs and add the instances to the list.
            for (var i = 0; i < soData.vnfsCollection.length; i++) {
                var currVnf = soData.vnfsCollection[i];
                var vnfDisplayName = currVnf.displayName;
                var customOpt = currVnf.optimizations;
             
                var portList = currVnf.portCollection.map(function(e) {
                    return e.displayName;
                });

                var metadata = {
                    "vnf-instance": getVNFTypeByName(currVnf.vnfTypeKey).key,
                    "vnf_target_cloud":"", 
                    "vnf-optimization": customOpt,
                    "vnf-instance-name": currVnf.displayName,
                    "vnfType" : soData.vnfsCollection[i].vnfTypeKey,
                    "isSwitch" : $("#vnf-instance-list").data("switchMap")[soData.vnfsCollection[i].vnfTypeKey],
                    "scaleAlarmProfileDTO" : soData.vnfsCollection[i].scaleAlarmProfileDTO,
                };
                
              
                vnfMetadataForLink.push({"key": currVnf.key, 
                    "vnf-instance": getVNFTypeByName(currVnf.vnfTypeKey).key,
                    "vnf_target_cloud": "",
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
                  var phyDevSize = _sites.length; 
                  for( var i= 0; i <phyDevSize; i++) {
                      if(_sites[i].key == key) {
                          var pc = _sites[i].portCollection;
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
                  _sites.push({'displayName': dname, 'key': key, 'portCollection': portSCollection});
           };
            
           
            var getPDeviceData = function(key) {
                for (var i = 0; i < _sites.length; i++) {
                    if (_sites[i].key == key) {
                         return {'key': _sites[i].key, 
                                   'displayName': _sites[i].displayName,
                                   'portCollection': _sites[i].portCollection}; 
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
                var dstIsSwitch = false;
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
                
//                SOURCE
                var srcDevType = "site";
                
                // PHYSICAL DEVICE
                if (src.phyDeviceName !== undefined) {
                    srcDevType = "physical";
                    srcName = src.phyDeviceName;
                    srcDevId = src.phyDeviceKey;
                    getDeviceData(srcDevId, srcName, src.portKey, src.portName);
                    srcMetaData = getPDeviceData(src.phyDeviceKey);
                    srcMetaData['centralOfficeKey'] = src.centralOfficeKey || "";
                    srcMetaData['centralOfficeName'] = src.centralOfficeName || "";  
                }
                else if (src.vnfname !== undefined) {
                    srcDevType = "virtual";
                    srcName = src.vnfname;
                    srcDevId = src.vnfname;
                    srcMetaData = getMetaData(src.vnfid);                    
                    var asgndIP = src.ipaddressInfoCollection[0].assignedIP;
                    if (asgndIP !== null && asgndIP !== "") srcStatIpStr = " (" + src.ipaddressInfoCollection[0].assignedIP + ")";
                    if (src.ipaddressInfoCollection[0].assignFloatingIP) srcSubnetStr = $.i18n._("srvc.has.float.ip");      
                    srcIsSwitch = $("#vnf-instance-list").data("switchMap")[srcMetaData.vnfType];
                }
                else { // "site"
                    srcName = src.siteName;
                    srcDevId = src.siteKey;
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
                    dstMetaData['centralOfficeKey'] = dst.centralOfficeKey || "";
                    dstMetaData['centralOfficeName'] = dst.centralOfficeName || "";                      
                }
                else if (dst.vnfname !== undefined) {
                    dstDevType = "virtual";
                    dstName = dst.vnfname;
                    dstDevId = dst.vnfname;
                    dstMetaData = getMetaData(dst.vnfid);
                    var asgndIP = dst.ipaddressInfoCollection[0].assignedIP;
                    if (asgndIP !== null && asgndIP !== "") dstStatIpStr = " (" + dst.ipaddressInfoCollection[0].assignedIP + ")";
                    if (dst.ipaddressInfoCollection[0].assignFloatingIP) dstSubnetStr = $.i18n._("srvc.has.float.ip");
                    dstIsSwitch = $("#vnf-instance-list").data("switchMap")[dstMetaData.vnfType];
                }
                else { // "site"
                    dstName = dst.siteName;
                    dstDevId = dst.siteKey;
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
                
                

                $l = $("#so-link-block").clone().removeAttr('id');
                $l.find(".so-link-src-dev") .html(srcName);
                $l.find(".so-link-src-port").html(src.portName);
                $l.find(".so-link-dst-dev") .html(dstName);
                $l.find(".so-link-dst-port").html(dst.portName);
                $l.find(".soSubnetInfo").html(subnetStr);
                
                
                $l.find(".leftSubBlock .soStaticIp").html(srcStatIpStr);
                $l.find(".leftSubBlock .soFloatingDetails").html(srcSubnetStr);
                $l.find(".rightSubBlock .soStaticIp").html(dstStatIpStr);
                $l.find(".rightSubBlock .soFloatingDetails").html(dstSubnetStr);    
                
                $l.find(".so-link-remove-btn").attr("title", $.i18n._("srvc.dltLink"));
                
                
                $l.data({
                    'src-dev':  srcDevId,
                    'src-port': src.portName,
                    'src-name': srcName,
                    'src-type': srcDevType,
                    'src-metadata':srcMetaData,
                    'src_site_name'    : src.siteName,
                    'src_site_id' : src.siteKey,
                    'dst-dev': dstDevId,
                    'dst-port': dst.portName,
                    'dst-name': dstName,
                    'dst-metadata':dstMetaData,
                    'dst-type': dstDevType,  
                    'dst_site_name'    : dst.siteName,
                    'dst_site_id' : dst.siteKey,    
                    'nwIntCIDR' : subnetCidrForVNF,
                    'nwHasExtGW': hasExtGW,
                    'nwExtGW'    : extGwForVNF,
                    'nwDhcpRanges' : rangeSetForVNF,                    
                }).appendTo($linkListContainer);
            }

            $("#edit_service_add_link").parent().removeClass("hide");
            $("#edit_service_add_vnf").parent().removeClass("hide");
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
            
            form.data("vnfByName", vnfByName);
            
            processServiceOrderDesc(__soKey);

            
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
    });

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
    
    // -------------------------------------------------
    // ADD A VNF
    // -------------------------------------------------    
    $("#edit_service_devices_hdr .rightBtn").on('click', function(ev) {
        ev.preventDefault();
        // Take the VNFList that we got at the beginning and make a select list out of it
        var vnfSelect = _vnfList.map(function(el) {
            return {key:el.key, value:el.displayName};
        });


        var p = osa.ui.formPopup.create($.i18n._("srvc.ttl.crt.vnf"), null, {submitLabel: $.i18n._("srvc.btn.sbmt.vnf")});
        
        p.addField('vnf-instance-name', $.i18n._("srvc.name"), 'text');
        p.addField('vnf-instance', $.i18n._("srvc.type"), 'select', vnfSelect, function() {
            var v = $(this).val();
            var __optList = [], __propList = [];
            var $opts = p.getField('vnf-optimization').empty();
            p.hideField('vnf-optimization');
            p.removeRequiredField('vnf-optimization');

            // Build the port list
            for (var i = 0; i < _vnfList.length; i++) {
                if (_vnfList[i].key == v) {
                    __optList = _vnfList[i].availableCustomOptimizations;
                    __propList = _vnfList[i].vnfTypeProperties;
                    break;
                }
            }

            // Only show the custom optimizations if there are any to show.
            if (__optList.length > 0) {
                p.showField('vnf-optimization');
                p.addRequiredField('vnf-optimization');
                $opts.append($("<option></option>", {value:null, html:""}));

                // Build the optimization list
                for (var j = 0; j < __optList.length; j++) {
                    $opts.append($("<option></option>", {
                        value: __optList[j],
                        html: __optList[j]
                    }));
                }
            }

            // Remove any existing VNF properties that are being displayed.
            for (var i = 0; i < __propList.length; i++) {
                if (__propList[i].exposed) {
                    var prop = __propList[i];
                    p.addField('property-' + prop.key, prop.propertyDescription, 'string', prop.propertyValue);
                    if (prop.mandatory) {
                        p.addRequiredField('property-' + prop.key);
                    }
                }
            }

        });

        p.addField('vnf-optimization', $.i18n._("srvc.opt.flvr"), 'select', []);

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
        p.show();
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
                'ServiceOrderSite': []
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
                        '@customOptimization': curObj['vnf-optimization'].customOptimization || curObj['vnf-optimization'] || '',
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
                
                if (nwCIDR == undefined || nwCIDR == "") {
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
            
            so['ServiceOrderDesc']['ServiceOrderSite'].push(xmlSOCs[i]);
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
        alert("used");
        $("#" + $(this).val()).addClass('used');
    });

    osa.page.addPageEvent('.so-link-remove-btn', 'click', function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("srvc.prmpt.dltLnk"))) {
            removeLinkBlock($(this).parents('.so-link-block'));
        }
    });
    
    osa.page.addPageEvent('.so-link-edit-btn', 'click', function(ev) {
        ev.preventDefault();
        setUpEditLink(this, "edit_service_add_link");
    });


})(osa.page.getPageURLParameters()['key']);

//};