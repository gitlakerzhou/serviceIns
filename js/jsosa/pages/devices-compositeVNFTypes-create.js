//@ sourceURL=http://localhost:8080/ajax/devices-compositeVNFTypes-create.js
//function run_createComposite() {

(function () {
    var $vnfBlock = $("#vnf-list-block"),
        $deviceBlock = $("#device-list-block"),
        $linkBlock = $("#link-list-block"),
        $linkListContainer = $("#compvnf-link-container"),
        $vnfInstances = $("#vnf-instance-list"),
        $addLinkBtn = $("#compvnf-add-link"),
        $addVNFBtn = $("#compvnf-add-vnf"),
        _devList = [],
        _vnfList = [],
        _physInstances = [],
        _vnfInstances = [],
        _cloudList = [];
    
    // I18N
    $("#compositeDeviceName").html($.i18n._("cmpst.dev.name"));
    $("#subHdrVirtDev").html($.i18n._("cmpst.sub.hdr.virt.devs"));
    $("#subHdrLinks").html($.i18n._("cmpst.sub.hdr.links"));
    $("#compvnf-form-create").attr("value", $.i18n._("btn.create"));
    $("#compvnf-form-cancel").attr("value", $.i18n._("btn.cancel"));
    $("#compvnf-add-vnf").append($.i18n._("cmpst.btn.device"));
    $("#compvnf-add-link").append($.i18n._("cmpst.btn.link"));
    
    
    
    $("#buttonRerender").html($.i18n._("srvc.dia.repaint"));
    $("#buttonRerender").click(function(ev) {
        if (!($(this).hasClass("disabled"))) {
            $(this).addClass("disabled");
            $("#diagramField").data("locations", {});
            generateMap();
        }
    });

    
    
    // GET VNFs FOR CREATE VNF LATER
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        var form = $("#service-edit-form");
        var vnfByName = {};
        
        for (var i = 0; i < vnfList.length; i++) {
            vnfByName[vnfList[i].displayName] = vnfList[i];
        }
        
        osa.ajax.list('centralOfficeCompositeVNFTypes', function(cvnfList) {
            for (var j = 0; j < cvnfList.length; j++) {
                vnfByName[cvnfList[j].displayName] = cvnfList[j];
            }
            
            $("#compvnf-form").data("vnfByName", vnfByName);
        });
        
    });
    



    var isVNFNameUsed = function(n) {
        for (var i = 0; i < _vnfInstances.length; i++) {
            if (_vnfInstances[i]['vnf-instance-name'] == n) {
                return true;
            }
        }
        return false;
    };

    var rebuildVNFList = function() {
        _vnfInstances = [];
        $vnfInstances.children(".compvnf-device-block").each(function(el) {
            _vnfInstances.push($(this).data());
        });
    };

    var removeLinkBlock = function($block) {
        $block.remove();
        updatePortAvailability();
        generateMap();
    };

    var removeLinksAssociatedWithVNF = function(vnfid) {
        $linkListContainer.find(".so-link-block").filter(function() {
            var d = $(this).data();
            if ((d['src-name'] == vnfid) ||
                (d['dst-name'] == vnfid)) {
                return true;
            }
        }).remove();
        generateMap();
    };

    var updatePortAvailability = function() {
        $(".compvnf-device-port").removeClass('used available');
        $linkListContainer.find(".so-link-block").each(function() {
            var t = $(this).data();
            getPortBlock(t['src-name'], t['src-portName']).addClass('used');
            getPortBlock(t['dst-name'], t['dst-portName']).addClass('used');
        });
    };

    var getPortBlock = function(name, port) {
        return $("#so-port--" + name + "_" + port);
    };

    // Add a virtual device to the list with named ports and a method to manage them
    var createVirtualDevice = function(vnfName, portNames, metadata) {
        var name = metadata['vnf-instance-name'];
        var deviceKey = idify(name);
        var $div = $("<div></div>").addClass("compvnf-device-block service-create-device-block device-block virtual").attr("id", "so-device--" + deviceKey).data(metadata);
        $div.append($("<p class='dev-title'>" + name + "</p><div class='btnContainer'>"));

        var $delBtn = $("<a></a>", {'class': 'delete-btn btnRound fr', href: "#", title: $.i18n._("dev.dltDev"), alt: $.i18n._("dev.dltDev")}).appendTo($div.find(".btnContainer"));
        $delBtn.append('<img src="images/delete.png">');

        var addPort = function(portName) {
            $("<div></div>").addClass('compvnf-device-port device-port').attr('id', 'so-port--' + deviceKey + "_" + portName).html('').appendTo($div);
        };

        $delBtn.click(function(ev) {
            ev.preventDefault();
            if (confirm($.i18n._("srvc.prmpt.dlt.dev"))) {
                var idToRemove = $div.data('vnf-instance-name');
                $div.remove();

                rebuildVNFList();
                removeLinksAssociatedWithVNF(idToRemove);
                generateMap();
            }
        });

        if (portNames) {
            for ( var i = 0; i < portNames.length; i++ ) {
                addPort(portNames[i]);
            }
        }

        $div.appendTo($vnfInstances);
        rebuildVNFList();
    };

    var getVNFType = function(key) {
        for (var i = 0; i < _vnfList.length; i++) {
            if (_vnfList[i].key == key) {
                return {
                    key: _vnfList[i].key,
                    displayName: _vnfList[i].displayName,
                    portNames: _vnfList[i].portNames,
                    //vnfTypeProperties: _vnfList[i].vnfTypeProperties
                    implType: 'VNFT'
                };
            }
        }
    };

    var getVNFInstance = function(name) {
        for (var i = 0; i < _vnfInstances.length; i++) {
            if (_vnfInstances[i]['vnf-instance-name'] == name) {
                return _vnfInstances[i];
            }
        }
    };


    var generateMap = function() {
        var nodeMap = {nodes:[], links:[]};
        var endpointCount = 0;
        var nodes = {};

        for (var i = 0; i < _vnfInstances.length; i++) {
            nodeMap.nodes.push({name: _vnfInstances[i]['vnf-instance-name'], type:'VNF', description:getVNFType(_vnfInstances[i]['vnf-instance']).displayName});;
        }

        // Build the list of interconnections
        $linkListContainer.find(".so-link-block").each(function() {
            if ($(this).data('dst-metadata') == null) {
                nodeMap.nodes.push({name:$(this).data('dst-name'), type: 'Endpoint', description:''});
                nodeMap.links.push({from:$(this).data('src-name'), to:$(this).data('dst-name')});
            }
            else {
                nodeMap.links.push({from:$(this).data('src-name'), to:$(this).data('dst-name')});
            }
        });

        var map = osa.ui.map.create('compvnf-diagram-map', nodeMap, "mapBox");
        map.render(true);
    };

    // Adding a link to the Service Order will clone the block that currently exists and
    // renumbers the elements to keep them in order.
    $addLinkBtn.on('click', function(ev) {
        ev.preventDefault();
        var p = osa.ui.formPopup.create("Add New Link", null, {submitLabel: $.i18n._("srvc.crtLink")});
        var idx = $linkBlock.find('.so-link-block').size();
        var allVNFsPortNames = {};

        // Build the list of VNFs with PortNames for this CO
        var allVNFsPortNames = {};
        for (var i = 0; i < _vnfList.length; i++) {
            allVNFsPortNames[_vnfList[i].key] = _vnfList[i].portNames;
        }
        __virtDevs = {};
        _vnfInstances.map(function(e) {
            __virtDevs[e['vnf-instance-name']] = e;
            __virtDevs[e['vnf-instance-name']]['vnf-portNames'] = allVNFsPortNames[e['vnf-instance']];
        });

        var virtDD = _vnfInstances.map(function(e) {
            return {key: e['vnf-instance-name'], value: e['vnf-instance-name']};
        });

        var getPortIndex = function(devName, portName) {
            if (__virtDevs[devName] && __virtDevs[devName]['vnf-portNames']) {
                for (var i = 0; i < __virtDevs[devName]['vnf-portNames'].length; i++) {
                    if (__virtDevs[devName]['vnf-portNames'][i] === portName) {
                        return i;
                    }
                }
            }

            return null;
        };


        p.addHeader($.i18n._("source"));
        p.addField('src-dev', $.i18n._("srvc.device"), 'select', virtDD, function() {
            var val = $(this).val();
            var $pts = p.getField('src-port').empty();
            $pts.append($("<option></option>", {value: '', html:''}));
            p.enableField('src-port');

            var vnf = __virtDevs[val];
            var portNames = vnf['vnf-portNames'];
            for (var index = 0; index < portNames.length; index++) {
                var $a = $("<option></option>", {value:portNames[index], html:portNames[index]});
                if (getPortBlock(vnf['vnf-instance-name'], portNames[index]).hasClass('used')) {
                    $a.attr('disabled', 'disabled');
                }

                $pts.append($a);
            }
        });
        p.addField('src-port', $.i18n._("srvc.src.prt"), 'select', []);
        p.addHeader($.i18n._("destination"));
        p.addField('isEndpoint', $.i18n._("cmpst.is.ep"), 'checkbox', false, function() {
            p.removeRequiredField('endpoint-name');
            if ($("#form-isEndpoint:checked").val() == 'on') {
                p.hideField('dst-dev');
                p.hideField('dst-port');
                p.showField('endpoint-name');
                p.addRequiredField('endpoint-name');
            }
            else {
                p.hideField('endpoint-name');
                p.showField('dst-dev');
                p.showField('dst-port');
            }
        });
        p.addField('endpoint-name', $.i18n._("cmn.port"), 'string');
        p.addField('dst-dev', $.i18n._("srvc.device"), 'select', virtDD, function() {
            var val = $(this).val();
            var $pts = p.getField('dst-port').empty();
            $pts.append($("<option></option>", {value: '', html:''}));
            p.enableField('dst-port');

            var vnf = __virtDevs[val];
            var portNames = vnf['vnf-portNames'];
            for (var index = 0; index < portNames.length; index++) {
                var $a = $("<option></option>", {value:portNames[index], html:portNames[index]});
                if (getPortBlock(vnf['vnf-instance-name'], portNames[index]).hasClass('used')) {
                    $a.attr('disabled', 'disabled');
                }
                $pts.append($a);
            }
        });
        p.addField('dst-port', $.i18n._("cmn.port"), 'select', []);
        p.setSubmitAction(function(fields) {
            // If the source and destination are the same, throw it away and tell the user.
            if ((fields['src-dev'] === fields['dst-dev']) &&
                (fields['src-port'] === fields['dst-port'])) {
                alert($.i18n._("cpst.msg.warn.same"));
                return false;
            }
            else {
                var isEndpoint = (fields['isEndpoint'] == 'on');
                var srcDisplayName = __virtDevs[fields['src-dev']]['vnf-instance-name'];
                var srcMetaData = __virtDevs[fields['src-dev']];
                var dstDisplayName = isEndpoint ? fields['endpoint-name'] : __virtDevs[fields['dst-dev']]['vnf-instance-name'];
                var dstMetaData = isEndpoint ? null : __virtDevs[fields['dst-dev']];

                $l = $("#so-link-block").clone().removeAttr('id');
                $l.find(".so-link-src-dev") .html(srcDisplayName);
                $l.find(".so-link-src-port").html(fields['src-port']);
                $l.find(".so-link-dst-dev") .html(dstDisplayName);
                $l.find(".so-link-dst-port").html(fields['dst-port']);
                $l.find(".so-link-remove-btn").attr("title", $.i18n._("srvc.dltLink")).attr("alt", $.i18n._("srvc.dltLink"));
                $l.data({
                    'src-dev': fields['src-dev'],
                    'src-port': getPortIndex(fields['src-dev'], fields['src-port']),
                    'src-portName': fields['src-port'],
                    'src-name':srcDisplayName,
                    'src-metadata':srcMetaData,

                    'dst-dev': fields['dst-dev'],
                    'dst-port': getPortIndex(fields['dst-dev'], fields['dst-port']),
                    'dst-portName': fields['dst-port'],
                    'dst-name':dstDisplayName,
                    'dst-metadata':dstMetaData
                }).appendTo($linkListContainer);
                updatePortAvailability();
                generateMap();
                return true;
            }
        });

        p.setRequiredFields(['src-port', 'src-dev']);
        p.disableField('src-port');
        p.disableField('dst-port');
        p.hideField('endpoint-name');
        p.show();
    });


    // Popup creation for adding a VNF to the SO
    $addVNFBtn.on('click', function(ev) {
        ev.preventDefault();
        // Take the VNFList that we got at the beginning and make a select list out of it
        var vnfSelect = _vnfList.map(function(el) {
            return {key:el.key, value:el.displayName};
        });


        var p = osa.ui.formPopup.create($.i18n._("cmpst.hdr.crt.virt.dev"), null, {submitLabel: $.i18n._("btn.create")});
        p.addField('vnf-instance-name', $.i18n._("cmn.name"), 'text');
        p.addField('vnf-instance', $.i18n._("srvc.type"), 'select', vnfSelect, function() {
            var v = $(this).val();
            var __optList = [];
            var $opts = p.getField('vnf-optimization').empty();
            p.hideField('vnf-optimization');
            p.removeRequiredField('vnf-optimization');

            // Build the port list
            for (var i = 0; i < _vnfList.length; i++) {
                if (_vnfList[i].key == v) {
                    __optList = _vnfList[i].availableCustomOptimizations;
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

        });

        p.addField('vnf-optimization', $.i18n._("srvc.opt.flvr"), 'select', []);
        p.addField('vnf_scale_alarm_type', $.i18n._("srvc.alarm.type"), 'select', []);
        p.getField("vnf_scale_alarm_type").parent().addClass("hide");
        
        p.getField("vnf-instance").change(function() {
            // --------------------
            // SCALE ALARM TYPES
            // --------------------
            var curVnf = $("#form-vnf-instance :selected").html();
            var optScaleProfInput = $("#form-vnf_scale_alarm_type");
            optScaleProfInput.prepSel(true);
            
            var vnfOptsNames = $("#compvnf-form").data("vnfByName");
            var scaleAlarmTypes = vnfOptsNames[curVnf].scaleAlarmTypes;

            if (scaleAlarmTypes) {
                for (var i=0; i<scaleAlarmTypes.length; i++) {
                    optScaleProfInput.append("<option value='" + scaleAlarmTypes[i].key + "'>" + scaleAlarmTypes[i].name + "</option>");
                }
            }
            
            if (scaleAlarmTypes && scaleAlarmTypes.length > 0) optScaleProfInput.parent().removeClass("hide");
            else optScaleProfInput.parent().addClass("hide");
        });

        p.setSubmitAction(function(fields) {
            var vnfDisplayName;
            var portNames = new Array();
            if (isVNFNameUsed(fields['vnf-instance-name'])) {
                alert($.i18n._("cmpst.msg.warn.nm.used"));
                return false;
            }

            for (var i = 0; i < _vnfList.length; i++) {
                if (_vnfList[i].key == fields['vnf-instance']) {
                    vnfDisplayName = _vnfList[i].displayName;
                    portNames = _vnfList[i].portNames;
                    break;
                }
            }
            
            fields["scaleAlarmProfileDTO"] = {"name": $("#form-vnf_scale_alarm_type :selected").html(), "scaleAlarmProfileKey" :  $("#form-vnf_scale_alarm_type").val()};

            createVirtualDevice(vnfDisplayName, portNames, fields);
            generateMap();
        });

        p.setRequiredFields(['vnf-instance-name', 'vnf-instance']);
        p.hideField('vnf-optimization');
        p.show();
    });



    $("#compvnf-form").submit(function(ev) {
        ev.preventDefault();

        var o = {
            displayName: $("#compvnf-name").val(),
            nestedVNFTypeLinks: [],
            portNames: []
        };

        $linkListContainer.find(".so-link-block").each(function(l) {
            var d = $(this).data();
            var nvnft1, nvnft2, portIndex1, portIndex2;

            var sMetadata = d["src-metadata"];
            var dMetadata = d["dst-metadata"];
            
            if (sMetadata) {
                portIndex1 = d["src-port"];
                
                var sapRewrite = "";
                
                if (sMetadata.scaleAlarmProfileDTO)
                    sapRewrite = {"name": sMetadata.scaleAlarmProfileDTO.name, "key": sMetadata.scaleAlarmProfileDTO.scaleAlarmProfileKey};
                
                nvnft1 = {
                    displayName: d["src-name"],
                    vnfTypeBase: getVNFType(sMetadata["vnf-instance"]),
                    customOptimization: sMetadata["vnf-optimization"],
                    scaleAlarmProfileType: sapRewrite,
                };
            }

            if (dMetadata) {
                portIndex2 = d["dst-port"];
                
                var sapRewrite = "";
                
                if (dMetadata.scaleAlarmProfileDTO)
                    sapRewrite = {"name": dMetadata.scaleAlarmProfileDTO.name, "key": dMetadata.scaleAlarmProfileDTO.scaleAlarmProfileKey};
               
                nvnft2 = {
                    displayName: d["dst-name"],
                    vnfTypeBase: getVNFType(dMetadata["vnf-instance"]),
                    customOptimization: dMetadata["vnf-optimization"],
                    scaleAlarmProfileType: sapRewrite
                };
            }
            else {
                o.portNames.push(d["dst-name"]);
                portIndex2 = o.portNames.length - 1;
            }


            o.nestedVNFTypeLinks.push({
                "nestedVNFTypeConnector1": {
                    "portIndex": portIndex1,
                    "nestedVNFType": nvnft1
                },
                "nestedVNFTypeConnector2": {
                    "portIndex": portIndex2,
                    "nestedVNFType": nvnft2
                }
            });

        });

        if ( o.portNames.length == 0 ) {
            alert($.i18n._("cmpst.msg.warn.need.ep"));
            return false;
        }

        osa.ajax.add('centralOfficeCompositeVNFTypes', o, function() {
            location.href = "#devices-compositeVNFTypes";
        });
    });


    // Get All of the available VNF images and store them for the popup so
    // the popup doesn't have to get the list every time.
    osa.ajax.list('centralOfficeActiveVirtualNetworkFunctionTypes', function(vnfList) {
        _vnfList = vnfList;
    });


    osa.page.addPageEvent('#compvnf-form-cancel', 'click', function(ev) {
        if (confirm($.i18n._("cmpst.msg.warn.cancel"))) {
            location.href = "#devices-compositeVNFTypes";
        }
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

//} 