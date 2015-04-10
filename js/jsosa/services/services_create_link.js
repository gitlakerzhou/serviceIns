//----------------------------------------------------------
// RENDER FORM
//----------------------------------------------------------
function services_create_link_render_form(isForCustomer, hasPhysDev) {

    // POPUP
    var p = osa.ui.formPopup.create($.i18n._("srvc.crtLink"), null, {submitLabel : $.i18n._("srvc.crtLink")});

    // DATA for TYPE used below
    typeSelOpts = getDeviceTypeSel(hasPhysDev);

    // START
    p.$CONTAINER.appendTo('body').hide();
    p.$FORM.attr("id", "servicesCreateLinkForm");

    
    // ---------------------------------------------------
    // SOURCE
    // ---------------------------------------------------
    p.addHeader($.i18n._('source'));

    // INPUT: ENDPOINT TYPE
    p.addField('src-endpoint-type', $.i18n._("srvc.epType"), 'select', typeSelOpts);

    // INPUT: CO for DEVICES
    if (hasPhysDev) 
        p.addField('src-central-office', $.i18n._("srvc.cntrl.offc"), 'select');

    // INPUT: ENDPOINT FOR VNFs
    p.addField('src-endpoint-vnf', $.i18n._("srvc.endpnt"), 'select');
    $("#form-src-endpoint-vnf").addClass("srcEndpoint endpoint");

    // INPUT: ENDPOINT FOR SITES
    p.addField('src-endpoint-site', $.i18n._("srvc.endpnt"), 'select');
    $("#form-src-endpoint-site").addClass("srcEndpoint endpoint");

    // INPUT: ENDPOINT FOR PHYSICAL DEVICES
    if (hasPhysDev) {
        p.addField('src-endpoint-phys', $.i18n._("srvc.endpnt"), 'select');
        $("#form-src-endpoint-phys").addClass("srcEndpoint endpoint");
    }

    // INPUT: PORT
    p.addField('src-port', $.i18n._("srvc.src.prt"), 'select');

    // INPUT: SITE (sometimes optional and sometimes not)
    p.addField('src-site', $.i18n._("srvc.src.site"), 'select');

    
    // ---------------------------------------------------
    // DESTINATION
    // ---------------------------------------------------
    p.addHeader($.i18n._('destination'));

    // INPUT: ENDPOINT TYPE
    p.addField('dst-endpoint-type', $.i18n._("srvc.epType"), 'select', typeSelOpts);

    // INPUT: CO for DEVICES
    if (hasPhysDev)
        p.addField('dst-central-office', $.i18n._("srvc.cntrl.offc"), 'select');

    // INPUT: ENDPOINT FOR VNFs
    p.addField('dst-endpoint-vnf', $.i18n._("srvc.endpnt"), 'select');
    $("#form-dst-endpoint-vnf").addClass("dstEndpoint endpoint");

    // INPUT: ENDPOINT FOR SITES
    p.addField('dst-endpoint-site', $.i18n._("srvc.endpnt"), 'select');
    $("#form-dst-endpoint-site").addClass("dstEndpoint endpoint");

    // INPUT: ENDPOINT FOR PHYSICAL DEVICES
    if (hasPhysDev) {
        p.addField('dst-endpoint-phys', $.i18n._("srvc.endpnt"), 'select');
        $("#form-dst-endpoint-phys").addClass("dstEndpoint endpoint");
    }

    // INPUT: PORT
    p.addField('dst-port', $.i18n._("srvc.src.prt"), 'select');

    // INPUT: SITE (sometimes optional and sometimes not)
    p.addField('dst-site', $.i18n._("srvc.src.site"), 'select');

    // ---------------------------------------------------
    // NETWORK INTERCONNECTIONS
    // ---------------------------------------------------
    var msgNoEditData = "<div class='form-input-block msgInfo hide nwInterCncts' id='srcv_msg_nw_ips_exist_no_edit'>" + $.i18n._("srvc.msg.addr.no.edit") + "</div><div id='uneditableLinkData'></div>";
    var msgHaveData = "<div class='form-input-block msgInfo noEditSwitch hide nwInterCncts' id='srcv_msg_nw_ips_exist'>" + $.i18n._("srvc.msg.addr.edit") + "</div>";
    var specialInpt = "<div class='form-input-block hide  nwInterCncts'><label for='form-nw-interconnect-subnet-range'>" + $.i18n._("srvc.ni.dhcp.rng") + "</label><div id='form-nw-interconnect-subnet-range' class='rangeContainer'><div id='crtSrvcLnkRng0' class='crtSrvcRng'><input class='miniIP min'></input> - <input class='miniIP max'></input></div></div></div>";
    
    p.addHeader($.i18n._("ttl.NWIntercon"), "srcv_crt_hdr_nw_int", "mainSelVNF hide  nwInterCncts");
    p.$FIELDSET.append(msgNoEditData);    
    p.$FIELDSET.append(msgHaveData);
    
    // CHECKBOX 1
    p.addField('nw-interconnect-is-explicit',  $.i18n._("srvc.ni.exp.cidr"), 'checkbox', false, null, "mainSelVNF");
    p.addField('nw-interconnect-subnet-cidr', $.i18n._("srvc.ni.sub.cidr"), 'input', "", false, "hide nwInterCncts cidrSpWd");
    p.addField('nw-interconnect-subnet-cidr-slash', "/", 'input', "", false, "hide nwInterCncts cidrSlshSpWd");

    p.$FIELDSET.append(specialInpt);

    // CHECKBOX 2
    p.addField('nw-interconnect-ext_router', $.i18n._("srvc.cnct.ext.rtr"), 'checkbox', false, null, "mainSelVNF");
    p.addField('nw-interconnect-via-dhcp', $.i18n._("srvc.via"), 'radio', {prettyStr :$.i18n._("srvc.sys.sel"), valStr : 'dhcp', selected : true}, false, "nwInterCncts");
    p.addField('nw-interconnect-via-static', '&nbsp;', 'radio', {prettyStr : $.i18n._("srvc.stc.addr"), valStr : 'static', selected : false}, false, "nwInterCncts");
    p.addField('nw-interconnect-static-ip', '&nbsp;', 'input', "", false, "hide nwInterCncts");
    
    // ---------------------------------------------------
    // ENDPOINTS
    // ---------------------------------------------------
    p.addHeader($.i18n._("ttl.vnf.eps"));
    
    p.$FIELDSET.append("<div id='srcPoint' class='srcPoint'><div id='srcEpName' class='epDevice'>" + $.i18n._("source") + "</div></div>");
    p.$FIELDSET.append("<div id='dstPoint' class='dstPoint'><div id='dstEpName' class='epDevice'>" + $.i18n._("destination") + "</div></div>");
    
    var srcPntCont = $("#srcPoint");
    srcPntCont.addRadio("ep-src-dhcp", "srvc.port.ip", "srvc.dhcp.gen", "ep-srvc-rset1", "dhcp", true);
    srcPntCont.addRadio("ep-src-static", '&nbsp;',  "srvc.stc.addr", "ep-srvc-rset1", 'static', false);
    srcPntCont.addTextInput("ep-src-static-ip", "srvc.stc.addr", false);
    srcPntCont.addCheckbox('ep-src-has-floating-ip', "srvc.float.ip", false);
    srcPntCont.addSelect("src_bw_to", "srvc.ep.ingress", true, false);
    srcPntCont.addSelect("src_bw_from", "srvc.ep.egress", true, false);
    
    var dstPntCont = $("#dstPoint");
    dstPntCont.addRadio("ep-dst-dhcp", "srvc.port.ip", "srvc.dhcp.gen", "ep-srvc-rset2", "dhcp", true);
    dstPntCont.addRadio("ep-dst-static", '&nbsp;',  "srvc.stc.addr", "ep-srvc-rset2", 'static', false);
    dstPntCont.addTextInput("ep-dst-static-ip", "srvc.stc.addr", false);
    dstPntCont.addCheckbox('ep-dst-has-floating-ip', "srvc.float.ip", false);
    dstPntCont.addSelect("dst_bw_to", "srvc.ep.ingress", true, false);
    dstPntCont.addSelect("dst_bw_from", "srvc.ep.egress", true, false);
    
    srcPntCont.find(".form-input-block").addClass("hide");
    dstPntCont.find(".form-input-block").addClass("hide");
    
    $("#src_bw_to").parent().addClass("bandwidth");
    $("#src_bw_from").parent().addClass("bandwidth");
    $("#dst_bw_to").parent().addClass("bandwidth");
    $("#dst_bw_from").parent().addClass("bandwidth");
    
    // ---------------------------------------------------
    // SHOW AND HIDE
    // ---------------------------------------------------
    p.hideField("src-central-office");
    p.hideField("src-endpoint-vnf");
    p.hideField("src-endpoint-site");
    p.hideField("src-endpoint-phys");
    p.hideField('src-port');
    p.hideField('src-site');

    p.hideField("dst-central-office");
    p.hideField("dst-endpoint-vnf");
    p.hideField("dst-endpoint-site");
    p.hideField("dst-endpoint-phys");
    p.hideField('dst-port');
    p.hideField('dst-site');
    
    p.hideField('nw-interconnect-is-explicit');
    p.hideField('nw-interconnect-ext_router');


    // TODO: when I convert this over to the new add input functions, I will not need
    // this step
    $("#nw-interconnect-via-dhcp").parent().addClass("hide");
    $("#nw-interconnect-via-static").parent().addClass("hide");
    $("#form-src-endpoint-type").addRequired();
    $("#form-src-endpoint-vnf").addRequired();
    $("#form-src-endpoint-site").addRequired();
    $("#form-src-endpoint-phys").addRequired();
    $("#form-src-central-office").addRequired();
    $("#form-src-port").addRequired();
    $("#ep-src-static-ip").addRequired();
    $("#form-dst-endpoint-type").addRequired();
    $("#form-dst-endpoint-vnf").addRequired();
    $("#form-dst-endpoint-site").addRequired();
    $("#form-dst-endpoint-phys").addRequired();
    $("#form-dst-central-office").addRequired();
    $("#form-dst-port").addRequired();
    $("#ep-dst-static-ip").addRequired();
    $("#form-nw-interconnect-static-ip").addRequired();
    
    // this is required sometimes
    if (isForCustomer) {
         $("#form-src-site").addRequired();
         $("#form-dst-site").addRequired();
         $("#src_bw_to").addRequired();
         $("#src_bw_from").addRequired();
         $("#dst_bw_to").addRequired();
         $("#dst_bw_from").addRequired();
    }

    // VALIDATION
    $("#servicesCreateLinkForm").validate({
         rules : {
              "form-src-endpoint-type" : {
                    required : "#form-src-endpoint-type:visible",
              },
              "form-src-endpoint-vnf" : {
                    required : "#form-src-endpoint-vnf:visible",
                    notEqualTo: "#form-dst-endpoint-vnf:visible",
              },
              "form-src-endpoint-site" : {
                    required : "#form-src-endpoint-site:visible",
                    notEqualTo: "#form-dst-endpoint-site:visible",
              },
              "form-src-endpoint-phys" : {
                    required : "#form-src-endpoint-phys:visible",
              },
              "form-src-central-office" : {
                    required : "#form-src-central-office:visible",
              },
              "form-src-port" : {
                    required : "#form-src-port:visible",
              },
              "form-src-site" : {
                    required: "#form-src-site:visible" && isForCustomer,
              },
              "form-dst-endpoint-type" : {
                    required : "#form-dst-endpoint-type:visible",
              },
              "form-dst-endpoint-vnf" : {
                    required : "#form-dst-endpoint-vnf:visible",
                    notEqualTo: "#form-src-endpoint-vnf:visible",
              },
              "form-dst-endpoint-site" : {
                    required : "#form-dst-endpoint-site:visible",
                    notEqualTo: "#form-src-endpoint-site:visible",
              },
              "form-dst-endpoint-phys" : {
                    required : "#form-dst-endpoint-phys:visible",
              },
              "form-dst-central-office" : {
                    required : "#form-dst-central-office:visible",
              },
              "form-dst-port" : {
                    required : "#form-dst-port:visible",
              },
              "form-dst-site" : {
                    required: "#form-dst-site:visible" && isForCustomer,
              },
              "form-nw-interconnect-subnet-cidr" : {
                    ip: true,
              },
              "form-nw-interconnect-subnet-cidr-slash" : {
                  number: true,
                  min: 2,
                  max: 30,
                  required: function(element){
                      return $("#form-nw-interconnect-subnet-cidr").val().length > 0;
                  },
              },
              "ep-src-static-ip" : {
                    required : "#ep-src-static-ip:visible",
                    ip: true,
                    outsideIpRange: ".crtSrvcRng .max",
                    notEqualTo: "#form-nw-interconnect-static-ip:visible",
                    notEqualToEither: "#ep-dst-static-ip:visible",
              },
              "ep-dst-static-ip" : {
                    required : "#ep-dst-static-ip:visible",
                    ip: true,
                    outsideIpRange: ".crtSrvcRng .max",
                    notEqualTo: "#form-nw-interconnect-static-ip:visible",
                    notEqualToEither: "#ep-src-static-ip:visible",
              },
              "form-nw-interconnect-static-ip" : {
                    required : "#form-nw-interconnect-static-ip:visible",
                    ip: true,
                    outsideIpRange: ".crtSrvcRng .max",
              },
              "src_bw_to" : {
                    required : "#src_bw_to:visible" && isForCustomer,
              },
              "src_bw_from" : {
                    required : "#src_bw_from:visible" && isForCustomer,
              },
              "dst_bw_to" : {
                    required : "#dst_bw_to:visible" && isForCustomer,
              },
              "dst_bw_from" : {
                    required : "#dst_bw_from:visible" && isForCustomer,
              }
         },
         errorPlacement : function(error, element) {
              error.appendTo(element.parent());
         } ,
          messages: {
                "form-src-endpoint-vnf" : {
                        notEqualTo: $.i18n._("srvc.vld.src.dst.eq"),
                },
                "form-dst-endpoint-vnf" : {
                        notEqualTo: $.i18n._("srvc.vld.src.dst.eq"),
                },         
                "form-src-endpoint-site" : {
                    notEqualTo: $.i18n._("srvc.vld.src.dst.eq"),
                },
                "form-dst-endpoint-site" : {
                    notEqualTo: $.i18n._("srvc.vld.src.dst.eq"),
                },                
                "ep-dst-static-ip" : {
                    notEqualTo: $.i18n._("srvc.vld.equal.to.gw"),
                    notEqualToEither: $.i18n._("srvc.vld.equal.other"),
                },
                "ep-src-static-ip" : {
                    notEqualTo: $.i18n._("srvc.vld.equal.to.gw"),
                    notEqualToEither: $.i18n._("srvc.vld.equal.other"),
                    
                },
                "form-nw-interconnect-subnet-cidr-slash" : {
                    required: $.i18n._("err.msg.required"),
                    number: $.i18n._("err.msg.number"),
                    min: $.format("Value greater than or equal to {0}"),
                    max: $.format("Value less than or equal to {0}")
                }
          },
    });
};

// ----------------------------------------------------------
// POPULATE FORM WITH DATA
// ----------------------------------------------------------
function services_create_link_populate_data(tenantId, hasPhysDev, linkBox) {
    var form = $("#servicesCreateLinkForm");

    // --------------------------
    // VNFs
    // --------------------------
    var srcDevType = $("#form-src-endpoint-vnf");
    var dstDevType = $("#form-dst-endpoint-vnf");
    var vnfs = $(".service-device-block .dev-title");

    for (var v = 0; v < vnfs.length; v++) {
         srcDevType.append("<option value='" + $(vnfs[v]).html() + "'>" + $(vnfs[v]).html() + "</option>");
    };

    dstDevType.empty().append(srcDevType.find("option").clone());

    // --------------------------
    // Sites
    // --------------------------
    var srcDevSite = $("#form-src-endpoint-site");
    var dstDevSite = $("#form-dst-endpoint-site");
    
    var linksBox = $("#service_links_container");
    var siteList = linksBox.data("SiteInstanceObjs");
    var sitesUsed = linksBox.data("sitesUsed");
    
    srcDevSite.prepSel(true, false);
    dstDevSite.prepSel(true, false);
    
    if (siteList !== undefined) {
        for (var i = 0; i < siteList.length; i++) {
            if (sitesUsed !== undefined && sitesUsed[siteList[i].key] !== undefined)
                srcDevSite.append("<option value='" + siteList[i].key + "' disabled='disabled'>" + siteList[i].displayName + "</option>");
            else
                srcDevSite.append("<option value='" + siteList[i].key + "'>" + siteList[i].displayName + "</option>");
        }
        
        dstDevSite.empty().append(srcDevSite.find("option").clone());
    }
}


// ----------------------------------------------------------
// EVENTS
// ----------------------------------------------------------
function services_create_link_events(tenantId, linkBox) {

    // --------------------------
    // ENDPOINT TYPE
    // --------------------------
    $("#form-src-endpoint-type").change(function() {
        var needsCOs = osa.auth.getPageAccess('physicalDevices').read;
           
        
        $(this).setTypeChangeEvent("src");
        
        if (needsCOs) { // only on physical devices.
            manageCoInput("src");
        }
        

         
        manageEpForNonVNF("src", $.i18n._("source"));
        leaveOrHideVnfInpts();
        leaveOrHideBwInpts();
    });

    $("#form-dst-endpoint-type").change(function() {
        var needsCOs = osa.auth.getPageAccess('physicalDevices').read;
        
        $(this).setTypeChangeEvent("dst");
        
        if (needsCOs) { // only on physical devices.
            manageCoInput("dst");
        }
 
        manageEpForNonVNF("dst", $.i18n._("source"));
        leaveOrHideVnfInpts();
        leaveOrHideBwInpts();
    });

    // ---------------------------
    // CENTRAL OFFICE
    // --------------------------
    $("#form-src-central-office").change(function() {
        getCoEndpoint("src", tenantId);    
    });

    $("#form-dst-central-office").change(function() {
        getCoEndpoint("dst", tenantId);        
    });

    // --------------------------
    // ENDPOINT VNF
    // --------------------------
    $("#form-src-endpoint-vnf").change(function() {
         // manage queue to determine flush or keep of interconnection data
         var selected = $(this).find("option:selected").html();
         var typeSel = $("#form-src-endpoint-type");

         typeSel.data("wasSel", typeSel.data("curSel"));
         typeSel.data("curSel", selected);
         
         if (hasIntCnctDefined()) {
              typeSel.data("intrCnctDefFor", typeSel.data("wasSel"));
         }
         
         showPortsForVNF("src", this);
         manageInnrCnctForVNF("src", selected, linkBox);
         manageEpForVNF("src", selected, linkBox);
         
         $("#form-dst-endpoint-vnf").valid();
         $("#form-src-endpoint-vnf").valid();
         
    });
    
    $("#form-dst-endpoint-vnf").change(function() {
         // manage queue to determine flush or keep of interconnection data
         var selected = $(this).find("option:selected").html();
         var typeSel = $("#form-dst-endpoint-type");

         typeSel.data("wasSel", typeSel.data("curSel"));
         typeSel.data("curSel", selected);
         
         if (hasIntCnctDefined()) {
              typeSel.data("intrCnctDefFor", typeSel.data("wasSel"));
         }              
         
         showPortsForVNF("dst", this);
         manageInnrCnctForVNF("dst", $(this).find("option:selected").html(), linkBox);
         manageEpForVNF("dst", $(this).find("option:selected").html(), linkBox);    
         
         $("#form-src-endpoint-vnf").valid();
         $("#form-dst-endpoint-vnf").valid();
    });

    // --------------------------
    // ENDPOINT SITES
    // --------------------------
    $("#form-src-endpoint-site").change(function() {
         setSiteMetadata("src");
         $("#srcEpName").html($(this).find("option:selected").html());
         manageEpForNonVNF("src", $(this).find("option:selected").html());
         
         // BANDWIDTH
         osa.ajax.get("customBandwidthProfilesSite", $(this).val(), function(data) {
             populateBandwidthProfiles("src", data);
         });

         $("#form-dst-endpoint-site").valid();
         $("#form-src-endpoint-site").valid();
    });
    
    $("#form-dst-endpoint-site").change(function() {
         setSiteMetadata("dst");
         $("#dstEpName").html($(this).find("option:selected").html());
         manageEpForNonVNF("dst", $(this).find("option:selected").html());

         // BANDWIDTH
         osa.ajax.get("customBandwidthProfilesSite", $(this).val(), function(data) {
             populateBandwidthProfiles("dst", data);
         });
         
         $("#form-src-endpoint-site").valid();
         $("#form-dst-endpoint-site").valid();
    });

    // --------------------------
    // ENDPOINT DEVICES
    // --------------------------
    $("#form-src-endpoint-phys").change(function() {
         showPortsForPhys("src", $(this).val());
         $("#srcEpName").html($(this).find("option:selected").html());
         manageEpForNonVNF("src", $(this).find("option:selected").html());
         
         // in case of edit
         if ($("#servicesCreateLinkForm").data("isEdit") && $("#form-src-endpoint-type").val() == "physical") {
             var linkData = $("#servicesCreateLinkForm").data("linkData");
             var portList = linkData["src-metadata"].portCollection;
             
             for (var i=0; i<portList.length; i++) {
                 if (portList[i].displayName == linkData["src-port"]) {
                     $("#form-src-port").val(portList[i].key);
                     $("#form-src-port").trigger("change");
                     break;
                 }
             }
         }
    });
    $("#form-dst-endpoint-phys").change(function() {
         showPortsForPhys("dst", $(this).val());
         $("#dstEpName").html($(this).find("option:selected").html());
         manageEpForNonVNF("dst", $(this).find("option:selected").html());
         
         // in case of edit
         if ($("#servicesCreateLinkForm").data("isEdit") && $("#form-dst-endpoint-type").val() == "physical") {
             var linkData = $("#servicesCreateLinkForm").data("linkData");
             var portList = linkData["dst-metadata"].portCollection;
             
             for (var i=0; i<portList.length; i++) {
                 if (portList[i].displayName == linkData["dst-port"]) {
                     $("#form-dst-port").val(portList[i].key);
                     $("#form-dst-port option[value='" + portList[i].key + "']").removeAttr("disabled"); // let the one you have now be enabled so we can pick up the value later.
                     $("#form-dst-port").trigger("change");
                     break;
                 }
             }
         }
    });   

    // --------------------------
    // Ports for Physical Device
    // --------------------------
    $("#form-src-port").change(function() {
         if ($("#servicesCreateLinkForm").data("isEdit") && $("#form-src-endpoint-type").val() == "physical") {// edit mode
             showSitesForPort("src", $("#servicesCreateLinkForm").data("linkData").src_site_id);
         } 
         else { 
             showSitesForPort("src");
         }
         
    });
    $("#form-dst-port").change(function() {
        if ($("#servicesCreateLinkForm").data("isEdit") && $("#form-dst-endpoint-type").val() == "physical") {// edit mode
            showSitesForPort("dst", $("#servicesCreateLinkForm").data("linkData").dst_site_id);
        } 
        else { 
            showSitesForPort("dst");
        }
    });
    
    // --------------------------
    // Ports for Physical Device
    // --------------------------
    $("#form-src-site").change(function() {
        if ($("#form-src-site").val() !== "") {
            // BANDWIDTH
            osa.ajax.get("customBandwidthProfilesSite", $(this).val(), function(data) {
                    populateBandwidthProfiles("src", data);
            });
        }
            
        else 
            hideBwInputs("src");
    });
   

    $("#form-dst-site").change(function() {
        if ($("#form-src-site").val() !== "") {
            // BANDWIDTH
            osa.ajax.get("customBandwidthProfilesSite", $(this).val(), function(data) {
                    populateBandwidthProfiles("dst", data);
            });
        }
        else
            hideBwInputs("dst");
    }); 
    
    // --------------------------
    // New Inputs
    // --------------------------
    $("#form-nw-interconnect-is-explicit").change(function() {
         var CIDR = $("#form-nw-interconnect-subnet-cidr");
         var slash = $("#form-nw-interconnect-subnet-cidr-slash");
         var ranges = $("#form-nw-interconnect-subnet-range");
         
         // clear subform
         CIDR.val("");
         slash.val("");
         $("#form-nw-interconnect-subnet-range input").val("");

         // show or hide
         if ($(this).is(":checked")) {
            CIDR.showRow();
            ranges.showRow();
            slash.showRow();
         } else {
            CIDR.hideRow();
            ranges.hideRow();
            slash.hideRow();
            CIDR.trigger("change");
         }
    });
    
    $("#form-nw-interconnect-subnet-cidr").change(function() {
         var hasValue = ($("#form-nw-interconnect-subnet-cidr").val() !== "");
         var valSrc = $("#form-src-endpoint-type").val();
         var valDst = $("#form-dst-endpoint-type").val();
         srcvsCrtShowExtRtrPick();
         
         if (!hasValue) {
              $("#ep-src-dhcp").trigger("click");
              $("#ep-dst-dhcp").trigger("click");         
              $("#srcEpName").siblings().not(".bandwidth").addClass("hide");
              $("#dstEpName").siblings().not(".bandwidth").addClass("hide");
         }
         else {
              // SRC
              if (hasValue && valSrc == "virtual") {
                    manageEpForVNF("src", $("#form-src-endpoint-vnf").find("option:selected").html(), linkBox);
              }
              else {
                    var val = "";
                    if ($("#form-src-endpoint-site").is(":visible")) val = $("#form-src-endpoint-site option:selected").html();
                    else val = $("#form-src-endpoint-phys option:selected").html();
                    manageEpForNonVNF("src", val);
              }         
              // DST
              if (hasValue && valDst == "virtual") {
                    manageEpForVNF("dst", $("#form-dst-endpoint-vnf").find("option:selected").html(), linkBox);
              }
              else {
                    var val = "";
                    if ($("#form-dst-endpoint-site").is(":visible")) val = $("#form-dst-endpoint-site option:selected").html();
                    else val = $("#form-dst-endpoint-phys option:selected").html();
                    manageEpForNonVNF("dst", val);
              }              
         }
    });    
    
    // Show radio buttons if not already shown
    var srcvsCrtShowExtRtrPick = function() {
         var rtrChk = $("#form-nw-interconnect-ext_router");
         if (rtrChk.is(":checked")) {
              rtrChk.trigger("change");
         }
    };


    $("#form-nw-interconnect-ext_router").change(function() {
         var inptExplctChk = $("#form-nw-interconnect-is-explicit");
         var inptCIDR = $("#form-nw-interconnect-subnet-cidr");
         var radioDhcp = $("#nw-interconnect-via-dhcp");
         var radioStatic = $("#nw-interconnect-via-static");
         var valSrc = $("#form-src-endpoint-type").val();
         var valDst = $("#form-dst-endpoint-type").val(); 
         var srcFloatingIp = $("#ep-src-has-floating-ip");
         var dstFloatingIp = $("#ep-dst-has-floating-ip");         
         var srcFloatingIpRow = $("#row_ep-src-has-floating-ip");
         var dstFloatingIpRow = $("#row_ep-dst-has-floating-ip");
         var val1 = $("#form-src-endpoint-vnf option:selected").html();
         var isSwitchSrc = $("#so-device--" + val1).data("isSwitch");
         var val2 = $("#form-dst-endpoint-vnf option:selected").html();
         var isSwitchDst = $("#so-device--" + val2).data("isSwitch");

         if ($(this).is(":checked")) {
              if (inptExplctChk.is(":checked") && inptCIDR.val().length > 0) {
                    radioDhcp.parent().removeClass("hide");
                    radioStatic.parent().removeClass("hide");
                    radioDhcp.prop("checked", "checked");
              }
              else { // likely the user just deleted the ip
                    radioDhcp.prop("checked", "checked");    
                    radioDhcp.trigger("change");
                    radioDhcp.parent().addClass("hide");
                    radioStatic.parent().addClass("hide");
                    
                   
              }
              
              if (valSrc == "virtual" && !isSwitchSrc) {
                    srcFloatingIpRow.removeClass("hide");
              }
              
              
              if (valDst == "virtual" && !isSwitchDst) {
                    dstFloatingIpRow.removeClass("hide");
              }
              
              
         } else {
              radioDhcp.parent().addClass("hide");
              radioStatic.parent().addClass("hide");
              radioDhcp.prop("checked", "checked");
              radioDhcp.trigger("change");
              srcFloatingIpRow.addClass("hide");
              dstFloatingIpRow.addClass("hide");
              srcFloatingIp.removeAttr("checked");
              dstFloatingIp.removeAttr("checked");
         }
    });
    
    // validation clean up.
    $("#form-nw-interconnect-static-ip").change(function() {
         $('#ep-src-static-ip').valid();
         $('#ep-dst-static-ip').valid();
    });
    
    $("#nw-interconnect-via-static").change(function() {
         var ip = $("#form-nw-interconnect-static-ip");
         var ipRow = ip.parent();
         
         if ($(this).is(":checked")) {
              ipRow.removeClass("hide");
         } else {
              ip.val("");
              ipRow.addClass("hide");              
         }
    });
    
    $("#nw-interconnect-via-dhcp").change(function() {
         var ip = $("#form-nw-interconnect-static-ip");
         var ipRow = ip.parent();
         
         if ($(this).is(":checked")) {
              ipRow.addClass("hide");    
              ip.val("");
         } else {
              ipRow.removeClass("hide");
         }
    });
    
    
    // IP for Static Port
    $("#ep-src-static").change(function() {
         var statIp = $("#ep-src-static-ip");
         var statIpRow = $("#row_ep-src-static-ip");
         
         if ($(this).is(":checked")) {
              statIpRow.removeClass("hide");
         }
         else {
              statIp.val("");
              statIpRow.addClass("hide");
         }
    });
    
    $("#ep-src-dhcp").change(function() {
         var statIp = $("#ep-src-static-ip");
         var statIpRow = $("#row_ep-src-static-ip");
         
         if ($(this).is(":checked")) {
              statIp.val("");
              statIpRow.addClass("hide");
         }
         else {
              statIpRow.removeClass("hide");

         }
    });
    
    $("#ep-dst-static").change(function() {
         var statIp = $("#ep-dst-static-ip");
         var statIpRow = $("#row_ep-dst-static-ip");
         
         if ($(this).is(":checked")) {
              statIpRow.removeClass("hide");
         }
         else {
              statIp.val("");
              statIpRow.addClass("hide");
         }
    });
    
    $("#ep-dst-dhcp").change(function() {
         var statIp = $("#ep-dst-static-ip");
         var statIpRow = $("#row_ep-dst-static-ip");
         
         if ($(this).is(":checked")) {
              statIp.val("");
              statIpRow.addClass("hide");
         }
         else {
              statIpRow.removeClass("hide");

         }
    });    
    
    $("#ep-src-static-ip").change(function() {
         $("#ep-dst-static-ip").valid();
         $("#ep-src-static-ip").valid();
    });
    $("#ep-dst-static-ip").change(function() {
         $("#ep-src-static-ip").valid();
         $("#ep-dst-static-ip").valid();
    });    
}

// ------------------------------------------
// MANAGE INTERACTION FOR LOWER FORM
// ------------------------------------------

// Use this when the user had a VNF but then changed it to something else.
// At the time of selecting the type, do not show the special inputs.
// Show the special inputs when the user picks the switch or other type
// so that we can hamper inputs that are not appropriate for a switch.

function leaveOrHideVnfInpts() {
    var srcVnf = $("#form-src-endpoint-type").val() == "virtual";
    var dstVnf = $("#form-dst-endpoint-type").val() == "virtual";
    var valSrc = $("#form-src-endpoint-vnf option:selected").html();
    var isSwitchSrc = $("#so-device--" + valSrc).data("isSwitch") || false;
    var valDst = $("#form-dst-endpoint-vnf option:selected").html();
    var isSwitchDst = $("#so-device--" + valDst).data("isSwitch") || false;
    
    // if neither are virtual, make sure all is hidden and clean
    if (!srcVnf && !dstVnf) {
         uncheckAndReset();
         $("#form-nw-interconnect-ext_router").removeAttr("checked");
         $(".mainSelVNF").addClass("hide");
    }
    
    if (isSwitchSrc) {
         $("#srcEpName").siblings().addClass("hide");
         $("#ep-src-has-floating-ip").removeAttr("checked");
         $("#ep-src-dhcp").trigger("click");
    }
    
    if (isSwitchDst) {
         $("#dstEpName").siblings().addClass("hide");
         $("#ep-dst-has-floating-ip").removeAttr("checked");
         $("#ep-dst-dhcp").trigger("click");
    }    
}

function leaveOrHideBwInpts() {
    var srcVnf = $("#form-src-endpoint-type").val() == "virtual";
    var dstVnf = $("#form-dst-endpoint-type").val() == "virtual";
    
    if (srcVnf) {
         var srcInpts = $("#srcPoint .bandwidth");
         srcInpts.find("select").val("");
         srcInpts.addClass("hide");
    }
    
    if (dstVnf) {
         var dstInpts = $("#dstPoint .bandwidth");
         dstInpts.find("select").val("");
         dstInpts.addClass("hide");
    }    
}

function showBwInputs(loc, val) {
    $("#" + loc + "Point .bandwidth").removeClass("hide");
    
    if (val !== undefined) {
        $("#" + loc + "Point .bandwidth select").val(val);
    }
}

function hideBwInputs(loc) {
    $("#" + loc + "Point .bandwidth").addClass("hide");
    $("#" + loc + "Point .bandwidth select").val("");
}

function manageInnrCnctForVNF(loc, val, linkBox) {
    var form = $("#servicesCreateLinkForm");
//    var mainForm = linkBox.data("mainForm");
    var isSwitchIpEditable = linkBox.data("areIPsEditable");
    var isCheckAlreadyExposed = $("#form-nw-interconnect-is-explicit").is(":visible");
    var isSwitch = $("#so-device--" + val.split(" ").join("-")).data("isSwitch");
    var hasSwitch = false; 

    
    // --------------------------------------------------
    // Show and Hide inputs
    // --------------------------------------------------
    //    determine if you have a VNF that is NOT a switch because it cannot have a floating IP
    
    if (loc == "src" && isSwitch || (form.data("dstVNF") && form.data("dstVNF").isSwitch)) {
         hasSwitch = true;
    }
    
    if (loc == "dst" && isSwitch || (form.data("srcVNF") && form.data("srcVNF").isSwitch)) {
         hasSwitch = true;
    }
    
    // IF IS SWITCH JUST GET THE DATA AND CALL IT A DAY
    if (isSwitch) {
         uncheckAndReset();
         if (isSwitchIpEditable) {
              showSwitchIPsEditable(val, linkBox);
         }
         else {
              showSwitchIPsNonEditable(val, linkBox);
         }
    }
    
    // IF THIS IS A VNF BUT YOU ALSO HAVE A SWITCH...
    else {
         if (hasSwitch) {

              // IF THERE IS A SWITCH AND THE IPS ARE NOT EDITABLE
              if (hasSwitch && !isSwitchIpEditable) {
                    return; //  the data is already shown - do not touch!
              }
              
              
              // IF THERE IS A SWITCH AND THE IPS ARE EDITABLE BUT THERE IS ALREADY DATA FILLED IN
              if (hasSwitch && isSwitchIpEditable && isCheckAlreadyExposed) {
                    return; // do not change the inputs
              }
              
              
              // IF THERE IS A SWITCH AND THE IPS ARE EDITABLE BUT THERE IS FORM TO INPUT DATA
              if (hasSwitch && isSwitchIpEditable && !isCheckAlreadyExposed) {
                    uncheckAndReset();
                    $(".noEditSwitch").addClass("hide");
                    $(".mainSelVNF").removeClass("hide");
                    $("#srcv_msg_nw_ips_exist_no_edit").addClass("hide");
                    $("#srcv_msg_nw_ips_exist").addClass("hide");
              }    
         }
              
              
         // VNF EXISTS BUT NO SWITCH
         else {
             if ($("#servicesCreateLinkForm").data("isEdit")) {
                 showSwitchIPsEditable(val, linkBox);
             }
             else {
                 var srcData = $("#form-src-endpoint-type").data();
                 var dstData = $("#form-dst-endpoint-type").data();         
                 var intrCnctDefForSrc = srcData.intrCnctDefFor;
                 var intrCnctDefForDst = dstData.intrCnctDefFor;
                 var wasSrc = $("#form-src-endpoint-type").data("wasSel");
                 var wasDst = $("#form-dst-endpoint-type").data("wasSel");
                 

                 
                 if (loc == "src") {
                       if ((wasSrc !== undefined) && (wasSrc == intrCnctDefForSrc)) {
                           uncheckAndReset(); // I changed a second VNF after a set already had a nw interconnect, so flush
                       }
                 }
                 
                 
                 if (loc == "dst") {
                       if ((wasDst !== undefined) && (wasDst == intrCnctDefForDst)) {
                           uncheckAndReset(); // I changed a second VNF after a set already had a nw interconnect, so flush
                       }
                 }              
                 
                 $(".noEditSwitch").addClass("hide");
                 $(".mainSelVNF").removeClass("hide");
                 $("#srcv_msg_nw_ips_exist_no_edit").addClass("hide");
                 $("#srcv_msg_nw_ips_exist").addClass("hide"); 
             }
             
         }         
    }
};

function manageEpForVNF(loc, val, linkBox) {
    var floatingIp = $("#ep-" + loc + "-has-floating-ip");
    var floatingIpRow = $("#row_ep-" + loc + "-has-floating-ip");
    var isSwitchIpEditable = linkBox.data("areIPsEditable");
    var dhcp = $("#ep-" + loc + "-dhcp"); // ep-src-dhcp
    var dhcpRow = dhcp.parent();
    var staticRow = $("#row_ep-" + loc + "-static");
    var subnetCidr = $("#form-nw-interconnect-subnet-cidr");
    var cnctExtRtr = $("#form-nw-interconnect-ext_router");
    var isSwitch = $("#so-device--" + val.split(" ").join("-")).data("isSwitch") || false;
    
    // --------------------------------------------------
    // Draw pretty picture near bottom of form
    // --------------------------------------------------
    if (val == "" && loc=="src") val = $.i18n._("source");
    if (val == "" && loc=="dst") val = $.i18n._("destination");
    $("#" + loc + "EpName").html(val);
    
    // ---------------------------------------------
    // IS SWITCH
    // ---------------------------------------------
    if (isSwitch) {
         // show nothing on the bottom
         floatingIpRow.addClass("hide");
         floatingIp.removeAttr("checked");
         dhcpRow.addClass("hide");
         staticRow.addClass("hide");    
         dhcp.trigger("click");         
    }
    
    // ---------------------------------------------
    // MANAGE ENDPOINT DATA BELOW
    // ---------------------------------------------
    else { // NOT a Switch
         var subCidrVal = subnetCidr.val();
         var hasExtRtr = cnctExtRtr.prop("checked");
         
         if (!isSwitchIpEditable) {
              var data = $("#uneditableLinkData").data("nwData");
              if (data !== undefined && data.length > 0) {
                    subCidrVal = data.subnetCIDR;
                    hasExtRtr = data.isConnectExtRtr;
              }
         }

         // has no inputs
         if (subCidrVal == "") {
              dhcpRow.addClass("hide");
              staticRow.addClass("hide");    
              dhcp.trigger("click");              
         }
         
         // has input so leave it alone
         else {
              dhcpRow.removeClass("hide");
              staticRow.removeClass("hide");
         }
         
         if (hasExtRtr) {
              floatingIpRow.removeClass("hide");
         }              
         

    }
};

function uncheckAndReset() {
    var check1 = $("#form-nw-interconnect-is-explicit");
    var check2 = $("#form-nw-interconnect-ext_router");    
    
    check1.removeAttr("checked");
    check1.trigger("change");
    check2.removeAttr("checked");
    check2.trigger("change");    
}

function manageEpForNonVNF(loc, val) {
    if (val == "" && loc=="src") val = $.i18n._("source");
    if (val == "" && loc=="dst") val = $.i18n._("destination");    
    $("#" + loc + "EpName").html(val);
    if ($("#form-nw-interconnect-subnet-cidr").val() !== "") {
         $("#row_ep-" + loc + "-dhcp").addClass("hide");
         $("#row_ep-" + loc + "-static").addClass("hide");
    }
};

function manageCoInput(loc) {
    var coList = $("#service_links_container").data("COs");
    var centOffice = $("#form-" + loc + "-central-office");
    
    centOffice.empty();
    centOffice.append("<option value=''></option>");

        
    for (var i = 0; i < coList.length; i++) {
        centOffice.append("<option value='" + coList[i].key + "'>" + coList[i].displayName + "</option>");
    }
    
    if ($("#servicesCreateLinkForm").data("isEdit") && $("#form-" + loc + "-endpoint-type").val() == "physical") {
        var val = $("#servicesCreateLinkForm").data("linkData")[loc + "CentOfcId"];
        centOffice.val(val);
        if (val !== "") centOffice.trigger("change");
    }

};

function setSiteMetadata(loc) {
    var inpt = $("#form-" + loc + "-endpoint-site");
    var siteObjs = $("#service_links_container").data("SiteInstanceObjs");
    var val = inpt.val();

    // populate ports
    for (var i = 0; i < siteObjs.length; i++) {
         if (siteObjs[i].key == parseInt(val)) {
             $("#servicesCreateLinkForm").data(loc + "Site", siteObjs[i]);
              break;
         }
    }
};

function showPortsForPhys(loc, selPhysDevId) {
    var portSel = $("#form-" + loc + "-port");
    var form = portSel.closest("form");
    var allPhysDevs = form.data(loc + "PhysDevObjs");

    // prepare port input
    portSel.prepSel(true);

    // find the right device in memory
    for (var i = 0; i < allPhysDevs.length; i++) {
         if (allPhysDevs[i].key == parseInt(selPhysDevId)) {
             
             
              // know what ports are used
             var listOfLinks = $("#service_links_container .so-link-block");
             var usedPortsForThisDev = [];
             
             for (var j=0; j<listOfLinks.length; j++) {
                 var data = $(listOfLinks[j]).data();
                 if (data["src-type"] == "physical" && data["src-dev"] == selPhysDevId) {
                     usedPortsForThisDev.push(data["src-port"]);
                 }                 
                 if (data["dst-type"] == "physical" && data["dst-dev"] == selPhysDevId) {
                     usedPortsForThisDev.push(data["dst-port"]);
                 }
             }
             
             
              // populate ports
              devPortCol = allPhysDevs[i].portCollection;
              var portSort = [];
              
              //  make array of objects to sort
              for (var prt=0; prt<devPortCol.length; prt++) {
                    portSort.push({"key": devPortCol[prt].key, "displayName": devPortCol[prt].displayName});
              }
              
              portSort.sort(function(a, b){
                  var firstA = parseInt(a.displayName.split(".")[0]);
                  var firstB = parseInt(b.displayName.split(".")[0]);
                  var secondA = parseInt(a.displayName.split(".")[1]);
                  var secondB = parseInt(b.displayName.split(".")[1]);
                  
                  if (firstA !== firstB) {
                      if (firstA > firstB) return 1;
                      else if (firstA == firstB) return 0;
                      else return -1;
                  }
                  else {
                      if (secondA > secondB) return 1;
                      else if (secondA == secondB) return 0;
                      else return -1;
                  }

              });
              
              // turn array of sorted objects into the options
              for (var j = 0; j < portSort.length; j++) {
                  if (usedPortsForThisDev.indexOf(portSort[j].displayName) !== -1)
                      portSel.append("<option value='" + portSort[j].key + "' disabled='disabled'>" + portSort[j].displayName + "</option>");
                  else  
                      portSel.append("<option value='" + portSort[j].key + "'>" + portSort[j].displayName + "</option>");
              }
              break;
         }
    }
};

$.fn.setTypeChangeEvent = function(loc) {
    var co = $("#form-" + loc + "-central-office");
    var port = $("#form-" + loc + "-port");
    var site = $("#form-" + loc + "-site");
    var vnfEP = $("#form-" + loc + "-endpoint-vnf");
    var physEP = $("#form-" + loc + "-endpoint-phys");
    var siteEP = $("#form-" + loc + "-endpoint-site");
    var coRow = co.parent();
    var portRow = port.parent();
    var siteRow = site.parent();
    var vnfEPRow = vnfEP.parent();
    var physEPRow = physEP.parent();
    var siteEPRow = siteEP.parent();

    // always clear because data is dynamic
    port.empty();
    site.empty();

    // always reset so no extraneous values exist hidden on the form
    vnfEP.val("");
    physEP.val("");
    siteEP.val("");
    co.val("");

    // hide all
    coRow.addClass("hide");
    portRow.addClass("hide");
    siteRow.addClass("hide");
    vnfEPRow.addClass("hide");
    physEPRow.addClass("hide");
    siteEPRow.addClass("hide");

    switch ($(this).val()) {
    case "virtual":
         vnfEPRow.removeClass("hide");
         break;
    case "physical":
         coRow.removeClass("hide"); // Must pick CO before picking a Physical Device
         break;
    case "site":
         siteEPRow.removeClass("hide");
         break;
    };
};


function showSwitchIPsEditable(val, linkBox) {
    var target = $("#so-device--" + val);
    var extGW = target.data("extGW");
    var subnetCIDR = target.data("subnetCIDR");
    var subnetCIDRext = target.data("subnetCIDRext");
    var rangeSet = target.data("rangeSet");
    var isConnectExtRtr = target.data("isConnectExtRtr");
    var infoMsg = $("#srcv_msg_nw_ips_exist");
    
    // hide messages for now
    $("#uneditableLinkData").empty();
    $("#srcv_msg_nw_ips_exist_no_edit").addClass("hide");
    
    // show first two inputs which we need at the very least in order to edit.
    $("#srcv_crt_hdr_nw_int").removeClass("hide");
    $(".mainSelVNF").removeClass("hide");
    

    // -------------------------------
    // EXPLICITLY DEFINE CIDR and IPs
    // -------------------------------    
    var subnetCidr = $("#form-nw-interconnect-subnet-cidr");
    var subnetCidrSlash = $("#form-nw-interconnect-subnet-cidr-slash");

    if (subnetCIDR) {
         var explDefineCidr = $("#form-nw-interconnect-is-explicit");
         
         infoMsg.removeClass("hide");
         
         if (!explDefineCidr.prop("checked"))  
              explDefineCidr.trigger("click");
         
         subnetCidr.val(subnetCIDR); // before the slash
         subnetCidrSlash.val(subnetCIDRext); // after the slash
         subnetCidr.trigger("change");
         
         if (rangeSet && rangeSet.length > 0) {
              var subnetRangeRow = $("#form-nw-interconnect-subnet-range").parent();
              
              subnetRangeRow.removeClass("hide");
              var i = 0; // TODO: evenetually this is an iterator
              $("#crtSrvcLnkRng" + i + " .min").val(rangeSet[i].begin);
              $("#crtSrvcLnkRng" + i + " .max").val(rangeSet[i].end);
         };    
    }
    else { // this may be a different switch than the last one so if one was already visible, clean it up
         subnetCidr.val("");
         subnetCidr.trigger("change");
         $("#crtSrvcLnkRng0.min").val("");
         $("#crtSrvcLnkRng0.max").val("");         
    }
    
    // -------------------------------
    // CONNECT EXTERNAL ROUTER
    // -------------------------------    
    if (isConnectExtRtr) {
         var cnctExtRtr = $("#form-nw-interconnect-ext_router");
         
         infoMsg.removeClass("hide");
         cnctExtRtr.prop("checked", "checked");
         cnctExtRtr.trigger("change");
         
         if (extGW) {
              $("#nw-interconnect-via-static").trigger("click");
              $("#form-nw-interconnect-static-ip").val(extGW);
         }
    }
    
    
    
    // HANDLE THE CASE WHEN NO DATA WAS SELECTED BUT NEED THE WARNING
    // The value will not be on the data object yet if it had not been touched.
    if (subnetCIDR !== undefined) infoMsg.removeClass("hide");
    else infoMsg.addClass("hide");
}


// PETTY STRING for EDIT ONLY
function showSwitchIPsNonEditable(val, linkBox) {
    var vnfBox = $("#so-device--" + val.split(" ").join("-"));
    var extGW = vnfBox.data("extGW");
    var subnetCIDR = vnfBox.data("subnetCIDR");
    var subnetCIDRext = vnfBox.data("subnetCIDRext");
    var rangeSet = vnfBox.data("rangeSet");
    var isConnectExtRtr = vnfBox.data("isConnectExtRtr");
    var infoMsg = $("#srcv_msg_nw_ips_exist");
    var infoMsgNoEdit = $("#srcv_msg_nw_ips_exist_no_edit");
    var subnetCidrInpt = $("#form-nw-interconnect-subnet-cidr");
    var extRtrInpt = $("#form-nw-interconnect-ext_router");
    var header = $("#srcv_crt_hdr_nw_int");
    
    var subnetStr = "";


    // -------------------------------
    // EXPLICITLY DEFINE CIDR and IPs
    // -------------------------------    
    if (subnetCIDR) {
         
         subnetCidrInpt.val(subnetCIDR.split("/")[0]); // before the slash
         subnetCidrInpt.trigger("change");
         
         // in case its not editable
         subnetStr = subnetStr + "<div class='form-input-block noEditSwitch'><label>" + $.i18n._("srvc.ni.sub.cidr") + "</label><span id='nwCIDR'>" + subnetCIDR + "/" + subnetCIDRext + "</span></div>";
         
         if (rangeSet) {
              for (var i=0; i<rangeSet.length; i++) {
                    subnetStr = subnetStr + "<div class='form-input-block noEditSwitch'><label>" + $.i18n._("srvc.ni.dhcp.range") + "</label><span id='nwRange'><span class='begin'>" + rangeSet[i].begin + "</span> - <span class='end'>" + rangeSet[i].end + "</span></span></div>";    
              }
         };    
    }
    
    // -------------------------------
    // CONNECT EXTERNAL ROUTER
    // -------------------------------    
    if (extGW === undefined || extGW == "") {
         if (isConnectExtRtr){
              extRtrInpt.prop("checked","checked");
              extRtrInpt.trigger("change");
              subnetStr = subnetStr + "<div class='form-input-block noEditSwitch'<label>" + $.i18n._("srvc.via.dhcp") + "</label></div>";
         }
              
    }
    else
         subnetStr = subnetStr + "<div class='form-input-block noEditSwitch'><label>" + $.i18n._("srvc.via") + "</label><span id='nwExtGW'>" + extGW + "</span></div>";
    

    infoMsg.addClass("hide");
    $(".nwInterCncts").addClass("hide");
    $(".mainSelVNF").addClass("hide");
    
    // just hid the header so put it back
    header.removeClass("hide");
    infoMsgNoEdit.removeClass("hide");
    $("#uneditableLinkData").html(subnetStr);
    $("#uneditableLinkData").data("nwData", vnfBox.data());

}

function hasIntCnctDefined() {
    return $("#form-nw-interconnect-is-explicit").is(":checked") || $("#form-nw-interconnect-ext_router").is("checked");
}


// -------------------------------------------------------
// Submit the new link to the main form
// -------------------------------------------------------

function services_create_link_save_link(target, fields) {
    var form = $("#servicesCreateLinkForm");
    var srcDevID = "";
    var dstDevID = "";
    var srcDisplayName = "";
    var dstDisplayName = "";
    var $linkListContainer = $("#" + target);
    var sitesUsed = $linkListContainer.data("sitesUsed");
    var srcEpType = fields['src-endpoint-type'];
    var dstEpType = fields['dst-endpoint-type'];
    var hasVNF = false;
    var isConnectExtRtr = false;


    switch (srcEpType) {
        case "virtual":
            srcDisplayName = fields['src-endpoint-vnf'];
            srcDevID = $("#form-src-endpoint-vnf").val();
            srcMetaData = form.data("srcVNF");
            hasVNF = true;
            break;
        case "physical":
            srcDisplayName = $("#form-src-endpoint-phys :selected").html();
            srcDevID = $("#form-src-endpoint-phys").val();
            srcMetaData = getPhysFromList("src", srcDisplayName, "create");
            break;
        case "site":
            var srcEndptVal = $("#form-src-endpoint-site").val();
            srcDisplayName = $("#form-src-endpoint-site :selected").html();
            srcDevID = srcEndptVal;
            sitesUsed[srcEndptVal] = srcDisplayName;
            srcMetaData = form.data("srcSite");
            break;
    };
    

    switch (dstEpType) {
        case "virtual":
            dstDisplayName = fields['dst-endpoint-vnf'];
            dstDevID = $("#form-dst-endpoint-vnf").val();
            dstMetaData = form.data("dstVNF");
            hasVNF = true;
            break;
        case "physical":
            dstDisplayName = $("#form-dst-endpoint-phys :selected").html();
            dstDevID = $("#form-dst-endpoint-phys").val();
            dstMetaData = getPhysFromList("dst", dstDisplayName, "create");
            break;
        case "site":
            var dstEndptVal = $("#form-dst-endpoint-site").val();
            dstDisplayName = $("#form-dst-endpoint-site :selected").html();
            dstDevID = dstEndptVal;
            sitesUsed[dstEndptVal] = dstDisplayName;
            dstMetaData = form.data("dstSite");
            break;
    };
    

    var srcFlIpFld = $("#ep-src-has-floating-ip");
    var dstFlIpFld = $("#ep-dst-has-floating-ip");
    var srcDevType = fields['src-endpoint-type'];
    var dstDevType = fields['dst-endpoint-type'];
    // these 2 are not used for xml submission
    var srcSite = (fields['src-endpoint-type'] == "site") ? $("#form-src-endpoint-site :selected").html() : $("#form-src-site option:selected").html();
    var dstSite = (fields['dst-endpoint-type'] == "site") ? $("#form-dst-endpoint-site :selected").html() : $("#form-dst-site option:selected").html(); 

    var srcPort = $("#form-src-port :selected").html();
    var dstPort = $("#form-dst-port :selected").html();
    var srcStatIP = ($("#ep-src-static-ip").is(":visible")) ?  $("#ep-src-static-ip").val(): "";
    var dstStatIP = ($("#ep-dst-static-ip").is(":visible")) ?  $("#ep-dst-static-ip").val() : "";
    var srcFloatIP = (srcFlIpFld.is(":visible") && srcFlIpFld.is(":checked")) ? "true" : "false";
    var dstFloatIP = (dstFlIpFld.is(":visible") && dstFlIpFld.is(":checked")) ? "true" : "false";
                        
    
    // --------------------------------------------------
    // MAKE PRETTY STRING FOR LINKS TABLE
    // --------------------------------------------------
    // else is for edit in the case of uneditable switch
    var subnetStr = "";
    
    if (hasVNF) {
         if ($("#form-nw-interconnect-is-explicit").is(":visible"))
              subnetStr = getPrStrLinksNwIntcnt();
         else    
              subnetStr = getPrStrLinksNwIntcntNoEdt();              
    }
    
    // --------------------------------------------------
    // CIDR and RANGE INFO used for data object on $l
    // --------------------------------------------------
    var isExplicit = false;
    var isEditable = true;
    var subnetCIDR = "";
    var rangeSet = [];
    var nwData = {};
    
    if (hasVNF) {
         isExplicit = $("#form-nw-interconnect-is-explicit").is(":checked");
         isEditable = $("#form-nw-interconnect-is-explicit").is(":visible");
         
         // I need to know that it has a switch but it is non-editable
         // If there is no switch, I can carry on normal, but if there
         // is a switch, I need to check to see if it is non-ediatble 
         // data or regular data
         if (isEditable) {
             if (isExplicit) {
                  subnetCIDR = $("#form-nw-interconnect-subnet-cidr").val() + "/" + $("#form-nw-interconnect-subnet-cidr-slash").val();
                  
                  $("#form-nw-interconnect-subnet-range").children().each(function() {
                        var min = $(this).find(".min").val();
                        var max = $(this).find(".max").val();
                        var hasValues = $(this).find(".min").val().length > 0;
                        
                        if (hasValues) {rangeSet.push({"begin": min, "end": max });}
                  });
             } 
         }
         

        else { // only during edit with a switch
            nwData = $("#uneditableLinkData").data("nwData");
            isConnectExtRtr = nwData.isConnectExtRtr;
            subnetCIDR = nwData.subnetCIDR || "";
            subnetCIDRext = nwData.subnetCIDRext || "";

            if (subnetCIDR !== "" && subnetCIDRext !== "")
                subnetCIDR = subnetCIDR + "/" + subnetCIDRext;

            rangeSet = nwData.rangeSet || [];
            extGW = nwData.extGW || "";
        }
    }
     

    // --------------------------------------------------
    // EXT ROUTER CONNECTION
    // --------------------------------------------------
     var hasExtGwStatIP = false;
     var extGW = "";
     
     if (hasVNF) {
          if (isEditable) {
             isConnectExtRtr = $("#form-nw-interconnect-ext_router").is(":checked");
             hasExtGwStatIP = $("#nw-interconnect-via-static").is(":checked");
             
             if (isConnectExtRtr && hasExtGwStatIP) {
                    extGW = $("#form-nw-interconnect-static-ip").val();
             }                    
          }
          else 
                extGW = nwData.extGW || "";                
     }

     // --------------------------------------------------
     // DO WE SET A NEW SWITCH IP SET?
     // DO WE UPDATE ALL THE OTHER SWITCHES?
     // --------------------------------------------------
    
    var hasSwitch = false;

    // do not look for switch data on a site
    if (srcSite === undefined) {
         var srcSwitchBox = $("#so-device--" + srcDisplayName);
         var isSrcSwitch = srcSwitchBox.data("isSwitch") || false;
         if (isSrcSwitch) {
              hasSwitch = srcDisplayName;
         }
    }

    if (dstSite === undefined) {
         var dstSwitchBox = $("#so-device--"    + dstDisplayName);
         var isDstSwitch = dstSwitchBox.data("isSwitch") || false;
         if (isDstSwitch) {
              hasSwitch = dstDisplayName;
         }
    }

    var subSubnetCidr = subnetCIDR.split("/");

    if (hasSwitch) {

         // update box
         var box =  $("#so-device--" + hasSwitch.split(" ").join("-"));
         var data = box.data();
         
         if (data.rangeSet !== rangeSet || data.subnetCIDR !== subSubnetCidr[0] || data.subnetCIDRext !== subSubnetCidr[1] || data.extGW !== extGW) {
              // make VNF data equal then update the LINKS
              box.data("rangeSet", rangeSet);
              box.data("subnetCIDR", subSubnetCidr[0]);
              box.data("subnetCIDRext", subSubnetCidr[1]);
              box.data("extGW", extGW);  
              box.data("isConnectExtRtr", isConnectExtRtr);
         }
         
         // now deal with updating the links in the Links section
         $(".so-link-block").each(function(i, j) {
              var dta = $(this).data();
              
              if (dta["src-name"] == hasSwitch || dta["dst-name"] == hasSwitch) {
                    dta.nwDhcpRanges = rangeSet;
                    dta.nwExtGW = extGW;
                    dta.nwIntCIDR = subnetCIDR;
                    dta.nwHasExtGW = isConnectExtRtr;
                    
                    $(this).find(".soSubnetInfo").html(subnetStr);
              }
         });
    } 
    
    
    // --------------------------------------------------
    // NOW ENDPOINTS
    // --------------------------------------------------
    // SRC (LEFT)
    var srcEpStr = prettyFloatingIp(srcFloatIP);
    var srcStatIpStr = prettyStaticIp(srcStatIP);
    
    // DST (RIGHT)
    var dstEpStr = prettyFloatingIp(dstFloatIP);
    var dstStatIpStr = prettyStaticIp(dstStatIP);
    
    // --------------------------------------------------
    // BANDWIDTH
    // --------------------------------------------------
    var srcBwToDesc = $("#src_bw_to :selected").html();
    var dstBwToDesc = $("#dst_bw_to :selected").html();
    var srcBwFromDesc = $("#src_bw_from :selected").html();
    var dstBwFromDesc = $("#dst_bw_from :selected").html();
    
    var srcBwStr     = prettyBandwidth(srcBwToDesc, srcBwFromDesc);
    var dstBwStr     = prettyBandwidth(dstBwToDesc, dstBwFromDesc);     
    
    if (srcBwStr !== "") srcEpStr = srcBwStr;
    if (dstBwStr !== "") dstEpStr = dstBwStr;
    
    
    if (srcEpType == "site" || srcEpType == "physical") {
        srcMetaData.bandwidthProfileCollection = [];
        srcMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "ToCustomer", "displayName" : srcBwToDesc, "key" : $("#src_bw_to").val()});
        srcMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "FromCustomer", "displayName" : srcBwFromDesc, "key" : $("#src_bw_from").val()});
//        srcMetaData.siteBandwidthProfileCollection = null;    
    }
    
    if (dstEpType == "site" || dstEpType == "physical") {
        dstMetaData.bandwidthProfileCollection = [];
        dstMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "ToCustomer", "displayName" : dstBwToDesc, "key" : $("#dst_bw_to").val()});
        dstMetaData.bandwidthProfileCollection.push({"bandwidthDirection": "FromCustomer", "displayName" : dstBwFromDesc, "key" : $("#dst_bw_from").val()});
//        dstMetaData.siteBandwidthProfileCollection = null;
    }
    
    
    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    
    if ($("#servicesCreateLinkForm").data("isEdit")) {
        $l = $("#service_links_container .blockInEdit");
        
        
         $l.animate({
             backgroundColor: "transparent",
             }, 5000, function() {
                 $l.removeClass("blockInEdit"); 
             });
    }
    else {
        $l = $("#so-link-block").clone().removeAttr('id');        
    }
    

    renderPrLnkDataMain($l, srcDisplayName, srcPort, dstDisplayName, dstPort, subnetStr);
    renderPrLnkDataAux($l, srcStatIpStr, srcEpStr, dstStatIpStr, dstEpStr);                    
    renderPrLnkDataEndpoint($l, srcSite, dstSite, srcDevType, dstDevType);
    
    // --------------------------------------------------
    // Manage if a site id is already used or not
    // --------------------------------------------------
    var srcSiteId = (fields['src-endpoint-type'] == "site") ? $("#form-src-endpoint-site").val() :  $("#form-src-site").val(); // if VNF, this does not exist
    var dstSiteId = (fields['dst-endpoint-type'] == "site") ? $("#form-dst-endpoint-site").val() : $("#form-dst-site").val();
    
    // get a central office if not a customer
    var srcCentOfcId = fields['src-central-office'] || "";
    var srcCentOfcName = $("#form-src-central-office option:selected").html() || "";
    var dstCentOfcId = fields['dst-central-office'] || "";
    var dstCentOfcName = $("#form-dst-central-office option:selected").html() || "";     
    
    // set up the endpoint in the same format that the edit case retuns so we can reuse the structure
    var srcEpIpData = {};
    var dstEpIpData = {};
    
    srcEpIpData.assignFloatingIP = (srcFlIpFld.is(":visible") && srcFlIpFld.is(":checked"));
    srcEpIpData.staticIP = srcStatIP;
    srcEpIpData.assignedIP = null;
    srcEpIpData.floatingIP = null;
    
    dstEpIpData.assignFloatingIP = (dstFlIpFld.is(":visible") && dstFlIpFld.is(":checked"));
    dstEpIpData.staticIP = dstStatIP;
    dstEpIpData.assignedIP = null;
    dstEpIpData.floatingIP = null;
    
    // --------------------------------------------------
    // save data on link block
    // --------------------------------------------------
    var dataObj = {
            'srcCentOfcId'  : srcCentOfcId,
            'srcCentOfcName': srcCentOfcName,
            
            'src-dev'       : srcDevID,
            'src-port'      : srcPort,
            'src-site'      : srcSite,
            'src_site_id'   : srcSiteId,
            'src-name'      : srcDisplayName,
            'src-type'      : srcDevType,                  
            'src-metadata'  : srcMetaData,
            
            "srcBwTo"       : fields.src_bw_to,
            "srcBwFrom"     : fields.src_bw_from,
            "srcBwToStr"    : srcBwToDesc, 
            "srcBwFromStr"  : srcBwFromDesc,
            
            "srcEpIpData"   : srcEpIpData,
            
            'dstCentOfcId'  : dstCentOfcId,
            'dstCentOfcName': dstCentOfcName,
            
            'dst-dev'       : dstDevID,
            'dst-port'      : dstPort,
            'dst-site'      : dstSite,
            'dst_site_id'   : dstSiteId,
            'dst-name'      : dstDisplayName,
            'dst-type'      : dstDevType,                      
            'dst-metadata'  : dstMetaData,
            
            "dstBwTo"       : fields.dst_bw_to,
            "dstBwFrom"     : fields.dst_bw_from,
            "dstBwToStr"    : dstBwToDesc, 
            "dstBwFromStr"  : dstBwFromDesc,    
            
            "dstEpIpData"   : dstEpIpData,
            
            'nwIntCIDR'     : subnetCIDR,
            'nwHasExtGW'    : isConnectExtRtr,
            'nwExtGW'       : extGW,
            'nwDhcpRanges'  : rangeSet,
    };
    
    if ($("#servicesCreateLinkForm").data("isEdit")) {
        $l.data(dataObj);
    }
    else {
        $l.data(dataObj).appendTo($linkListContainer); 
    }
    
    $("#servicesCreateLinkForm .button-container .btnCancel").click(function() {
        $("#service_links_container .blockInEdit").removeClass("blockInEdit");
    });
}


function setUpEditLink(el, btn) {
    var me = $(el).closest(".so-link-block");
    me.addClass("blockInEdit");
    me.siblings().removeClass("blockInEdit");
    me.data("curEdit", true);
    
    

    var data = $(el).parents('.so-link-block').data();
    var linksBox = $("#service_links_container");
    var srcName = data['src-name'];
    var dstName = data['dst-name'];
    var srcType = data['src-type'];
    var dstType = data['dst-type'];
    var srcIsSw = $("#so-device--" + data['src-name']).data("isSwitch");
    var dstIsSw = $("#so-device--" + data['dst-name']).data("isSwitch");
    var hasSwitch =  (srcIsSw || dstIsSw);
    var hasNonSwitchVNF = (srcType == "virtual"|| dstType == "virtual") && !hasSwitch;        
    
    
    // Start populating the form
    $("#" + btn).trigger("click");
    $("#servicesCreateLinkForm").data("isEdit", true);
    $("#servicesCreateLinkForm").data("linkData", data);
    $("#servicesCreateLinkForm").siblings("h1.title").html($.i18n._("srvc.edtLink"));
    $("#servicesCreateLinkForm .btnSave").attr("value", $.i18n._("cmn.btn.hvr.save.ch"));


    // SOURCE
    $("#form-src-endpoint-type").val(srcType);
    $("#form-src-endpoint-type").trigger("change");
    
    if (srcType == "virtual") {
        $("#form-src-endpoint-vnf").val(srcName);
        manageEpForVNF("src", srcName, linksBox);
        showPortsForEdit("src", data['src-port']);
    }
    else if (srcType == "site") {
        $("#form-src-endpoint-site").val(data.src_site_id);
        $("#form-src-endpoint-site option:selected").removeAttr("disabled");
        $("#form-src-endpoint-site").trigger("change");
    }
    else { // physical device
    }
    
    
    // DESTINATION
    $("#form-dst-endpoint-type").val(dstType);
    $("#form-dst-endpoint-type").trigger("change");
    
    if (dstType == "virtual") {
        $("#form-dst-endpoint-vnf").val(dstName);
        manageEpForVNF("dst", dstName, linksBox);            
        showPortsForEdit("dst", data["dst-port"]);
    }
    else if (dstType == "site") {
        $("#form-dst-endpoint-site").val(data.dst_site_id);
        $("#form-dst-endpoint-site option:selected").removeAttr("disabled");
        $("#form-dst-endpoint-site").trigger("change");
    }
    else { // physical device
    }
    
    // -----------------
    // NW Interconnects 
    // -----------------        
    if (srcType == "virtual" || dstType == "virtual") {
        if (hasSwitch) { // trigger the smart load of switch data from switch object
            if (srcIsSw) manageInnrCnctForVNF("src", srcName, linksBox);
            else manageInnrCnctForVNF("dst", dstName, linksBox); 
        }
        else { // really need just one as it is shared (thus an "interconnect"
            if (srcType == "virtual") manageInnrCnctForVNF("src", srcName, linksBox); 
            else manageInnrCnctForVNF("dst", dstName, linksBox);            
        }

    }

    
    if (hasNonSwitchVNF) {
        if (data.nwIntCIDR !== "") {
            $("#form-nw-interconnect-is-explicit").prop("checked", "checked");
            $("#form-nw-interconnect-is-explicit").trigger("change");
            $("#form-nw-interconnect-subnet-cidr").val(data.nwIntCIDR.split("/")[0]);
            $("#form-nw-interconnect-subnet-cidr-slash").val(data.nwIntCIDR.split("/")[1]);
            $("#form-nw-interconnect-subnet-cidr").trigger("change");
        }
        
        for (var i=0; i<data.nwDhcpRanges.length; i++) {
            $("#crtSrvcLnkRng" + i + " .min").val(data.nwDhcpRanges[i].begin);
            $("#crtSrvcLnkRng" + i + " .max").val(data.nwDhcpRanges[i].end);
        }
        
        
        
        if (data.nwHasExtGW) {
            $("#form-nw-interconnect-ext_router").prop("checked", "checked");
            $("#form-nw-interconnect-ext_router").trigger("change");
            
            if (data.nwExtGW !== "") {
                $("#nw-interconnect-via-static").prop("checked", "checked");
                $("#nw-interconnect-via-static").trigger("change");
                $("#form-nw-interconnect-static-ip").val(data.nwExtGW);
            }
        }
    }
    
    // -----------------
    // ENDPOINTS
    // -----------------
    // Floating IP
    if (data.nwIntCIDR !== "") {
        if (data["src-type"] == "virtual" && !srcIsSw) {
            $("#ep-src-has-floating-ip").showRow();
            if (data.srcEpIpData.assignFloatingIP) $("#ep-src-has-floating-ip").prop("checked", "checked");
        }
        if (data["dst-type"] == "virtual" && !dstIsSw) {
            $("#ep-dst-has-floating-ip").showRow();
            if (data.dstEpIpData.assignFloatingIP) $("#ep-dst-has-floating-ip").prop("checked", "checked");
        }
    }
    else {
        // no CIDR but floating IP was checked
        if (data.srcEpIpData.assignFloatingIP) $("#ep-src-has-floating-ip").prop("checked", "checked");
        if (data.dstEpIpData.assignFloatingIP) $("#ep-dst-has-floating-ip").prop("checked", "checked");
    }

    
    if (data.srcEpIpData.staticIP !== undefined && data.srcEpIpData.staticIP !== "" && !srcIsSw) {
        $("#ep-src-static").prop("checked", "checked");
        $("#ep-src-static").trigger("change");
        $("#ep-src-static-ip").val(data.srcEpIpData.staticIP);
    }
    
    if (data.dstEpIpData.staticIP !== undefined && data.dstEpIpData.staticIP !== "" && !dstIsSw) {
        $("#ep-dst-static").prop("checked", "checked");
        $("#ep-dst-static").trigger("change");
        $("#ep-dst-static-ip").val(data.dstEpIpData.staticIP);
    }
    
    // Bandwidth
    // Handled when the selects are populated off of the edit jQuery data object
    
}

function populateBandwidthProfiles(loc, data) {
    // SORT
    
    data.sort(function(a, b) {
        if (a.displayName > b.displayName)        return 1;
        else if (a.displayName == b.displayName)  return 0;
        else                                                                                    return -1;
    });

    // POPULATE
    var inputTo = $("#" + loc + "_bw_to");
    var inputFrom = $("#" + loc + "_bw_from");
    var isEdit = $("#servicesCreateLinkForm").data("isEdit");
    inputTo.prepSel(true, true);
    inputFrom.prepSel(false, true);

    for (var i=0; i<data.length; i++) {
        inputTo.append("<option value='" + data[i].key + "'>" + data[i].displayName + "</option>");
    }
    
    inputFrom.append(inputTo.find("option").clone());
    
    if (isEdit) {
        var data = $("#servicesCreateLinkForm").data("linkData")[loc + "-metadata"];
        if (data !== undefined) {
            var bwData = data.bandwidthProfileCollection;
            var bwTo = "";
            var bwFrom = "";
            for (var bw=0; bw<bwData.length; bw++) {
                if (bwData[bw].bandwidthDirection == "ToCustomer") {
                    bwTo = bwData[bw].displayName;
                }
                if (bwData[bw].bandwidthDirection == "FromCustomer") {
                    bwFrom = bwData[bw].displayName;
                }            
            }
            
            // since the API returns only the string and not the key to the bandwidth (I do get a null for the key)
            $("#" + loc + "_bw_to option").each(function(){
                if ($(this).html() == bwTo) {
                    inputTo.val($(this).val());
                    return;
                }
            });
            
            $("#" + loc + "_bw_from option").each(function(){
                if ($(this).html() == bwFrom) {
                    inputFrom.val($(this).val());
                    return;
                }
            });
        }
    }
};

