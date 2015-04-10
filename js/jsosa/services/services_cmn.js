var usedIds = [], generateID = function() {
    while ($.inArray((i = ~~(Math.random() * 100000)), usedIds) > 0);
    usedIds.push(i);
    return 'id' + i;
};

var isPhysPortUsed = function(physDev, port) {
    var isFound = false;
    $linkListContainer.find(".so-link-block").each(function(e) {
        var data = $(this).data();
        if (((data['src-dev'] == physDev) && (data['src-port'] == port)) ||
            ((data['dst-dev'] == physDev) && (data['dst-port'] == port))) {
            isFound = true;
        }
    });
    return isFound;
};

function getDeviceTypeSel(isCarrier) {
    var typeSelOpts = [ {
        key : "virtual",
        value : $.i18n._("srvc.opt.typ.vnfs")
    }, {
        key : "site",
        value : $.i18n._("srvc.opt.typ.site")
    }];
    
    if (isCarrier) {
        typeSelOpts.push({
            key : "physical",
            value : $.i18n._("srvc.opt.typ.phys")
        });
    }
    
    return typeSelOpts;
}

// ---------------------------
// RENDER FORM
// ---------------------------

//render common form
var service_links_render = function (divLeft, str) {
    divLeft.append('<fieldset id="fs2"><div class="titleBar" id="' + str + '_service_links_hdr"></div><div id="service_links_container"></div></fieldset>');
    var tb2 = $("#" + str + "_service_links_hdr");    
    tb2.addSecTitle($.i18n._("srvc.ttl.links"), null, "fl");
    tb2.append('<div class="rightBtn hide"><a href="#" id="' + str + '_service_add_link" class="button btnAdd disabled" disabled="disabled"><span class="typcn typcn-plus"></span>' + $.i18n._("btn.buildLink") +  '</a></div>');        
};        

var    service_vdevs_render = function(divLeft, str) {
    divLeft.append('<fieldset id="fs1"><div class="titleBar" id="' + str + '_service_devices_hdr"></div><div id="vnf-instance-list" class="device-list-block"></div></fieldset>');
    var tb1 = $("#" + str + "_service_devices_hdr");
    tb1.addSecTitle($.i18n._("srvc.ttl.virtDevs"), null, "fl");
    tb1.append('<div class="rightBtn hide"><a href="#" id="' + str + '_service_add_vnf" class="button btnAdd mr0"><span class="typcn typcn-plus"></span>' + $.i18n._("btn.confSvc") +  '</a></div>');    
};

var service_btns_render = function(divLeft, str, saveMsg) {
    divLeft.append('<input id="' + str + '_service_create_btn" type="submit" class="button btnClear btnSave" value="' + $.i18n._("btn." + saveMsg) +  '" />');
    divLeft.append('<input id="' + str + '_service_cancel_btn" type="button" class="button btnClear btnCancel" value="' + $.i18n._("btn.cancel") +  '" />');
    
    $("#" + str + "_service_cancel_btn").click(function(ev) {
        ev.preventDefault();
        var msg = "srvc.confirm.cancel." + str;
        if (confirm($.i18n._(msg))) {
            location.href="#services-list";
        }        
    });
};


// ---------------------------
// BUILDING LINKS
// ---------------------------

function showSitesForPort(loc, val) {
    var deviceKey = $("#form-" + loc + "-endpoint-phys").val();
    var siteSourceSel = $("#form-" + loc + "-site").empty();
    var isDevice = $("#form-" + loc + "-endpoint-phys").is(":visible");

    if (isDevice) {
        var portKey = $("#form-" + loc + "-port").val();
        
        if (portKey !== "" && portKey !== null) {
            osa.ajax.list('sites', [ deviceKey, portKey ], function(siteList) {
                if (siteList.length == 0) {
                    siteSourceSel.parent().addClass("hide"); // just to make sure
                } else {
                    siteSourceSel.prepSel(true); // we have values so show it
                    for (var j = 0; j < siteList.length; j++) {
                        siteSourceSel.append("<option value='" + siteList[j].key + "'>" + siteList[j].displayName + "</option>");
                    }
                }
                
                if (val !== undefined) {
                    siteSourceSel.val(val);
                    siteSourceSel.trigger("change");                    
                }

            });
        }
        else {
            siteSourceSel.val(""); // clear it out
            siteSourceSel.hideRow();
        }
        


    } else {
        siteSourceSel.parent().addClass("hide");
    }
}

function getPhysFromList(loc, devName, str) {
    var metadata = "";
    var Str = str.charAt(0).toUpperCase() + str.substr("1");
    var allDevices = $("#services" + Str + "LinkForm").data(loc + "PhysDevObjs");

    for (var i = 0; i < allDevices.length; i++) {
        if (allDevices[i].displayName == devName) {
            metadata = allDevices[i];
            break;
        }
    }
    return metadata;
};

// .data() on each VNF
function renderPrLnkDataMain(linkBox, srcDisplayName, srcPort, dstDisplayName, dstPort, subnetStr) {
    linkBox.find(".so-link-src-dev").html(srcDisplayName);
    linkBox.find(".so-link-src-port").html(srcPort);
    linkBox.find(".so-link-dst-dev").html(dstDisplayName);
    linkBox.find(".so-link-dst-port").html(dstPort);
    linkBox.find(".soSubnetInfo").html(subnetStr);
    
    if (srcPort === undefined) {linkBox.find(".so-src-colon").remove();}
    if (dstPort === undefined) {linkBox.find(".so-dst-colon").remove();}
}

function renderPrLnkDataAux(linkBox, srcStatIpStr, srcSubnetStr, dstStatIpStr, dstSubnetStr) {
    linkBox.find(".leftSubBlock .soStaticIp").html(srcStatIpStr);
    linkBox.find(".leftSubBlock .soFloatingDetails").html(srcSubnetStr);
    linkBox.find(".rightSubBlock .soStaticIp").html(dstStatIpStr);
    linkBox.find(".rightSubBlock .soFloatingDetails").html(dstSubnetStr);    
    linkBox.find(".so-link-remove-btn").attr("title", $.i18n._("srvc.dltLink"));    
}

function renderPrLnkDataEndpoint(linkBox, srcSite, dstSite, srcDevType, dstDevType) {
    if (srcSite !== "") {$l.find(".so-link-src-dev").attr("title", srcSite).attr("alt", srcSite);}
    if (dstSite !== "") {$l.find(".so-link-dst-dev").attr("title", dstSite).attr("alt", dstSite);}
    if (srcDevType == "site") {$l.find(".so-link-src-dev").attr("title", $("#servicesCreateLinkForm").data("srcSite").deviceName);}
    if (dstDevType == "site") {$l.find(".so-link-dst-dev").attr("title", $("#servicesCreateLinkForm").data("dstSite").deviceName);}
//    if (srcPort === undefined) {$l.find(".so-src-colon").remove();}
//    if (dstPort === undefined) {$l.find(".so-dst-colon").remove();}
}

function prettyStaticIp(statIP) {
    if (statIP !== "") return " (" + statIP + ")";
    else return "";
}

function prettyFloatingIp(floatIP) {
    if (floatIP == "true") return $.i18n._("srvc.has.float.ip");
    else return "";
}

function prettyBandwidth(bwTo, bwFrom) {
    if (bwTo == "") return "";
    else {
        return $.i18n._("srvc.ep.ingress") + ": " + bwTo + "<br>" + $.i18n._("srvc.ep.egress") + ": " + bwFrom;
    }
}

//---------------------------
// POPULATE DATA
// --------------------------

function getCloudDataForCreate(target) {
    
    osa.ajax.list('clouds', function(cloudList) {
        target.data("cloudList", cloudList);

        var cloudListByKey = {};
        
        for (var i=0; i<cloudList.length; i++) {
            cloudListByKey[cloudList[i].key] = cloudList[i];
        }
        target.data("cloudListByKey", cloudListByKey);
    });
    
    if (osa.auth.getPageAccess('physicalDevices').read) {
        osa.ajax.list('centralOffices', function(cos) {
            var cloudMapById = {};
            
            for (var i=0; i<cos.length; i++) {
                cloudMapById[cos[i].key] = cos[i].displayName;
            }
            target.data("cloudMapById", cloudMapById);
        });
    }    
}

function holdTenantMap(target) {
    var tenancyMap = {};    
    var tenantToTypeKeyMap = {};
    var tenantToTypeStrMap = {};        
    
    osa.ajax.list('tenantTypes', function(elTenancy) {
        for (var i=0; i<elTenancy.length; i++) {
            tenancyMap[elTenancy[i].key] = elTenancy[i].name;
        }    
        target.data("tenancyMap", tenancyMap);
        osa.ajax.list('tenants', function(elTenant) {
            for (var i=0; i<elTenant.length; i++) {
                tenantToTypeKeyMap[elTenant[i].tenantName] = elTenant[i].key;
                tenantToTypeStrMap[elTenant[i].tenantName] = tenancyMap[elTenant[i].tenantType];
            }
            target.data("tenantToTypeStrMap", tenantToTypeStrMap);
            target.data("tenantToTypeKeyMap", tenantToTypeKeyMap);
        });        
    });
};

function holdVnfList(form) {
    var vList = [];
    var compList = {};
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        for (var i = 0; i < vnfList.length; i++) {
            vnfList[i].isComposite = false;
            vList.push(vnfList[i]);
        }
        
        osa.ajax.list('centralOfficeCompositeVNFTypes', function(cvnfList) {
            for (var j = 0; j < cvnfList.length; j++) {
                cvnfList[j].availableCustomOptimizations = [];
                cvnfList[j].isComposite = true;
                vList.push(cvnfList[j]);
                compList[cvnfList[j].key] = cvnfList[j];
            }
                
            form.data("VNFInstanceObjs", vList);
            form.data("VNFCompositeObjs", compList);
        });
    });
};


// need data before we can populate
// 1. Get the data that can be used to populate the data
// 2. Populate drop down related to the VNF selected
// 3. Set the value of the selected Port
function showPortsForEdit(loc, portVal) {
    showPortsForVNF(loc, $("#form-" + loc + "-endpoint-vnf"));
    $("#form-" + loc + "-port").val(portVal);
    $("#form-" + loc + "-port option:selected").removeAttr("disabled"); // for edit, this should not be disabled.
}

function showPortsForVNF(loc, target) {
    var val = $(target).val();
    var form = $(target).closest("form");
    var vnfBox = $("#vnf-instance-list");
    var VNFInstanceObjs = vnfBox.data("VNFInstanceObjs");
    var curVNFObj = $("#so-device--" + val.split(" ").join("-")).data();
    var portSel = $("#form-" + loc + "-port");
    var __virtDevs = {};

    // ----------------------------------------------------------
    // ALL USER DEFINED VNFS
    // ----------------------------------------------------------
    // IMPORTANT
    // The VNFActualObjs will be stored on the form's data object
    // so that it can be retireved during the submit of the form
    // -----------------------------------------------------------
    VNFActualObjs = [];
    vnfBox.children(".service-device-block").each(
            function(el) {
                VNFActualObjs.push($(this).data());
            });

    // ALL PORT NAMES
    var allVNFsPortNames = {};
    for (var i = 0; i < VNFInstanceObjs.length; i++) {
        allVNFsPortNames[VNFInstanceObjs[i].key] = VNFInstanceObjs[i].portNames;
    }

    // You need this for the ports. It may not look like you do, but you do.
    VNFActualObjs
            .map(function(e) {
                __virtDevs[e['vnf-instance-name']] = e;
                __virtDevs[e['vnf-instance-name']]['vnf-portNames'] = allVNFsPortNames[e['vnf-instance']];
            });

    // place data on form to use on submit.
    form.data("VNFActualObjs", VNFActualObjs);
    form.data(loc + "VNF", curVNFObj);

    // prepare port input
    portSel.prepSel(true);

    // populate ports
    var ports = curVNFObj['vnf-portNames'];
    for (var index = 0; index < ports.length; index++) {
        var $opt = $("<option></option>", {
            value : ports[index],
            html : ports[index]
        });
        if (getPortBlock(curVNFObj['vnf-instance-name'], ports[index]).hasClass('used')) {
            $opt.attr('disabled', 'disabled');
        }
        portSel.append($opt);
    }
};



//---------------------------
// GATHER DATA FOR XML
//---------------------------

// for submit, generating the XML
var getVNFType = function(key, _vnfList) {
    for (var i = 0; i < _vnfList.length; i++) {
        if (_vnfList[i].key == key) {
            return _vnfList[i].displayName;
        }
    }
}; 

var getPorts = function(portArray) {
    var o = [];
    for (var i = 0; i < portArray.length; i++) {
        // removed ID
        if (portArray[i].displayName === undefined)
            o.push({'@name': portArray[i]});
        else 
            o.push({'@name': portArray[i].displayName});
    }
    return {'Port': o};
};

var getProperties = function(metadata) {
    var p = [];
    for (var i in metadata) if (metadata.hasOwnProperty(i)) {
        if (i.indexOf('property-') == 0) {
            p.push({'@id': i.replace('property-', ''), '@value': metadata[i]});
        }
    }

    // just make it prettier XML
    if (p.length > 0) {
        return {'InstanceProperty': p};
    }
    else {
        return {};
    }
};

function getEndpoint(blob) {
    var endPoint = {};

    if (blob["type"] == "virtual") {
        var floatingIp = (blob.hasFlIp === undefined) ? "false" : blob.hasFlIp.toString(); // Must be a string or it will not work right for json2xml()
        var IpAddrInfo = {'@staticIP': blob.statIP, '@assignFloatingIP': floatingIp};
        endPoint['VNFEndPoint'] = {'@vnfName': blob.name,     '@portName': blob.port, '@mirrored': "false", 'IPAddressInfo':IpAddrInfo }; 
    }

    else if (blob["type"] == "site") {
        var bandwidthTo = {'@bandwidthDirection':"ToCustomer", '@customBandwidthProfile': blob.bwToStr};
        var bandwidthFrom = {'@bandwidthDirection':"FromCustomer", '@customBandwidthProfile': blob.bwFromStr};
        
        
        endPoint['SiteEndPoint'] = {'@siteName': decodeToUglyString(blob.name), '@siteID': blob.metadata.key || blob.siteID, '@mirrored': "false"};
        
        endPoint['SiteEndPoint'].BandwidthProfile = [];
        endPoint['SiteEndPoint'].BandwidthProfile.push(bandwidthTo);
        endPoint['SiteEndPoint'].BandwidthProfile.push(bandwidthFrom);
    }
     else { // "physical"
         var hasSite = false;
         // get Port ID
        var portID = "";
        var portObj = blob.metadata.portCollection;
        for (var n=0; n<portObj.length; n++) {
            if (portObj[n].displayName == blob.port) {
                portID = portObj[n].key;
                break;
            };
        } // end for
        
        // make the siteID "0" if one was not picked so XML will work
        
        if (blob.siteID == "" || blob.siteID == undefined) blob.siteID = "0";
        else hasSite = true;

        // now set the data
        endPoint['DeviceEndPoint'] = {'@centralOfficeName'  : blob.dstCentOfcName, 
                                      '@centralOfficeID'    : blob.centOfcId, 
                                      '@physicalDeviceName' : blob.name,
                                      '@physicalDeviceID'   : blob.id, 
                                      '@portName'           : blob.port,             
                                      '@portID'             : portID, 
                                      '@siteName'           : decodeToUglyString(blob.site),             
                                      '@siteID'             : blob.siteID, 
                                      '@mirrored'           : "false"};
        
        if (hasSite) {
            var bandwidthTo = {'@bandwidthDirection':"ToCustomer", '@customBandwidthProfile': blob.bwToStr};
            var bandwidthFrom = {'@bandwidthDirection':"FromCustomer", '@customBandwidthProfile': blob.bwFromStr};
            
            endPoint['DeviceEndPoint'].BandwidthProfile = [];
            endPoint['DeviceEndPoint'].BandwidthProfile.push(bandwidthTo);
            endPoint['DeviceEndPoint'].BandwidthProfile.push(bandwidthFrom);            
        }
        

     }
    
    return endPoint;
};


function getScaleAlarmProfiles(fields) {
    var opts = [];
    var scaleObj = fields.scaleAlarmProfileDTO;

    if (scaleObj && scaleObj.name !== ""){
        var sapName = scaleObj.name;
        var sapID = parseInt(scaleObj.alarmProfileTypeKey);
        opts.push({"@scaleAlarmProfileTypeID" : sapID, "@scaleAlarmProfileName" : sapName});
    }

    return opts;
};

// ------------------------------
// UTLITY FUNCTIONS
// ------------------------------

var getPortBlock = function(name, port) {
    return $("#so-port--" + name + "_" + port);
};

var updateSitesUsed = function (linkSet) {
    var sitesUsed = [];
    var links = linkSet.find(".so-link-block");
    
    for (var i=0; i<links.length; i++) {
        var curLink = $(links[i]);
        if (curLink.data("src-type") == "site") {
            sitesUsed[curLink.data("src_site_id")] = curLink.data("src-site");
        }
        if (curLink.data("dst-type") == "site") {
            sitesUsed[curLink.data("dst_site_id")] = curLink.data("dst-site");
        }        
    }
    
    linkSet.data("sitesUsed", sitesUsed);
};

//----------------------------------------------
// EDIT LINK COMMON FUNCTIONS
//----------------------------------------------






// MAKE PRETTY STRING FOR LINKS TABLE
function getPrStrLinksNwIntcntNoEdt() {
    var nwData = $("#uneditableLinkData").data("nwData");
    var subnetStr = "";
    
//    if (nwData === undefined) {
//        
//    }
//    else {
        var isConnectExtRtr = nwData.isConnectExtRtr;
        var subnetCIDR = nwData.subnetCIDR;
        var rangeSet = nwData.rangeSet;
        var extGwIp = nwData.extGW;
         

        if (subnetCIDR !== undefined && subnetCIDR.length > 0) {
            subnetStr = subnetStr + $.i18n._("srvc.ni.sub.cidr") + ": " + subnetCIDR + "/" + nwData.subnetCIDRext;
             
             if (rangeSet.length > 0) {
                 subnetStr = subnetStr + "<br>" + $.i18n._("srvc.ni.dhcp.range") + " : " + rangeSet[0].begin + " - " +  rangeSet[0].end;
             }
        }    


        // EXT ROUTER CONNECTION
        if (isConnectExtRtr) {
            if (extGwIp !== null && extGwIp !== undefined && extGwIp.length > 0) {
                subnetStr = subnetStr + "<br>" + $.i18n._("srvc.via") + ": " + extGwIp;
            } 
            else {
                subnetStr = subnetStr + "<br>" + $.i18n._("srvc.via.dhcp");
            }
        }
//    }

    return subnetStr;
}

// ----------------------------------------------
// CREATE LINK COMMON FUNCTIONS
// ----------------------------------------------

// MAKE PRETTY STRING FOR LINKS TABLE
function getPrStrLinksNwIntcnt() {

    var subnetStr = "";
    var isExplicit = $("#form-nw-interconnect-is-explicit").is(":checked");
    var isConnectExtRtr = $("#form-nw-interconnect-ext_router").is(":checked");
    var hasExtGwStatIP = $("#nw-interconnect-via-static").is(":checked");
    var rangeSet = [];
    
    // CIDR and RANGE INFO
    if (isExplicit) {
        subnetCIDR = $("#form-nw-interconnect-subnet-cidr").val() + "/" + $("#form-nw-interconnect-subnet-cidr-slash").val();
        subnetStr = subnetStr + $.i18n._("srvc.ni.sub.cidr") + ": " + subnetCIDR;
        
        $("#form-nw-interconnect-subnet-range").children().each(function() {
            var min = $(this).find(".min").val();
            var max = $(this).find(".max").val();
            var hasValues = $(this).find(".min").val().length > 0;
            
            if (hasValues) {
                rangeSet.push({"begin": min, "end": max });
                subnetStr = subnetStr + "<br>" + $.i18n._("srvc.ni.dhcp.range") + ": " + min + " - " + max;
            }
        });
    }    
    
    // EXT ROUTER CONNECTION
    if (isConnectExtRtr) {
        if (hasExtGwStatIP) {
            extGW = $("#form-nw-interconnect-static-ip").val();
            subnetStr = subnetStr + "<br>" + $.i18n._("srvc.via") + ": " + extGW;
        } 
        else {
            subnetStr = subnetStr + "<br>" + $.i18n._("srvc.via.dhcp");
        }
    } 
    
    return subnetStr;
}

function getCoEndpoint(loc, tenantId) {
    $("#form-" + loc + "-endpoint-phys").parent().removeClass("hide");
    
    var port = $("#form-" + loc + "-port");
    var site = $("#form-" + loc + "-site");
    
    port.val("");
    site.val("");
    
    port.parent().addClass("hide");
    site.parent().addClass("hide");         
    
    osa.ajax.list("physicalDevices", [$("#form-" + loc + "-central-office").val(), tenantId], function(physList) {
         var physDev = $("#form-" + loc + "-endpoint-phys");
         var form = $("#servicesCreateLinkForm");
         
         physDev.prepSel(true);
         form.data(loc + "PhysDevObjs", physList);
         
         for (var i = 0; i < physList.length; i++) {
             // TODO: adding this check for 14.2 only - will be removed in 14.3
           //  if(physList[i].location.isCentralOfficeLocation) {
                 physDev.append($("<option></option>", {value : physList[i].key, html : physList[i].displayName}));
             //} 
         }
         
         if ($("#servicesCreateLinkForm").data("isEdit")) {
             physDev.val($("#servicesCreateLinkForm").data("linkData")[loc + "-metadata"].key);
             physDev.trigger("change");
         }
    });    
}


// GET SITES FOR TENANT
function holdSitesOfTenant(tenantId, target) {
    osa.ajax.list("sites", [tenantId], function(siteList) {
        $("#" + target).data("SiteInstanceObjs", siteList);
    });
}


// SUPPORT FOR EXPLODING COMPOSITES
function setLinkForComposite(ep1, ep2, cur, fields) {
    var con1 = cur.nestedVNFTypeConnector1;
    var con2 = cur.nestedVNFTypeConnector2; 
    var vnfData = $("#vnf-instance-list").closest("form").data("vnfByName");
    vnfInstId1 = vnfData[ep1.vnfTypeBase.displayName].key;
    vnfInstId2 = vnfData[ep2.vnfTypeBase.displayName].key;
    var prefix = fields["vnf-instance-name"];
    var srcMetadata = getVNFObj(cur, fields, ep1);
    var dstMetadata = getVNFObj(cur, fields, ep2);
    srcMetadata["vnf-instance-name"] = prefix + "_" + ep1.displayName;
    dstMetadata["vnf-instance-name"] = prefix + "_" + ep2.displayName;

    var dataObj = {
            "src-dev"       : prefix + "_" + ep1.displayName,
            "src-port"      : con1.nestedVNFType.vnfTypeBase.portNames[con1.portIndex],
            "src-site"      : undefined,
            "src_site_id"   : null,
            "src-name"      : prefix + "_" + ep1.displayName,
            "src-type"      : "virtual",                    
            "src-metadata"  : srcMetadata,
            "srcEpIpData"   : {assignFloatingIP : false, assignedIP : null, floatingIP : null, staticIP : ""},
            
            "dst-dev"       : prefix + "_" + ep2.displayName,
            "dst-port"      : con2.nestedVNFType.vnfTypeBase.portNames[con2.portIndex],
            "dst-site"      : undefined,
            "dst_site_id"   : null,
            "dst-name"      : prefix + "_" + ep2.displayName,
            "dst-type"      : "virtual",                    
            "dst-metadata"  : dstMetadata,
            "dstEpIpData"   : {assignFloatingIP : false, assignedIP : null, floatingIP : null, staticIP : ""},
            
            "nwIntCIDR"     : "",
            "nwHasExtGW"    : false,
            "nwExtGW"       : "",
            "nwDhcpRanges"  : [],
    };
    
    $l = $("#so-link-block").clone().removeAttr("id");        
    $l.data(dataObj);

    renderPrLnkDataMain($l, dataObj["src-dev"], dataObj["src-port"], dataObj["dst-dev"], dataObj["dst-port"], "");
    
    $("#service_links_container").append($l);
}


function updatePortAvailability () {
    $(".service-create-device-port").removeClass("used available");
    $("#service_links_container").find(".so-link-block").each(function() {
        var t = $(this).data();
        if (t["src-metadata"]["vnf-instance"]) {
            getPortBlock(t["src-name"], t["src-port"]).addClass("used");
        }
        if (t["dst-metadata"]["vnf-instance"]) {
            getPortBlock(t["dst-name"], t["dst-port"]).addClass("used");
        }
    });
};






// -----------------------------------------------------------------
// FUNCTIONS THAT CAME FROM THE DUPLICATE SET FROM 4 DIFFERENT FILES
// -----------------------------------------------------------------
function createVirtualDevice(vnfName, portNames, metadata) {
    var deviceKey = idify(vnfName);
    var vnfBlock = $vnfInstances = $("#vnf-instance-list");
    
    // we rename the vnf because this may hav come from a composite
    metadata["vnf-instance-name"] = vnfName;
    
    // ------------------------------------------
    // Build UI Structure
    // ------------------------------------------
    var $div = $("<div class='service-device-block device-block virtual altRows' id='so-device--" + deviceKey + "'></div>").data(metadata);
    $div.append($("<p class='dev-title'>" + vnfName + "</p><div class='btnContainer'>"));
    var $editBtn = $("<a></a>", {'class': 'edit-btn btnRound fr', href: "#", title: $.i18n._("srvc.hvr.edtVNF")}).appendTo($div.find(".btnContainer"));
    var $delBtn = $("<a></a>", {'class': 'delete-btn btnRound fr', href: "#", title: $.i18n._("srvc.hvr.dltVNF"), alt: $.i18n._("srvc.hvr.dltVNF")}).appendTo($div.find(".btnContainer"));
    $delBtn.append('<img src="images/delete.png">');
    $editBtn.append('<img src="images/edit.png">');

    var addPort = function(portName) {
        $("<div></div>").addClass('rendered-vnf-port device-port').attr('id', 'so-port--' + deviceKey + "_" + portName).html('').appendTo($div);
    };

    $delBtn.click(function(ev) {
        ev.preventDefault();
        if (confirm($.i18n._("srvc.prmpt.dlt.dev"))) {
            var idToRemove = $div.data('vnf-instance-name');
            $div.remove();

            rebuildVNFList();
            removeLinksAssociatedWithVNF(idToRemove);
        }
    });
    
    $editBtn.click(function(ev) {
        ev.preventDefault();
        showEditVNF($div.data());
        rebuildVNFList(); // may not need to do this
    });        

    if (portNames) {
        for ( var i = 0; i < portNames.length; i++ ) {
            addPort(portNames[i]);
        }
    }

    $div.appendTo(vnfBlock);
    rebuildVNFList();
};

function removeLinkBlock($block) {
    data = $block.data();
    
    // remove "used" status of port here
    if(data["src-type"] == "virtual") {
        var name = data["src-name"];
        var port = data["src-port"];
        var portBlock = getPortBlock(name, port);
        portBlock.removeClass("used");
    }
    
    if(data["dst-type"] == "virtual") {
        var name = data["dst-name"];
        var port = data["dst-port"];
        var portBlock = getPortBlock(name, port);
        portBlock.removeClass("used");
    } 
    
    $block.remove();
    updateSitesUsed($("#service_links_container"));
    updatePortAvailability();
    generateMap();
};


function removeLinksAssociatedWithVNF(vnfid) {
    $("#service_links_container").find(".so-link-block").filter(function() {
        var d = $(this).data();
        if ((d['src-name'] == vnfid) || (d['dst-name'] == vnfid)) {
            $(this).remove();
            
            if (d['src-name'] == vnfid) {     // remove port connection from the destination
                portBlock = getPortBlock(d['dst-name'], d['dst-port']);
                portBlock.removeClass("used");
            }
            else {                            // remove port connection from the source
                portBlock = getPortBlock(d['src-name'], d['src-port']);
                portBlock.removeClass("used");
            }
        }
    });
    generateMap();
};

var generateMap = function() {
    var nodeMap = {
        nodes : [],
        links : []
    };
    var vnfInstances = $("#vnf-instance-list").data("vnfInstances");
    var hasCloud = osa.auth.getPageAccess('clouds').read;

    // ------------------------------------------
    // GATHER PHYS DEVS
    // ------------------------------------------
    // get physical nodes so we can use the location in the rendered diagram.
    var physNodes = getPhysicalDevicesUsed();
    
    for (var i in physNodes) {
        nodeMap.nodes.push({
            name : i,
            type : 'PhysDev',
            location : physNodes[i],
            description : $.i18n._("srvc.opt.typ.phys")
        });
    }

    
    // ------------------------------------------
    // GATHER VNFs
    // ------------------------------------------
    // when you connect two devices, there will not be a VNF
    // but if that is not the case, deal with the VNF here
    if (vnfInstances !== undefined) {
        for (var i = 0; i < vnfInstances.length; i++) {
            
            // If there is not a location selected, we need to back-calculate the main location
            // JIC = Just in Case
            // This can only happen if it is a carrier, not a customer.  Customers do not get clouds.
            var cloudDataJIC = "";
            var locVal = "";
            
            
            // LOCATION for CARRIER ONLY if the user picked a cloud
            if (hasCloud) {
                var cldId = (vnfInstances[i]["vnf-optimization"].cloudKey); // cloudId removed for cloudKey
                
                // now that cloud is not required, assume it could be absent
                if (cldId !== undefined && cldId !== "" && cldId !== null) {
                    cloudDataJIC = $("#vnf-instance-list").closest("form").data("cloudListByKey")[cldId].cloudLocations;
                    locVal = vnfInstances[i]["vnf-optimization"].cloudLocationName;
                    
                    if (locVal == "") {
                        for (var x=0; x<cloudDataJIC.length; x++) {
                            if (cloudDataJIC[x].isCentralOfficeLocation) {
                                locVal = cloudDataJIC[x].displayName;
                                break;
                            }
                        }
                        
                    }
                }
            }


            
            nodeMap.nodes.push({
                name : vnfInstances[i]['vnf-instance-name'],
                type : 'VNF',
                location: locVal,
                description : vnfInstances[i].vnfType
            });
        }        
    }

    // ------------------------------------------
    // GATHER SITES
    // ------------------------------------------
    var siteLoc = "";
    var siteNodes = getSiteDevicesUsed();
    // The site needs the location value, so get it from a saved data() object
    
    
    for (var i in siteNodes) {
        if (hasCloud) {siteLoc = siteNodes[i];} // Only Carriers not get clouds.
        
        nodeMap.nodes.push({
            name : i,
            type : 'Site',
            location : siteLoc,
            description : $.i18n._("srvc.opt.typ.site")
        });
    }


    // Build the list of interconnections
    $("#service_links_container").find(".so-link-block").each(function() {
        nodeMap.links.push({
            from : $(this).data('src-name'),
            to : $(this).data('dst-name'),
            data: $(this).data()
        });
    });

    var map = osa.ui.map.create('services-diagram-map', nodeMap, "mapBox");  // EDIT
    map.render(true);
};

// FUNCTIONS JUST FOR CARRIER SERVICES
var getPhysicalDevicesUsed = function() {
    var d = {};
    $("#service_links_container").find(".so-link-block").each(function(e) {
        var data = $(this).data();
        if (data['src-type'] === 'physical') {d[data['src-name']] = data["src-metadata"].location.displayName;}
        if (data['dst-type'] === 'physical') {d[data['dst-name']] = data["dst-metadata"].location.displayName;}
    });

    return d;
};

var getSiteDevicesUsed = function() {
    var d = {};
    $("#service_links_container").find(".so-link-block").each(function(e) {
        var data = $(this).data();
        if (data['src-type'] === 'site') {d[data['src-name']] = data["src-metadata"].centralOfficeName;}
        if (data['dst-type'] === 'site') {d[data['dst-name']] = data["dst-metadata"].centralOfficeName;}
    });

    return d;
};