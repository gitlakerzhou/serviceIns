//function run_clouds() {

(function(access) {
//    var isMultiTenant = !access.singleTenantView;
//    var isWriteAccess = access.write;
    var $listing = $("#clouds-list");
    
    
    var actionBar = $("#action-container");
    if (actionBar.length !== 0) {
        actionBar.append('<a href="#clouds-create" id="location-add-cloud-btn" class="button btnMain"><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._("cld.btn.create") + '</div></a>');        
        
    }
    
    $("#cloudsListLimits").appendLicenseStatus("ESO", ["maxClouds"], "cloudListLimitTable");
    
    var pagingTarget = $("#tablePaging");    
    pagingTarget.addPaging(false, true, [".showMore"]);

    var deleteCloud = function(ev) {
        var id = $(ev.target).closest(".btnRound").data("id");
        if (confirm($.i18n._("cld.msg.del.cld"))) {
            osa.ajax.remove('clouds', id, updateTable);
        }
    };

    var updateTable = function() {
        $listing.empty();
        var table = $("#cloudTable");
        var showClass = "";
        
        if (!$("#showTableLess").is("visible")) {
            showClass = "hide";
        }


        osa.ajax.list('clouds', function(data) {
            var hasData = ($("#cloudTableHdrs").siblings().length > 0);
            
            if (hasData) {
                // deal with status bar above
                $("#cloudsListLimits").updateLicenseStatus("ESO", ["maxClouds"], "cloudListLimitTable");
                // now empty table
                $("#cloudTableHdrs").siblings().remove();
            }

            
            var isEven = true;
            
            for (var i=0; i<data.length; i++) {
                var curCloud = data[i];
                
                var vipBox = "<div class='vipBox showMore hide'><div class='cloudVipsHdr'>" + $.i18n._("cld.tbl.hdr.vip") + "</div>";
                var vips = curCloud.virtualIPRanges;
                
                for (var j=0; j<vips.length; j++) {
                    vipBox = vipBox + "<div class='vipLine'>" + vips[j].cidr + " / " + vips[0].blockSize + "</div>";
                }
                
                vipBox = vipBox + "</div>";
                
                var physConBox = "<div class='physConBox showMore hide'>";
                var physCons = curCloud.cloudPhysicalConnections;
                
                for (var j=0; j<physCons.length; j++) {
                    var curPhysData = physCons[j];
                    var curPortName = curPhysData.physicalDeviceCloudAccessPortName;
                    var curPortKey  = curPhysData.physicalDeviceCloudBackbonePortKey;
                    var accessPortStr = "";
                    var backbonePortStr = "";
                    
                    if (curPortName)
                        accessPortStr = ': ' + $.i18n._("cmn.accessPort") + ' <span class="physicalDeviceAccessPortName">' + curPortName + '</span>';
                    if (curPortKey)
                        backbonePortStr = ' : ' + $.i18n._("cmn.backbonePort") + ' <span class="physicalDeviceBackbonePortName">' + curPortKey + '</span>';
                        
                    
                    physConBox = physConBox + '<div class="physConBlock">' + 
			'<span class="physicalDeviceName">' + physCons[j].physicalDeviceName + '</span>' + 
			' : Access Port <span class="physicalDeviceAccessPortName">' + physCons[j].physicalDeviceCloudAccessPortName + '</span>' +
			' : Backbone Port <span class="physicalDeviceBackbonePortName">' + physCons[j].physicalDeviceCloudBackbonePortName + '</span>' +
			'<span class="typcn typcn-arrow-left"></span>' +
			'<span class="typcn typcn-arrow-right"></span>' +
			'<span class="cloudSwitchName">' + physCons[j].cloudSwitchName + '</span></div>';
                }
                
                physConBox = physConBox + "</div>";
                
                var cloudLocs = "";
                
                for (var j=0; j<curCloud.cloudLocations.length; j++) {
                    cloudLocs = cloudLocs + "<div class='pl20px cldLoc'>" + curCloud.cloudLocations[j].displayName + "</div>";
                }
                
                
                // STRIPE ROWS
                var trClass = "odd";
                if (isEven) trClass = "even";
                
                table.append("<tr id='cloudId_" + data[i].key + "' class='" + trClass + " allowHover'><td><div class='cloudListName'>" +
			     curCloud.displayName + "</div>" + physConBox + "</td><td>" + curCloud.authorizationURL + vipBox + "</td>" +
			     "<td class='showMore " + showClass + "'>" + 
			     cloudLocs
			     + "</td>" +   
			     "<td align='center'><a href='#clouds-edit/key=" + data[i].key + "'><div class='btnRound btnEdit'><img src='images/edit.png'/></div></td></a>" + 
			     "<td align='center'><div class='btnRound btnDelete'><img src='images/delete.png'/></div></td></tr>");
                
                $("#cloudId_" + data[i].key).data("data", data[i]);
                $("#cloudId_" + data[i].key + " .btnDelete").data('id', curCloud.key).click(deleteCloud);
                
                isEven = !isEven;

            }
            
        });


    };
    

    $("#cloudLocations").html($.i18n._("cld.tbl.hdr.locs"));
    $("#tenantNameHdr").html($.i18n._("cmn.name"));
    $("#tenantUrlHdr").html($.i18n._("cld.tbl.hdr.url"));
    $("#cloudEditHdr").html($.i18n._("cmn.edit"));
    $("#cloudDeleteHdr").html($.i18n._("cmn.delete"));
    $("#noCloudsMsg").html($.i18n._("cld.msg.no.clouds"));
    

    updateTable();


})(osa.auth.getPageAccess('clouds'));

//};