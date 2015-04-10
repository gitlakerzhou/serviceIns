//@ sourceURL=http://localhost:8080/ajax/services-create-site.js
//var run_servicesCreateCust = function() {    

(function () {
    // --------------------------------------------------------------------
    // FORM
    // --------------------------------------------------------------------
    services_create_site_render_form();
    services_create_get_data();
    
    var $linkBlock = $("#link-list-block"),
        $linkListContainer = $("#service_links_container"),
        $addLinkBtn2 = $("#create_service_add_link"),
        $addVNFBtn2 = $("#create_service_add_vnf"),
        _vnfList = [],
        _siteList = [];
    
    $addLinkBtn2.removeAttr("disabled").removeClass("disabled");

    $linkListContainer.data("sitesUsed", {});
    
    // TARGET CLOUD DISPLAY NAME    
    // Create and Edit are unique
    var getOptimizations = function(fields) {
        var opts = [];
        var cloudName = "";

        opts.push({"@cloudName" : cloudName, "@computeNodeGuid" : fields["vnf_target_cmpt_node"]});
        return opts;
    };

    // Get All of the available VNF images and store them for the popup so
    // the popup doesn't have to get the list every time.
    osa.ajax.list("centralOfficeActiveVirtualNetworkFunctionTypes", function(vnfList) {
        var form = $("#service-create-form");
        var vnfByName = {};
        
        for (var i = 0; i < vnfList.length; i++) {
            _vnfList.push(vnfList[i]);
            vnfByName[vnfList[i].displayName] = vnfList[i];
        }

//        alert("1");
        osa.ajax.list("centralOfficeCompositeVNFTypes", function(cvnfList) {
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
    

    // Build the list of sites from the the ajax call
    osa.ajax.list("sites", function(siteList) {
        _siteList = siteList;
    });


    // --------------------------------------------------------------------
    // FORM - ADD LINK
    // --------------------------------------------------------------------
    // Adding a link to the Service Order will clone the block that currently exists and
    // renumbers the elements to keep them in order.
    $addLinkBtn2.on("click", function(ev) {
        ev.preventDefault();
        var __virtDevs = {}, __sites = {};
        var p = osa.ui.formPopup.create($.i18n._("srvc.crtLink"), null, {submitLabel: $.i18n._("srvc.crtLink")});
        var idx = $linkBlock.find(".so-link-block").size();

        // Reconfigure the data for VNFs
        for (var i = 0; i < _vnfInstances.length; i++) {
            __virtDevs[_vnfInstances[i]["vnf-instance-name"]] = _vnfInstances[i];
        }

        // Reconfigure the data for Sites
        for (var i = 0; i < _siteList.length; i++) {
            __sites[_siteList[i].key] = _siteList[i];
        }
        
        // ------------------------------------------------------------
        //    ADD LINK FORM
        // ------------------------------------------------------------  
        var linkBox = $("#service_links_container");
        var tenantId = $("#service-create-form-tenant option:selected").val();
        services_create_link_render_form();
        services_create_link_populate_data(tenantId, false, linkBox);
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


        if (_vnfInstances) {
            var $ogvnfs = $("<optgroup></optgroup>", {label: "VNFs"});
            for (var i = 0; i < _vnfInstances.length; i++) {
                $ogvnfs.append($("<option></option>", {value: _vnfInstances[i]["vnf-instance-name"], html:_vnfInstances[i]["vnf-instance-name"]}));
            }
            p.getField("src-dev").append($ogvnfs.clone());
            p.getField("dst-dev").append($ogvnfs.clone());
        }

        if (_siteList) {
            var $ogdevs = $("<optgroup></optgroup>", {label: "Sites"});
            for (var i = 0; i < _siteList.length; i++) {
                $ogdevs.append($("<option></option>", {value: _siteList[i].key, html:_siteList[i].displayName}));
            }
            p.getField("src-dev").append($ogdevs.clone());
            p.getField("dst-dev").append($ogdevs.clone());
        }

        p.setRequiredFields(["src-dev", "dst-dev"]);
        p.hideField("src-port");
        p.hideField("dst-port");
        p.show();
    });

    // --------------------------------------------------------------------
    // FORM - ADD VNF
    // --------------------------------------------------------------------
    $addVNFBtn2.on('click', function(ev) {
        ev.preventDefault();
        // Take the VNFList that we got at the beginning and make a select list out of it
        var vnfSelect = _vnfList.map(function(el) {
            return {key:el.key, value:el.displayName};
        });

        var _currentVNFProps = [];

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
            for (var i = 0; i < _currentVNFProps.length; i++) {
                p.removeField(_currentVNFProps[i]);
            }

            // reset the array.
            _currentVNFProps.length = 0;

            for (var i = 0; i < __propList.length; i++) {
                var prop = __propList[i];
                // ONLY show exposed
                if (__propList[i].exposed) {
                    _currentVNFProps.push('property-' + prop.key);
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
    $("#service-create-form").submit(function(ev) {
        ev.preventDefault();
        
        if ($(this).valid()) {
            var so = {}, cos = {};

            // -----------------------------------------------------------------
            // BUILD XML
            // -----------------------------------------------------------------
            var selTenant = $("#service-create-form-tenant option:selected");
            // changed name to serviceName, removed sites, aded tenantName and tenantKey
            // moved the VNF and Interconneciton containers out and put in the ServiceOrderSite in their place.
            so['ServiceOrderDesc'] = {
                '@serviceName': $("#service-create-form-name").val(),
                '@tenantName': selTenant.html(),
                '@tenantKey': selTenant.val(),         
                '@xsi:schemaLocation': __ROOTURL + "/xml/ServiceOrderRequestVersion2_1.xsd",
                '@xmlns': "http://www.overturenetworks.com/ServiceOrderRequestVersion2_1",
                '@xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                'ServiceOrderSite':[]
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
                        var curObj = cos[i].VNF[j];
                        
                        curObj.soid = generateID();
                        
                        // removed id
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
                                  site:         linkData["dst-site"],
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
                                  site:         linkData["src-site"],
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
                    
                    if (nwCIDR == "" && !(linkData.nwHasExtGW)) {
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst]});
                    }
                    else {
                        
                        var subnet = {"@networkCIDR": nwCIDR,"@externalGatewayStaticIP" : linkData.nwExtGW, "@externalGateway": linkData.nwHasExtGW + ""};
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst], Subnet: [subnet]});


                        // If Ranges, include
                        if (linkData.nwDhcpRanges.length > 0) {
                            for (var l=0; l<linkData.nwDhcpRanges.length; l++) {
                                intrCnctns.InterConnection[i].Subnet[0]['DHCPRange'] = {'@begin': linkData.nwDhcpRanges[l].begin, '@end': linkData.nwDhcpRanges[l].end};
                            }
                        }
                    }

                });
                
                xmlSOCs[i].InterConnections = xmlIntrCntcs.InterConnections;
                
                so['ServiceOrderDesc']['ServiceOrderSite'].push(xmlSOCs[i]);
            }

            // CCR - submit of entire form is here.
            osa.ajax.add('serviceOrdersV2', '<?xml version="1.0" encoding="UTF-8"?>' + json2xml(so), function(r) {
                osa.ui.modalBox.warn($.i18n._("srvc.ttl.done"), $.i18n._("srvc.msg.success"));
                location.href = "#services-list";
            });

           // return false below
        }       
        

    }); // END POST


    
    // --------------- Page events ---------------------------------
    // On Device Selection in creating links, update the respective
    // Port dropdown with the ports of the device.
    osa.page.addPageEvent('.so-device-list', 'change', function(ev) {
        ev.preventDefault();
        $respectivePortDD = $("#" + this.id.replace('-dev', '-port')).empty();
        $("<option></option>").appendTo($respectivePortDD);
        $("#so-device--" + $(this).val()).find('.rendered-vnf-port').each(function(idx) {
            $("<option></option>").html(idx).attr('value', this.id).appendTo($respectivePortDD);
        });
    });

    osa.page.addPageEvent('.so-port-list', 'change', function() {
        $("#" + $(this).val()).addClass('used');
    });

    osa.page.addPageEvent('.so-link-remove-btn', 'click', function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("srvc.msg.warn.rmv.link"))) {
            removeLinkBlock($(this).parents('.so-link-block'));
        }
    });

    


})();

// -----------------------------------------------------------------
// RENDER FORM
// -----------------------------------------------------------------

function services_create_site_render_form () {
    var form = $("#service-create-form");
    var divLeft = $("#service-create-left");

    divLeft.addTextInput("service-create-form-name", "srvc.name", true);
    divLeft.addSelect("service-create-form-tenant", "srvc.tenant", false, true);
    $("#row_service-create-form-tenant").addClass("hide");
    $("#service-create-form-name").attr("autocomplete", "off");
    
    var selTenant = $("#service-create-form-tenant");
    osa.ajax.list('tenants', function(elTenant) {
        for (var i=0; i<elTenant.length; i++) {
            selTenant.append("<option value='" + elTenant[i].key + "'>"  + elTenant[i].tenantName + "</option>");
        }
        // Used for building links, but timely to call when the tenant id is certain.
        holdSitesOfTenant(selTenant.val(), "service_links_container");    
        $("#service-create-form").data("tenantId", $("#selTenant").val());
    });
    
    service_vdevs_render(divLeft, "create");
    service_links_render(divLeft, "create");
    service_btns_render(divLeft, "create", "save");
    
    // VALIDATION
    form.validate({
        rules : {
            "service-create-form-name" : {
                required : true,
                nameNotUsed: "#service-create-form",
            }
        },
        messages: {
            "service-create-form-name" : {
                required: $.i18n._("srvc.vld.uniq.name"),    
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
function services_create_get_data() {
    holdServiceOrderNames();
    holdTenantMap($("#service-create-form-tenant"));
    $("#service_links_container").data("areIPsEditable", true);
    $("#service_links_container").data("mainForm", "service-create-form");
    holdVnfList($("#vnf-instance-list"));
}
//};