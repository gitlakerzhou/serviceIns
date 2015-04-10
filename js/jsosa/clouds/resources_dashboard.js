//@ sourceURL=http://localhost:8080/ajax/resources-dashboard.js

//var run_cloudResources = function() {
    


(function(access) {

    
    var renderPage = function() {       
        $("#cloudNameHdr").html($.i18n._("cld.hdr.name"));
        $("#diskspaceHdr").html($.i18n._("cld.hdr.diskspace"));
        $("#cpuHdr").html($.i18n._("cld.hdr.cpu"));
        $("#ramHdr").html($.i18n._("cld.hdr.ram"));
        
        $("#diskspaceAvailHdr").html($.i18n._("cld.hdr.avail"));
        $("#diskspaceTotalHdr").html($.i18n._("cld.hdr.total"));
        $("#diskspaceUsedHdr").html($.i18n._("cld.hdr.used"));

        $("#cpuAvailHdr").html($.i18n._("cld.hdr.avail"));
        $("#cpuTotalHdr").html($.i18n._("cld.hdr.total"));
        $("#cpuUsedHdr").html($.i18n._("cld.hdr.used"));
        
        $("#ramAvailHdr").html($.i18n._("cld.hdr.avail"));
        $("#ramTotalHdr").html($.i18n._("cld.hdr.total"));
        $("#ramUsedHdr").html($.i18n._("cld.hdr.used"));
        
        $("#noCosWarning div").html($.i18n._("cld.msg.info.no.cos"));
        $("#noCloudsWarning div").html($.i18n._("cld.msg.info.no.clouds"));
        
        $("#resources-dashboard label").html($.i18n._("cmn.cntrl.offc"));
        
        var pagingTarget = $("#tablePaging");    
        pagingTarget.addPaging(false, true, [".showMore"]);
        
//        $("#cloudsListLimits").appendLicenseStatus("ESO", ["maxClouds"], "cloudListLimitTable");
        
    };
    
    var populateCoList = function() {
        osa.ajax.list('centralOffices', function(cos) {
            if (cos.length == 0) {
                $("#noCosWarning").show("slow");
                $("#cloudResourceTable").hide();
                $("#noCloudsWarning").hide();
            }
            else {
                $("#noCosWarning").hide();
                $("#noCloudsWarning").hide();
                
                $("#resources-dashboard-centraloffice").populateSelect(cos, true);
                $("#resources-dashboard-centraloffice option:first").html($.i18n._("cmn.all"));
                
                renderTable();
                
                $("#resources-dashboard-centraloffice").change(function() {
                    renderTable();
                });
            }
        });
    };
    
    var renderTable = function() {
        
        osa.ajax.list('availableResources', [$("#resources-dashboard-centraloffice").val()], function(data) {
            var table = $("#cloudResourceTable");

            
            if (data.length == 0) {
                $("#noCosWarning").hide("slow");
                $("#cloudResourceTable").hide("slow");
                $("#noCloudsWarning").show("slow");
                table.find(".curData").remove();
            }
            else {
                $("#noCosWarning").hide("slow");
                $("#cloudResourceTable").show("slow");
                $("#noCloudsWarning").hide("slow");
                table.find(".curData").remove();
                table.find(".subData").remove();
                
                var isEven = true;
                var hideClass = "hide";
                if ($("#showTableLess").is(":visible")) hideClass="";
                
                for (var i=0; i<data.length; i++) {
                    var curData = data[i];
                    var name = curData.displayName;
                    
                    var avRes = {diskspace:0, cpu:0, ram:0, diskspaceColor:"", cpuColor:"", ramColor:""};
                    var totalRes = {diskspace:0, cpu:0, ram:0};
                    var cnRes = curData.computeNodeResources;

                    
                    // STRIPE ROWS
                    var trClass = "odd";
                    if (isEven) trClass = "even";
                    
                    for (var j = 0; j < cnRes.length; j++) {
                        avRes.diskspace += cnRes[j].availableDiskspace;
                        avRes.cpu += cnRes[j].availableVirtualCPUCount;
                        avRes.ram += cnRes[j].availableRam;
                        if (avRes.diskspace < 0)
                            avRes.diskspaceColor = "negativeMsg";
                        else
                            avRes.diskspaceColor ="";
                        
                        if (avRes.cpu < 0)
                            avRes.cpuColor = "negativeMsg";
                        else
                            avRes.cpuColor ="";
                        
                        if (avRes.ram < 0)
                            avRes.ramColor = "negativeMsg";
                        else
                            avRes.ramColor ="";                    

                        totalRes.diskspace += cnRes[j].totalDiskspace;
                        totalRes.cpu += cnRes[j].totalVirtualCPUCount;
                        totalRes.ram += cnRes[j].totalRam;
                    }
                    
               
//                    if (avRes.cpu > totalRes.cpu) {
//                        avRes.cpuColor = "negativeMsg";
//                    }
//                    if (avRes.ram > totalRes.cpu) {
//                        avRes.ramColor = "negativeMsg";
//                    }
//                    if (avRes.diskspace > totalRes.cpu) {
//                        avRes.diskspaceColor = "negativeMsg";
//                    }
                    
                    // append main always visible row
                    table.append("<tr class='curData " + trClass + "'><td class='cloudName'>" + name + "</td>" +
                            "<td class='txtAlgnRt " + avRes.diskspaceColor + "'>" + avRes.diskspace + "</td>" +
                            "<td class='txtAlgnRt'>" + totalRes.diskspace + "</td>" +
                            "<td>" + getPrettyPercent(100 - ((avRes.diskspace / totalRes.diskspace) * 100)) + "</td>" +
                            
                            "<td class='txtAlgnRt " + avRes.cpuColor + "'>" + avRes.cpu + "</td>" +
                            "<td class='txtAlgnRt'>" + totalRes.cpu + "</td>" +
                            "<td>" + getPrettyPercent(100 - ((avRes.cpu / totalRes.cpu) * 100)) + "</td>" +
                            
                            "<td class='txtAlgnRt " + avRes.ramColor + "'>" + avRes.ram + "</td>" +
                            "<td class='txtAlgnRt'>" + totalRes.ram + "</td>" +
                            "<td>" + getPrettyPercent(100 - ((avRes.ram / totalRes.ram) * 100)) + "</td>" +
                            "</tr>");
                    
                    
                    // append the hidden rows
                    for (var j = 0; j < cnRes.length; j++) {
                        var curCN = cnRes[j];
                        var cpuColor = "";
                        var ramColor = "";
                        var diskColor = "";

                        
                        if (curCN.totalRam < 0)
                            ramColor = "negativeMsg";
                        
                        if (curCN.totalVirtualCPUCount < 0)
                            cpuColor = "negativeMsg";
                        
                        if (curCN.totalDiskspace < 0)
                            diskColor = "negativeMsg";
                        
                        table.append("<tr class='subData showMore " + hideClass + " " + trClass + "'><td class=''>" + curCN.displayName + "</td>" +
                                "<td class='txtAlgnRt " + ramColor + "'>" + curCN.availableDiskspace + "</td>" +
                                "<td class='txtAlgnRt " + ramColor + "'>" + curCN.totalDiskspace + "</td>" +
                                "<td></td>" +
                                
                                "<td class='txtAlgnRt " + "none" + "'>" + curCN.availableVirtualCPUCount + "</td>" +
                                "<td class='txtAlgnRt " + "none" + "'>" + curCN.totalVirtualCPUCount + "</td>" +
                                "<td></td>" +
                                
                                "<td class='txtAlgnRt " + diskColor + "'>" + curCN.availableRam + "</td>" +
                                "<td class='txtAlgnRt " + diskColor + "'>" + curCN.totalRam + "</td>" +
                                "<td></td>" +
                                "</tr>");
                    }
                    
                    isEven = !isEven;

                    
                }
            }
            

        });
        
    };
    
    
    var getPrettyPercent = function(pcnt) {
        var barPcnt = 0;
        var sevPcnt = "";
        var colorStyle = "percentMeterGood";
        
        if (pcnt > 85) colorStyle = "percentMeterBad";
        else if (pcnt > 75) colorStyle = "percentMeterWarn"; 
        
        if (pcnt > 100) {
            barPcnt = 100; 
            sevPcnt = "negativeMsg";
        }
        else if (pcnt < 0) {
            barPcnt = 0; 
            sevPcnt = "negativeMsg";
        }
        else {
            barPcnt = pcnt;
            sevPcnt = "";
        }
        
        pcnt = Math.round(pcnt);
        
        return('<table><tr class="percentBar">' +
                '<td class="percentCol ' + sevPcnt + '">' + pcnt + '%</td>' +
                '<td><div class="percentMeter"><div class="percentMeterFiller ' + colorStyle + '" style="width:' + barPcnt + 'px"></div></div>' +
                '</td></tr></table>');
    };
    
    renderPage();
    populateCoList();

})(osa.auth.getPageAccess('availableResources'));

//};