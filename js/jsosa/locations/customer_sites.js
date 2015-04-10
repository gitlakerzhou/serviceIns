//@ sourceURL=http://localhost:8080/ajax/locations-centralOffices.js
//function run_locations_sites() {    

// This is called on load
(function(access) {
    var isWriteAccess = osa.auth.getPageAccess('sites').write;
    var page = $("#sites");
    page.data("isWriteAccess", isWriteAccess);
    
    $("#physDeviceTypeLoading").html($.i18n._("cmn.loading")).addClass("hide");
    
    page.removeClass("hide");
    
    renderWarningsIfNeeded();
    $("#location-add-site-btn .bigBtnTxt").html($.i18n._("loc.hdr.main"));
    
    // Make sections
    // This code came from Josh's code and makes sections for each tenant that the cards
    // will be rendered to.
    osa.ajax.list('tenants', function(tData) {
        // prepare for select for add
        var __tenantDropdown = [];
        
        for (var i=0; i<tData.length; i++) {
            var name = tData[i].tenantName;
            
            page.append("<div class='tenantBlock' id='" + tData[i].key + "'><a class='list-block-header-name' href='#'><div class='tenantLabel'><span class='list-block-arrow typcn typcn-chevron-right'></span>" + name + "</div></a><div class='siteBlocksForTenant'></div></div>");

            $("#" + tData[i].key + " .tenantLabel").click(function() {
                var blocks = $(this).closest(".tenantBlock").find(".siteBlocksForTenant");
                if (blocks.is(":visible")) {
                    blocks.hide("slow");
                    blocks.find(".typcn-chevron-right").removeClass("transform90");
                }
                else {
                    blocks.show("slow");
                    blocks.find(".typcn-chevron-right").addClass("transform90");
                }
            });
            
            // Josh captured this data to be used for the drop down in the popup form for later.
            __tenantDropdown.push({key: tData[i].key, value:tData[i].tenantName});
        }
        
        // This call renders the cards into the different tenant sections and came from Josh's code.
        osa.ajax.list('sites', function(sites) {
            for (var i=0; i<sites.length; i++) {
                renderCardForSite(sites[i]);
            }
            // now add counts
            $(".tenantBlock").each(function() {
                var count =$(this).find(".siteBlocksForTenant").children(".list-block").length;
                $(this).find(".siteBlocksForTenant").siblings().find(".tenantLabel").append("<span class='blockCount'> (" + count + ") </span>");
            });
        });
        
        

        // This is how Cori saves the data to use for popup later
        page.data("tenants", __tenantDropdown);
        
    });
})();


function renderWarningsIfNeeded() {
    if (osa.auth.getPageAccess('physicalDevices').write) {
        osa.ajax.list('physicalDevices', function(data) {
            if (data.length == 0) {
                var target = $("#statusCenter");
                target.html("<div class='warningStatus fl'>" + $.i18n._("stat.warning") + "</div><div class='mainWarning fl'>" + $.i18n._("loc.msg.warn.no.device") + "</div>");
            }
        });
    }
}

// This function renders a card under a tenant section.
function renderCardForSite(dataObj) {
    var isWriteAccess =  $("#sites").data("isWriteAccess");
    var id = dataObj.key;
    var tenantBlock = $("#" + dataObj.tenantKey + " .siteBlocksForTenant");
    tenantBlock.append('<div id="siteBlock' + id + '" class="list-block"></div>');
    
    var card = $("#siteBlock" + id);
    card.data("data", dataObj);
    
    // show non-editable data about the site at the top,
    card.append('<div class="button-container-site"><a class="block-delete-btn typcn typcn-times" title="' + $.i18n._("btn.delete") + ' href="#"></a></div>');
    card.append('<div class="hdrForVNFs"><span class="vnfdisplayName">' + dataObj.displayName + '</span><div class="status fr"></div></div>');
    card.append('<div class="row oneHalf"><label class="fl">' + $.i18n._("cmn.cntrl.offc") + '</label><div class="fl">' + dataObj.centralOfficeName + '</div></div>');
    card.append('<div class="row oneHalf"><label class="fl">' + $.i18n._("srvc.device") + '</label><div class="fl">' + dataObj.deviceName + '</div></div>');
    card.append('<div class="insideHdr clear">' + $.i18n._("loc.hdr.vlans") + '</div>');
    
    // only allow delete if there is write access.
    if (isWriteAccess) {
        card.find(".block-delete-btn").attr('id', 'site-delete-btn-' + dataObj.key).data({'id': dataObj.key}).click(deleteSite);
    }
    else {
        card.find(".block-delete-btn").remove();
    }
  
    // -----------------------------------------
    // VLAN
    // -----------------------------------------
    // append a table of vlan info
    card.append("<table class='vlanTable'></table>");
    var table = card.find(".vlanTable");
    for (var x=0; x<dataObj.vlanInfoCollection.length; x++) {
        var dta = dataObj.vlanInfoCollection[x];
        var vlanValue = dta.vlanValue == null ? "" : dta.vlanValue;
        table.append("<tr class='vlan'><td>" + dta.portName + "</td><td>" + dta.vlanPortType + "</td><td>" + dta.vlanDirection + "</td><td>" + dta.vlanTagType + "</td><td align='right'>" + vlanValue + "</td><td>" + dta.vlanOperation + "</td></tr>");
    }
    
    // buttons: only allow delete if there is write access.
    if (isWriteAccess) {
        card.append('<div class="btnContainer btnGutter"></div>');
        card.append("<div class='bwMsgBlock'><div class='status fl'></div><div class='mainWarning needBwWarn fl'></div></div>");
        card.append("<div class='bwMsgBlock2 hide'><div class='status fl'></div><div class='mainWarning optWarning fl ' style='display: inline-table;'></div></div>");
        card.find(".btnContainer").append('<a class="addBwProfileBtn button btnAdd" href="#"><span class="typcn typcn-plus"></span>' + $.i18n._("dev.btn.add.bw") + '</a>');
    }
    
    // -----------------------------------------
    // LOCATIONS
    // -----------------------------------------
    card.append('<form class="bandwidthInputBlock hide inputBlock"></form>');
    
    var form = card.find(".bandwidthInputBlock");
  
    form.addSelect("bw_profile" + id, $.i18n._("dev.btn.bw.profs"), true);
    
    form.append('<input id="cancel_bw_btn' + id + '" class="cancelBtn button btnSm fr" type="submit" value="' + $.i18n._("btn.close") + '">');
    form.append('<input id="save_bw_btn' + id + '" class="button btnSm btnSave fr" type="submit" value="' + $.i18n._("dev.btn.save.bw") + '">');
    
    card.append('<div class="successMsg hide">' + $.i18n._("dev.msg.success.bw") + '</div>');
    
    // add table
//    var statusTop = card.find(".hdrForVNFs .status");
    
    card.append("<div class='bandwidthBlock clear'></div>");

    var bwBlock = card.find(".bandwidthBlock");
    
    if (dataObj.siteBandwidthProfileCollection.length > 0) {

        
        bwBlock.append("<table cellspacing=0 class='siteBwProfiles'><tr><th class='innerTableHeader'>" + $.i18n._("dev.ttl.bw.profs") + "</th><th class='innerTableHeader'>&nbsp;</th></tr></table>");
        var bw = dataObj.siteBandwidthProfileCollection;
        
        repopulateBandwidthProfileTable(bw, card.find(".siteBwProfiles"));
        hideBwWarning(card);
//        statusTop.html("").removeClass("warningStatus");
//        bwBlock.find(".status").html("").removeClass("warningStatus");
//        bwBlock.find(".mainWarning").html("");
    }
    else {
        showBwWarning(card)
//        statusTop.html($.i18n._("stat.warning")).addClass("warningStatus");
//        bwBlock.find(".status").html($.i18n._("stat.warning")).addClass("warningStatus");
//        bwBlock.find(".mainWarning").html($.i18n._("loc.msg.warn.need.bw.prof"));
    }

    
    
    // VALIDATION
    form.validate();

    // BUTTON CLICK ACTIONS
    $("#cancel_bw_btn" + id).click(function(ev){
        ev.preventDefault();
        var card = $(this).closest(".list-block");
        var bandwidthInputBlock = card.find(".bandwidthInputBlock");
        card.find("input").not(".button").val("");
        bandwidthInputBlock.hide("slow");
    });
    
    $("#save_bw_btn" + id).click(function(ev){
        ev.preventDefault();
        
        var card = $(this).closest(".list-block");
        
        if (card.find(".bandwidthInputBlock").valid()) {
            var data = card.data("data");
            var id = data.key;
            var bw = $("#bw_profile" + id).val();
            var name = $("#bw_profile" + id + " option:selected").html();
    
               var o = {
                       key: bw,
                       displayName: name,
                       siteKey: id,
                       siteName: data.displayName
             };
            
            osa.ajax.add('customBandwidthProfilesSite', o, function() {
                $("#bw_profile" + id).val("");
                osa.ajax.get("customBandwidthProfilesSite", id, function(data) {
                    updateTableWithBandwidthProfiles(data, "siteBlock" + id);
                });
            });
        }
    });
    
    card.find(".addBwProfileBtn").click(function(ev){
        ev.preventDefault();
        var card = $(this).closest(".list-block");
        var bandwidthInputBlock = card.find(".bandwidthInputBlock");
        var data = card.data("data");
        var id = data.key;
        var sel = $("#bw_profile" + id);
        sel.val("");
        
//        hideBwWarning(card);
        
        // populate the drop down if needed
        if (sel.find("option").length <= 1) {
            sel.empty();
            sel.append("<option value=''></option>");
            osa.ajax.get("customBandwidthProfiles", data.physicalDeviceTypeKey, function(data) {
                card = sel.closest(".list-block");
                
                if (data.length==0) {
                    showBwWarning2(card);
                }
                else {
                    hideBwWarning2(card);
                }
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        sel.append("<option value='" + data[i].key + "'>" + data[i].displayName + "</option>");
                    }
                }
            });
        }
        
        bandwidthInputBlock.show("slow").css("display", "inline-block");
    });
  }



// This code renders the bandwidth profile table with new data
// It will not render the delete button if the user does not have write access
function repopulateBandwidthProfileTable(data, table) {
    var isWriteAccess =  $("#sites").data("isWriteAccess");
    
    for (var j=0; j<data.length; j++) {
        var id = data[j].siteKey;
        var bwId = data[j].key;
        var bwStr = data[j].displayName;
        var atlTxt = $.i18n._("btn.deleteCtx", $.i18n._("dev.btn.bw.profs"));
        var delBtn = "";
        
    
        if (isWriteAccess) {
            delBtn = '<a id="del_loc_' + id + "_" + bwId + '"class="delete_loc_btn btnRound fr" href="#" title="' + atlTxt + '" alt="' + atlTxt + '"><img src="images/delete.png"></a>';
        }
        
        table.append("<tr><td>" + bwStr + "</td><td>" + delBtn + "</td></tr>");
    
        if (isWriteAccess) {
            $("#del_loc_" + id + "_" + bwId).data("siteId", id);
            $("#del_loc_" + id + "_" + bwId).data("bwData", data[j]);
            $("#del_loc_" + id + "_" + bwId).click(deleteBandwidthProfile);
        }
    };
}


//Showe success, clean up the area, and then call repopulateBandwidthProfileTable above
function updateTableWithBandwidthProfiles(data, target) {
    var successMsg = $("#" + target).find(".successMsg");
    // show message
    successMsg.show("slow");

    // -----------
    // table
    // -----------
    var card = $("#" + target);
    var table = card.find("table.siteBwProfiles");

    
    // make sure we have a table
    if (table.length == 0) {      
        $("#" + target).append("<table class='siteBwProfiles' cellspacing=0></table>");
        table = $("#" + target).find("table.siteBwProfiles");
    }


    // now we can empty it
    table.empty();
    
    // and fill it
    if (data.length > 0) {
        table.append("<tr><th class='innerTableHeader'>" + $.i18n._("dev.ttl.bw.profs") + "</th><th class='innerTableHeader'>&nbsp;</th></tr>");
        repopulateBandwidthProfileTable(data, table);
        hideBwWarning(card);
    }
    else {
        showBwWarning(card);
    }

    // clear up form
    var form = table.closest(".list-block");
    form.find("input").not(".button").val("");
    
    // hide success
    setTimeout(function(){successMsg.hide("slow");}, 2000);
};


// delete fucntionality for the deletion of the badnwidth profile is here.
function deleteBandwidthProfile(ev) {
    ev.preventDefault();
    var siteData = $(ev.target).closest(".list-block").data("data");
    var siteId = siteData.key;
    var bwData = $(ev.target).closest(".btnRound").data("bwData");
   
  
    if (confirm($.i18n._( "site.prmpt.dltBw"))) {
        osa.ajax.update('customBandwidthProfilesSite', bwData, function() {
            // now repopuplate
            osa.ajax.get("customBandwidthProfilesSite", siteId, function(data) {
                updateTableWithBandwidthProfiles(data, "siteBlock" + siteId);
            });
        });
    }
};

// This came with Josh's original code or from Ritu, I am unsure.
// TODO: Globalize (I did do the ingress and egress inpts but not the whole form yet)
osa.page.addPageEvent('#location-add-site-btn', 'click', function(ev) {
    var __devList = [];
    __coList = [];
    ev.preventDefault();

    osa.ajax.list('centralOffices', function(coList) {
        for (var i = 0; i < coList.length; i++) {
            __coList.push({key: coList[i].key, value:coList[i].displayName});
        }

        var _tagTypeIngressDD = [
            {key:'UnTagged', value:$.i18n._("loc.tag.type.untagged")},
            {key:'Tagged', value:$.i18n._("loc.tag.type.tagged")},
            {key:'Value', value:$.i18n._("loc.tag.type.val")}
        ];

        var _tagTypeEgressDD = [
            {key:'CTag', value:$.i18n._("loc.tag.type.ctag")},
            {key:'STag', value:$.i18n._("loc.tag.type.stag")}
        ];

        var _operationInDD = [
            {key:'Match', value:$.i18n._("loc.tag.type.match")},
            {key:'MatchPop', value:$.i18n._("loc.tag.type.match.pop")}
        ];

        var _operationEgDD = [
            {key:'Push', value:$.i18n._("loc.oper.push")}
        ];

        var p = osa.ui.formPopup.create($.i18n._("loc.hdr.main"), null, {submitLabel: $.i18n._("loc.hdr.main")});
        p.addField('site-name', $.i18n._("loc.site.name"), 'string');
        p.addField('site-tenant', $.i18n._("loc.tenant.name"), 'select', $("#sites").data("tenants"));
        p.addField('site-centraloffice', $.i18n._("cmn.cntrl.offc"), 'select', __coList, function() {
            var selVal = p.getField('site-centraloffice').val();
            if (selVal) {
                osa.ajax.list('physicalDevices', [selVal], function(sw) {
                    __devList = sw;
                    p.getField('site-port').empty();
                    var $sws = p.getField('site-device').empty();
                    $("<option></option>", {value:null, html:''}).appendTo($sws);
                    for (var i = 0; i < __devList.length; i++) {
                        if (__devList[i].readyStatus == "readyForUse") {
                            $("<option></option>", {value:__devList[i].key, html:__devList[i].displayName}).appendTo($sws);
                        }
                    }
                });
            }
        });

        p.addField('site-device', $.i18n._("loc.attach.dev"), 'select', [], function() {
            var $pts1 = p.getField('customer-port').empty();
            var $pts2 = p.getField('provider-port').empty();
            var form = $("#sitePopup");
            var usedPort = "";
            

            $("<option></option>", {value:'', html:''}).appendTo($pts1);
            $("<option></option>", {value:'', html:''}).appendTo($pts2);
            
            // determine if this is a complicated situation were a 65 connects to a 6500
            osa.ajax.get('physicalDevices', $("#form-site-device").val(), function(devData) {
                var ports = [];
                
                if ( !devData.location.isCentralOfficeLocation && devData.networkPhysicalConnection) { // special
                    ports = devData.portCollection;
                    usedPort = devData.networkPhysicalConnection.networkFacingPortName; 
                    
                    $(".optVlan").removeClass("hide");
                    
                    form.data("nwPhysConct", devData.networkPhysicalConnection);
                    
                    
                    // different port lists
                    for (var i = 0; i < ports.length; i++) {
                        var $o;
                        
                        if (ports[i].displayName == usedPort) // gray out the used one
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName, disabled:"disabled"});
                        else
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName});
                        
                        $pts1.append($o.clone());
                    }
                    
                    for (var i=0; i<__devList.length; i++) {
                        if (__devList[i].key == devData.networkPhysicalConnection.networkPhysicalDeviceKey) {
                            ports = __devList[i].portCollection;
                            break;
                        }
                    }
                    
                    for (var i = 0; i < ports.length; i++) {
                        var $o;
                        usedPort = devData.networkPhysicalConnection.networkPhysicalDevicePortName;
                        
                        if (ports[i].displayName == usedPort) // gray out the used one
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName, disabled:"disabled"});
                        else
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName});
                        
                        $pts2.append($o.clone());
                    }                        
                    
                }
                
                
                
                else { // normal
                    for (var i = 0; i < __devList.length; i++) {
                        if (__devList[i].key == p.getField('site-device').val()) {
                            ports = __devList[i].portCollection;
                            break;
                        }
                    }
                    
                    $(".optVlan").addClass("hide");
                    form.data("nwPhysConct", null);
                    
                    // both are the same for "normal"
                    for (var i = 0; i < ports.length; i++) {
                        var $o;
                        
                        if (ports[i].displayName == usedPort) // gray out the used one
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName, disabled:"disabled"});
                        else
                            $o = $("<option></option>", {value:ports[i].key, html:ports[i].displayName});
                        
                        $pts1.append($o.clone());
                        $pts2.append($o.clone());
                    }
                }
            });
        });

        p.addField('customer-port', $.i18n._("loc.customer.port"), 'select', [], function() {
            for (var i = 0; i < __devList.length; i++) {
                if (__devList[i].key == p.getField('site-device').val()) {
                    for (var j = 0; j < __devList[i].portCollection.length; j++) {
                        if (__devList[i].portCollection[j].key == p.getField('customer-port').val()) {
                            p.getField('customer-port-name').val(__devList[i].portCollection[j].displayName);
                            break;
                        }
                    }
                }
            }
        });
       /* p.addField('provider-port', "Provider Port", 'select', [], function() {
            for (var i = 0; i < __devList.length; i++) {
                if (__devList[i].key == p.getField('site-device').val()) {
                    for (var j = 0; j < __devList[i].portCollection.length; j++) {
                        if (__devList[i].portCollection[j].key == p.getField('provider-port').val()) {
                            p.getField('provider-port-name').val(__devList[i].portCollection[j].displayName);
                            break;
                        }
                    }
                }
            }
        });*/
        p.addField('customer-port-name', $.i18n._("loc.customer.port.name"), 'hidden', '');
       /* p.addField('provider-port-name', 'Provider Port Name', 'hidden', '');*/


        p.addHeader($.i18n._("loc.hdr.cust.ingress"));
        p.addField('cvlani-operation', $.i18n._("loc.operation"), 'select', _operationInDD);
        p.addField('cvlani-type', $.i18n._("loc.tag.type"), 'select', _tagTypeIngressDD);
        p.addField('cvlani-value', $.i18n._("cmn.val"), 'string', [], null, "hide");

        p.addHeader($.i18n._("loc.hdr.cust.egress"));
        p.addField('cvlane-operation', $.i18n._("loc.operation"), 'select', _operationEgDD);
        p.addField('cvlane-type', $.i18n._("loc.tag.type"), 'select', _tagTypeEgressDD);
        p.addField('cvlane-value', $.i18n._("cmn.val"));

      /*  p.addHeader($.i18n._("loc.hdr.prov.ingress"));
        p.addField('pvlani-value', $.i18n._("cmn.val"), 'string', [], null);

        p.addHeader($.i18n._("loc.hdr.prov.egress"));
        p.addField('pvlane-value', $.i18n._("cmn.val"));*/


        p.addHeader($.i18n._("loc.hdr.nw.vlan"), "nwVlanOptHdr", "optVlan hide");
        p.addField('nw_vlan_value', $.i18n._("cmn.val"), 'string', [], null, "optVlan hide");
        
        p.setRequiredFields(['site-name', 'site-tenant', 'site-centraloffice', 'site-device', 'site-port']);
        
        p.setSubmitAction(function(fields) {
            
            var nwVlan = $("#sitePopup").data("nwPhysConct");           // in the case of 65 > 6500
            var providerData = {                                        // ProviderPort device name and key
                deviceName : $("#form-site-device :selected").html(),
                deviceKey : $("#form-site-device").val()
            };
            
            if (nwVlan) {
                providerData.deviceName = nwVlan.networkPhysicalDeviceName;
                providerData.deviceKey = nwVlan.networkPhysicalDeviceKey;
            }
            
            var vlic = [];

                vlic.push({
                    portKey: fields['customer-port'],
                    portName: fields['customer-port-name'],
                    vlanPortType: 'CustomerPort',
                    vlanDirection: "Ingress",
                    vlanTagType: (fields['cvlani-type'] == '') ? 'None' : fields['cvlani-type'] ,
                    vlanOperation: fields['cvlani-operation'],
                    vlanValue: fields['cvlani-value'],
                    deviceName: $("#form-site-device :selected").html(),
                    deviceKey: $("#form-site-device").val()
                });

                vlic.push({
                    portKey: fields['customer-port'],
                    portName: fields['customer-port-name'],
                    vlanPortType: 'CustomerPort',
                    vlanDirection: "Egress",
                    vlanTagType: (fields['cvlane-type'] == '') ? 'None' : fields['cvlane-type'] ,
                    vlanOperation: fields['cvlane-operation'],
                    vlanValue: fields['cvlane-value'],
                    deviceName: $("#form-site-device :selected").html(),
                    deviceKey: $("#form-site-device").val()
                });
             
               /* if((fields['provider-port'] != '')) {
                    vlic.push({
                        portKey: fields['provider-port'],
                        portName: $("#form-provider-port :selected").html(),
                        vlanPortType: 'ProviderPort',
                        vlanDirection: "CoreEntry",
                        vlanValue: fields['pvlani-value'],
                        deviceName: providerData.deviceName,
                        deviceKey: providerData.deviceKey
                    });

                    vlic.push({
                        portKey: fields['provider-port'],
                        portName: $("#form-provider-port :selected").html(),
                        vlanPortType: 'ProviderPort',
                        vlanDirection: "CoreExit",
                        vlanValue: fields['pvlane-value'],
                        deviceName: providerData.deviceName,
                        deviceKey: providerData.deviceKey
                    });
                }*/

            var tenantId = fields['site-tenant'];
            var o = {
                'displayName': fields['site-name'],
                'deviceKey': fields['site-device'],
                'portKey': fields['customer-port'],
                'tenantKey': tenantId,
                'centralOfficeKey' : fields['site-centraloffice'],
                'vlanInfoCollection' : vlic,
                'physicalDeviceTypeKey' : null,
                'siteBandwidthProfileCollection' : [],
                'networkVlanValue' : fields["nw_vlan_value"]
            };

            osa.ajax.add('sites', o, function() {
                p.hide();

                var tenantBlock = $("#" + tenantId);
                var siteBlockContainer = tenantBlock.find(".siteBlocksForTenant");

                // hide to update then show so it is not jarring
                tenantBlock.find(".siteBlocksForTenant").hide("slow", function() {
                    siteBlockContainer.empty();
                    osa.ajax.list('sites', [tenantId], function(sites) {
                        for (var x=0; x<sites.length; x++) {
                            if (sites[x].tenantKey == tenantId) {
                                renderCardForSite(sites[x]);
                            }
                        }
                        
                        // now add counts
                        var count = siteBlockContainer.children(".list-block").length;
                        tenantBlock.find(".blockCount").html(" (" + count + ")");
                        
                        tenantBlock.find(".siteBlocksForTenant").show("slow");
                    });
                });
            });
        });

        p.$FORM.attr("id", "sitePopup");
        p.show();
        
        $("#form-cvlani-type").change(function() {
            $("#form-cvlani-value").val(""); // clear it out on every change
            
            if ($(this).val() == "Value")
                $("#form-cvlani-value").showRow();
            else
                $("#form-cvlani-value").hideRow();
        });
        
        
        $("#form-pvlani-type").change(function() {
               $("#form-pvlani-value").val(""); // clear it out on every change
            
               if ($(this).val() == "Value")
                $("#form-pvlani-value").showRow();
            else
                $("#form-pvlani-value").hideRow();                
        });
                    
        
    });
});

// This function is called when the delete site button is clicked.
// it will hide all the cards and then rerender the new set and update
// the count.  Just removing them from view and then rerendinerg them was
// too jarring so a jQuery transiton was used.
function deleteSite(ev) {
    var siteId = $(ev.target).data('id');
    var siteBlocksForTenant = $(ev.target).closest(".siteBlocksForTenant");
    var tenantBlock = siteBlocksForTenant.closest(".tenantBlock");
//    var tenantId = tenantBlock.attr("id");

    if (siteId) {
        if (confirm($.i18n._("loc.prmpt.del.site"))) {
            osa.ajax.remove('sites', siteId, function() {
                
                // just remove the one you deleted
                $("#siteBlock" + siteId).hide("slow", function() {
                    this.remove();
                  // now add counts
                  var count = siteBlocksForTenant.children(".list-block").length;
                  tenantBlock.find(".blockCount").html(" (" + count + ")");
                });
            });
        }
    }
}


function showBwWarning(card) {
    card.find(".bwMsgBlock .status").html($.i18n._("stat.warning")).addClass("warningStatus");
    card.find(".bwMsgBlock .needBwWarn").html($.i18n._("loc.msg.warn.need.bw.prof"));
    card.find(".hdrForVNFs .status").html($.i18n._("stat.warning")).addClass("warningStatus");
    
    

    
}
function hideBwWarning(card) {
    card.find(".bwMsgBlock .status").html("").removeClass("warningStatus");
    card.find(".bwMsgBlock .mainWarning").html("");
    card.find(".hdrForVNFs .status").html("").removeClass("warningStatus");
}

function showBwWarning2(card) {
    card.find(".bwMsgBlock2").removeClass("hide");
    card.find(".bwMsgBlock2 .status").html($.i18n._("stat.warning")).addClass("warningStatus");
    card.find(".bwMsgBlock2 .optWarning").html($.i18n._("loc.msg.warn.need.bw.create"));
}

function hideBwWarning2(card) {
    card.find(".bwMsgBlock2").addClass("hide");
    card.find(".bwMsgBlock2 .status").html("").removeClass("warningStatus");
    card.find(".bwMsgBlock2 .optWarning").html("");
}


//};