//@ sourceURL=http://localhost:8080/ajax/devices-compositeVNFTypes.js

(function(access) {
    var isWriteAccess = access.write;
    var $listing = $("#cvnf-list");
    var $cvnfBlock = $("#CVNFType-block-template");
    
    // -------------------------------------
    // I18N
    // -------------------------------------
    
    $("#createCompositeBtn").html($.i18n._("cmpst.btn.create"));
    $("#noCompositesMsg").html($.i18n._("cmpst.no.composites"));
    
    
    
    var deleteCVNF = function(ev) {
        var who = $(ev.target).data('id');
        
        if (!who)
            who = $(ev.target).parent().data('id');
        if ((who) && (confirm($.i18n._("cmpst.prmpt.dlt.comp")))) {
            osa.ajax.remove('centralOfficeCompositeVNFTypes', who, updateTable);
        }
    };

    var updateTable = function() {
        $listing.empty();
        osa.ajax.list('centralOfficeCompositeVNFTypes', function(cvnfs) {
            for (var i = 0; i < cvnfs.length; i++) {
                var mapId = 'cnvf-map-' + cvnfs[i].key;
                var nodeMap = {nodes:[], links:[]};
                var nodeList = {};
                var $c = $cvnfBlock.clone().attr('id', 'CVNFType-block-' + cvnfs[i].key);

                $c.find(".displayName").html(cvnfs[i].displayName);
                $c.find(".cvnf-map").attr("id", mapId);
                $c.find(".mapBox").attr("id", mapId+"Cori");
                
                if(isWriteAccess){
                    $c.find(".btnRound").attr("title", $.i18n._("btn.delete")).data({'id': cvnfs[i].key}).click(deleteCVNF);
                } else {
                    $c.find(".btnRound").remove();
                }

                for (var j = 0; j < cvnfs[i].nestedVNFTypeLinks.length; j++) {
                    var l = cvnfs[i].nestedVNFTypeLinks[j];
                    var src = l.nestedVNFTypeConnector1.nestedVNFType;
                    var dst = l.nestedVNFTypeConnector2.nestedVNFType;
                    var srcName = '', dstName = '';

                    if (src) {
                        srcName = src.displayName;
                        nodeList[srcName] = {type: 'VNF', description: src.vnfTypeBase.displayName};
                    }
                    else {
                        srcName = cvnfs[i].portNames[l.nestedVNFTypeConnector1.portIndex];
                        nodeList[srcName] = {type: 'Endpoint', description: ''};
                    }

                    if (dst) {
                        dstName = dst.displayName;
                        nodeList[dstName] = {type: 'VNF', description: dst.vnfTypeBase.displayName};
                    }
                    else {
                        dstName = cvnfs[i].portNames[l.nestedVNFTypeConnector2.portIndex];
                        nodeList[dstName] = {type: 'Endpoint', description: ''};
                    }

                    nodeMap.links.push({from:srcName, to:dstName});
                }

                for (var k in nodeList) if (nodeList.hasOwnProperty(k)) {
                    nodeMap.nodes.push({name: k, type: nodeList[k].type, description: nodeList[k].description});
                }

                $c.appendTo($listing);

                osa.ui.map.create(mapId, nodeMap, mapId+"Cori").render(true);
            }
        });
    };

    updateTable();

})(osa.auth.getPageAccess('centralOfficeCompositeVNFTypes'));

