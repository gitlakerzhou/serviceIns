//@ sourceURL=http://localhost:8080/ajax/services_create.js
//var run_servicesCreate = function() {    


// -----------------------------------------------------------------
// DATA
//
// FORM:      cloudList       { key=1, displayName="cloud_Westford", centralOfficeKey=1, more...}, Object { key=2, displayName="dev01", centralOfficeKey=3, more...}
//            cloudListByKey  { 1={...}, 2={...}}
//            cloudMapById    { 1="Westford", 2="Boston", 3="Ashland", more...}
//            existingNames   { cori 1="Chy", cori fd 1="FD", cori floating IP="Chy", more...}
//            vnfByName       { SWITCH={...}, DEEP_PACKET_INSPECTION={...}, TWO_PORT_FIREWALL={...}, more...}
//
//            COs:
//            key            1
//            displayName    "Ashland"
//    
// VNF:     Object { VNFInstanceObjs[], vnf-co="1", vnf-instance-name="sw_1", vnf-instance="1", more...}
// 
//            isConnectExtRtr             boolean
//            extGW                       "ip"
//            rangeSet                    array[]
//            subnetCIDR                  "ip"
//            isSwitch                    boolean
//            tgtComputeNode              "string"
//            vnf-co                      "int"
//            vnf-instance                "int"
//            vnf-instance-name           "string"
//            vnf_target_cloud            "int"
//            vnf_target_cmpt_node        "int"
//            vnf-optimization            "string"
//            vnf-portNames               array[]
//            vnfType                     "SWITCH" for example
//
//            Example: $("#so-device--cori_sw_1").data()
//
//    LINKS:  Object { COS, areIPsEditable=bool, sitesUsed={...}, switchIPs={...}}
//
//            sitesUsed Example:
//            1    "Site_1"
//            2    "Site_2"
//
//            SwitchIPs Example
//            ["switch1"]
//            subnetCIDR    "1.1.1.0/24"
//            rangeSet    [{min:1.1.1.1, max:1.1.1.20},{},...]
//            extGW        "1.1.1.50"
//
//             Example: $("#service_links_container").data()
// -----------------------------------------------------------------


// -----------------------------------------------------------------
// RENDER FORM
// -----------------------------------------------------------------
function services_create_render_form () {
    var form = $("#service-create-form");
    var divLeft = $("#service-create-left");

    divLeft.addTextInput("service-create-form-name", "srvc.name", true);
    divLeft.addSelect("service-create-form-tenant", "srvc.tenant", true, true);
    
    $("#service-create-form-name").attr("autocomplete", "off");
    
    var selTenant = $("#service-create-form-tenant");
    
    selTenant.change(function() {
        var btn = $("#create_service_add_link");
        var tenantId = $(this).val();
        var linksBox = $("#service_links_container");
        
        if (tenantId !== "") {
            btn.removeClass("disabled").removeAttr("disabled");
            
            // Since we know the tenant, get the central offices for him
            osa.ajax.list('centralOffices', [tenantId], function(coList) {
                coList.sort(function(a, b) {
                    if (a.displayName > b.displayName)          return 1;
                    else if (a.displayName == b.displayName)    return 0;
                    else                                        return -1;
                });
                
                linksBox.data("COs", coList);

                holdSitesOfTenant(tenantId, "service_links_container");
            });
             

        } else {
            btn.addClass("disabled").attr("disabled", "disabled");
            linksBox.removeData("SiteInstanceObjs");
            linksBox.removeData("COs");
        }
        
        form.valid();
        $("#service-create-form").data("tenantId", tenantId);
    });
    
    
    var tenantToTypeStrMap = {};
    osa.ajax.list('tenants', function(elTenant) {
        for (var i=0; i<elTenant.length; i++) {
            selTenant.append("<option value='" + elTenant[i].key + "'>"  + elTenant[i].tenantName + "</option>");
            tenantToTypeStrMap[elTenant[i].key] = elTenant[i].tenantType;
        }
        selTenant.data("tenantToTypeStrMap", tenantToTypeStrMap);
    });
    
    
    service_vdevs_render(divLeft, "create");
    service_links_render(divLeft, "create");
    service_btns_render(divLeft, "create", "save");
    
    // VALIDATION
    form.validate({
        rules : {
            'service-create-form-name' : {
                required : true,
                nameNotUsed: "#service-create-form",
            },
            "service-create-form-tenant" : {
                required: true,
            }
        },
        messages: {
            'service-create-form-name' : {
                required: $.i18n._("srvc.vld.name.req"),    
            },
            "service-create-form-tenant" : {
                required: $.i18n._("srvc.vld.tnt.req"),
            }
        },
        errorPlacement : function(error, element) {
            error.appendTo(element.parent());
        }
    }); 
    
    $("#create_service_create_btn").val($.i18n._("srvc.btn.orchestrate"));
    $("#create_service_add_link").parent().removeClass("hide");
    $("#create_service_add_vnf").parent().removeClass("hide");
}

//-----------------------------------------------------------------
// GET DATA
//-----------------------------------------------------------------
function services_create_get_data () {
    holdServiceOrderNames();
    holdTenantMap($("#service-create-form-tenant"));
    $("#service_links_container").data("areIPsEditable", true);
    $("#service_links_container").data("mainForm", "service-create-form");
    holdVnfList($("#vnf-instance-list"));
}


// ------------------------------------------------
// ON LOAD
// ------------------------------------------------
    
(function () {
    // FORM
    services_create_render_form();
    services_create_get_data();
    
    $("#buttonRerender").html($.i18n._("srvc.dia.repaint"));
    $("#buttonRerender").click(function(ev) {
        if (!($(this).hasClass("disabled"))) {
            $(this).addClass("disabled");
            $("#diagramField").data("locations", {});
            generateMap();
        }
    });
    
    
    var $linkListContainer = $("#service_links_container"),
        $addLinkBtn2 = $("#create_service_add_link"),
        $addVNFBtn2 = $("#create_service_add_vnf"),
        _vnfList = [];
    
    
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
        
        
        opts.push({'@cloudName' : cloudName, '@cloudID' : cloudID, '@cloudLocationName' : cloudLocationName, '@cloudLocationID' : cloudLocationID, 
                   "@availabilityZone" : aZone, "@availabilityZoneID" : aZoneID, "@hostAggregate" : aggregate, "@hostAggregateID" : aggregateID,
                   '@computeNodeGuid' : computeNode, '@computeNodeGuidID' : computeNodeID });
        return opts;
    };




    // Get All of the available VNF images and store them for the popup so
    // the popup doesn't have to get the list every time.
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        var form = $("#service-create-form");
        var vnfByName = {};
        
        for (var i = 0; i < vnfList.length; i++) {
            _vnfList.push(vnfList[i]);
            vnfByName[vnfList[i].displayName] = vnfList[i];
        }

//        alert("2");
        osa.ajax.list('centralOfficeCompositeVNFTypes', function(cvnfList) {
            for (var j = 0; j < cvnfList.length; j++) {
                cvnfList[j].availableCustomOptimizations = [];
                _vnfList.push(cvnfList[j]);
                vnfByName[cvnfList[j].displayName] = cvnfList[j];
            }
            
            form.data("vnfByName", vnfByName);
            
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
    
    

    // Pull the list of clouds
    getCloudDataForCreate($("#service-create-form"));

    // ------------------------------------------------------------
    //
    //    ADD LINK BUTTON
    //
    // ------------------------------------------------------------
    // Adding a link to the Service Order will clone the block that currently exists and
    // renumbers the elements to keep them in order.
    $addLinkBtn2.on('click', function(ev) {
        ev.preventDefault();
        if ($(this).hasClass("disabled")) { // do not let the user click until the tenant is selected
            return false;
        }

        var tenantId = $("#service-create-form-tenant").val();
        var isForCustomer = $("#service-create-form-tenant").data("tenantToTypeStrMap")[$("#service-create-form-tenant :selected").html()] == "CUSTOMER";
        var p = osa.ui.formPopup.create($.i18n._("srvc.crtLink"), null, {submitLabel: $.i18n._("srvc.crtLink")});
        var hasPhysDev = osa.auth.getPageAccess('physicalDevices').read;
        p.$CONTAINER.appendTo('body').hide();

        
        // ------------------------------------------------------------
        //    ADD LINK FORM
        // ------------------------------------------------------------        
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
    // NOTE: When a new VNF is created, we put a flag on that VNF so the edit can distinguish between the 
    // one that is new and very editable and the one that is already running (edit) and not so editable.
    // This flag is called "justCreated" and is set to true.  If "justCreated" does not exist, then it 
    // is from an existing service order.
    $addVNFBtn2.on('click', function(ev) {
        ev.preventDefault();
        var form = $("#service-create-form");
        
        // ------------------------------------------------------------
        // ADD VNF FORM
        // ------------------------------------------------------------
        p = services_create_vnf_render_form(form);
        services_create_vnf_populate_data("service-create-form");
        services_create_vnf_events("service-create-form");

        // ------------------------------------------------------
        // SUBMIT VNF
        // ------------------------------------------------------
        p.setSubmitAction(function(fields) {
            
            if (p.$FORM.valid()) {
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
            }


        });

        p.setRequiredFields(['vnf-instance-name', 'vnf-instance', "vnf_target_cloud"]);
        p.hideField('vnf-optimization');
        p.reveal();
    });

    // --------------------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------------------
    $("#service-create-form").submit(function(ev) {
        ev.preventDefault();
        
        
        if ($(this).valid()) {
            
            var so = {}, cos = {};

            // -----------------------------------------------------------------
            // BUILD XML
            // -----------------------------------------------------------------
            var selTenant = $("#service-create-form-tenant option:selected");
            // removed ID and CentralOffices
            // name became ServiceName
            // added tenantName and tenantKey
            so['ServiceOrderDesc'] = {
                '@serviceName': $("#service-create-form-name").val(),
                '@tenantName': selTenant.html(),
                '@tenantKey': selTenant.val(),
                '@xsi:schemaLocation': __ROOTURL + "/xml/ServiceOrderRequestVersion2_1.xsd",
                '@xmlns': "http://www.overturenetworks.com/ServiceOrderRequestVersion2_1",
                '@xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                'ServiceOrderCarrier':[]
            };

            // Build the list of devices and interconnections based on the links blob
            $linkListContainer.find(".so-link-block").each(function(i, el) {
                var linkData = $(el).data();
                var co = linkData["co"];

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
                            "@name": curObj["vnf-instance-name"],
                            "@type": getVNFType(curObj["vnf-instance"], _vnfList),
                            "Ports": getPorts(curObj.portCollection),
                            "@customOptimization": curObj["vnf-optimization"].customOptimization || "",
                            "Optimizations": getOptimizations(curObj),
                            "InstanceProperties": getProperties(curObj),
                            "ScaleAlarmProfile" : getScaleAlarmProfiles(curObj),
                        });
                    }
                }

                // --------------------------------------------------------------------------
                // INTERCONNECTIONS
                // Build the Interconnection information (Removed old way and replaced with this.)
                // --------------------------------------------------------------------------
                var xmlIntrCntcs = {};            // This is the object we will build and place in the XML
                xmlIntrCntcs["InterConnections"] = {};
                var intrCnctns = xmlIntrCntcs.InterConnections;
                
                $linkListContainer.find(".so-link-block").each(function(i, el) {
                    var linkData = $(el).data();
                    
                    var dstObj = {id:           linkData["dst-dev"],
                                  metadata:     linkData["dst-metadata"],
                                  name:         linkData["dst-name"],
                                  port:         linkData["dst-port"],
                                  site:         linkData["dst-site"],
                                  siteID:       linkData["dst_site_id"],
                                  type:         linkData["dst-type"],
                                  hasFlIp:      linkData.dstEpIpData.assignFloatingIP,
                                  statIP:       linkData.dstEpIpData.staticIP,
                                  centOfcId:    linkData.dstCentOfcId,
                                  centOfcName:  linkData.dstCentOfcName,
                                  bwFromStr:    linkData.dstBwFromStr,
                                  bwToStr:      linkData.dstBwToStr,                                  
                    };
                    var srcObj = {id:           linkData["src-dev"],
                                  metadata:     linkData["src-metadata"],
                                  name:         linkData["src-name"],
                                  port:         linkData["src-port"],
                                  site:         linkData["src-site"],
                                  siteID:       linkData["src_site_id"],
                                  type:         linkData["src-type"],
                                  hasFlIp:      linkData.srcEpIpData.assignFloatingIP,
                                  statIP:       linkData.srcEpIpData.staticIP,
                                  centOfcId:    linkData.srcCentOfcId,
                                  centOfcName:  linkData.srcCentOfcName,     
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
                    
                    if (nwCIDR == "" && !(linkData.nwHasExtGW)) {
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst]});
                    }
                    else {
                        
                        var subnet = {"@networkCIDR": nwCIDR,"@externalGatewayStaticIP" : linkData.nwExtGW, "@externalGateway": linkData.nwHasExtGW + ""};
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst], Subnet: [subnet]});


                        // If Ranges, include
                        if (linkData.nwDhcpRanges.length > 0) {
                            for (var l=0; l<linkData.nwDhcpRanges.length; l++) {
                                intrCnctns.InterConnection[i].Subnet[0]["DHCPRange"] = {"@begin": linkData.nwDhcpRanges[l].begin, "@end": linkData.nwDhcpRanges[l].end};
                            }
                        }
                    }

                });
                
                xmlSOCs[i].InterConnections = xmlIntrCntcs.InterConnections;

                so["ServiceOrderDesc"]["ServiceOrderCarrier"].push(xmlSOCs[i]);
            }

            // CCR - submit of entire form is here.
            osa.ajax.add('serviceOrdersV2', '<?xml version="1.0" encoding="UTF-8"?>' + json2xml(so), function(r) {
                osa.ui.modalBox.warn($.i18n._("srvc.ttl.done"), $.i18n._("srvc.msg.success"));
                location.href = "#services-list";
            });

           // return false below
        }
        
        return false;
    });

    


    // -----------------------------------------------------------
    // EVENTS
    // -----------------------------------------------------------
    osa.page.addPageEvent('.so-link-edit-btn', 'click', function(ev) {
        ev.preventDefault();
        setUpEditLink(this, "create_service_add_link");
    });
    
    osa.page.addPageEvent('.so-port-list', 'change', function() {
        $("#" + $(this).val()).addClass('used');
    });

    osa.page.addPageEvent('.so-link-remove-btn', 'click', function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("srvc.prmpt.dltLnk"))) {
            removeLinkBlock($(this).parents('.so-link-block'));
        }
    });
})();

//};