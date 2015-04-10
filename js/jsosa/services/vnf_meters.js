// ------------------------------------------------
// ON LOAD
// ------------------------------------------------
$(function() {
    // deal with the rendering
    var firstLoad = true;
    var interval = 20;
    
    // deal with the info from the URL
    var mainSpl = document.URL.split('?')[1];
    var params  = mainSpl.split("&");
    var vnfId   = params[0].split("=")[1].split("%20").join(" ");
    var soName  = params[1].split("=")[1].split("%20").join(" ");
    var vnfName = params[2].split("=")[1].split("%20").join(" ");
    var optSelected = "avg";
    
    var optList = [{key: "avg", "displayName": "mtrc.type.avg"}, {key: "min", "displayName": "mtrc.type.min"}, {key: "max", "displayName": "mtrc.type.max"}];
    var freqList = [{key: "10", "displayName": "mtrc.ten.secs"}, {key: "30", "displayName": "mtrc.thirty.secs"}, {key: "60", "displayName": "mtrc.sixty.secs"}];
    
    document.title = vnfName;
    $("#vnfTitle").html(vnfName + " (" + soName + ")");
    
    $("#dataLoading").html($.i18n._("cmn.loading"));
    
    // get filter up
    var filter = $("#listFilter");
    filter.append('<div class="filterShowMe fl" >' + $.i18n._("cmn.fltr.show.me") + ' </div>');
    filter.append("<div id='fltrs' class='fl'></div>");
    $("#fltrs").addSelect("metricType", "mtrc.lbl.type", false, false, optList, "avg", "filterIndent");
    $("#fltrs").addSelect("frequency", "mtrc.lbl.freq", false, false, freqList, "30", "filterIndent");
    
    var frequency = $("#frequency").val();
    
    
    $("#metricType").change(function () {
        optSelected = $(this).val();
        firstLoad = true;
        mapCpu = [];
        mapDsk = [];
        mapNw  = [];
        diskReadBytesRateData     = [];
        diskWriteBytesRateData    = [];
        diskReadRequestsRateData  = [];
        diskWriteRequestsRateData = [];
        cpuDataArrays = [];
        nwDataArrays  = [];
        
        clearInterval(poll);
        getMoreData(); // instant gratification
        poll = setInterval(function(){getMoreData();}, $("#frequency").val()*1000);
    });

    // deal with the data
    var mapCpu = [];
    var mapDsk = [];
    var mapNw  = [];
    var diskReadBytesRateData     = [];
    var diskWriteBytesRateData    = [];
    var diskReadRequestsRateData  = [];
    var diskWriteRequestsRateData = [];
    
    var cpuDataArrays = [];
    var nwDataArrays  = [];
    var nwIter   = 0;
    var cpuIter  = 0;
    var diskIter = 0;
    
    var cpuChartTarget  = $("#cpuChartContainer");
    var diskChartTarget = $("#diskChartContainer");
    var nwChartTarget   = $("#nwChartContainer");
    
    
    // deal with the charts
    var updateChart = function(target, data) {
        target.setData(data);
        target.setupGrid();
        target.draw();
    };
    
    // --------------------------------------------------
    // OPTIONS
    // --------------------------------------------------
    // All plots need these core options sent to FLOT
    var options = {
            series: {shadowSize: 0},
            xaxis:  {show: false},
            lines:  {show: true},
            points: {show: true},
            grid: {hoverable: true},
            colors: ["#EDC240", "#5397B1"],
    };
    
    // In the case of %, add an option to bind the y axis from 0 - 100
    var optionsPercent = $.extend(true, {}, options);
    optionsPercent["yaxis"] = {min:0};
    
    // In the case of bytes read/write rate, add an option to bind the y axis from 0 - 20,000
    var optionsBytesRwRate = $.extend(true, {}, options);
    optionsBytesRwRate["yaxis"] = {min:0};
    
    // In the case of requests read/write rate, add an option to bind the y axis from 0 - 100
    var optionsRequestsRwRate = $.extend(true, {}, options);
    optionsRequestsRwRate["yaxis"] = {min:0};
    
    // In the case of bytes, add an option to bind the y axis from 0 - 20,000
    var optionsBytes = $.extend(true, {}, options);
    optionsBytes["yaxis"] = {min:0};
    
    // In the case of bytes, add an option to bind the y axis from 0 - 100
    var optionsPackets = $.extend(true, {}, options);
    optionsPackets["yaxis"] = {min:0};
    
    
    // --------------------------------------------------
    // HOVER OVER POINT - see y axis value
    // --------------------------------------------------
    var bindHover = function(target) {
        var targetId = $(target).attr("id");
        
        $("<div id='tooltip_" + targetId + "'  class='metricsTooltip'></div>").appendTo("body");

        $(target).bind("plothover", function (event, pos, item) {
                if (item) {
                    $("#tooltip_" + targetId).html(item.datapoint[1]).css({top: item.pageY+5, left: item.pageX+10}).fadeIn(200);
                } else {
                    $("#tooltip_" + targetId).hide();
                }
        });

        $(target).bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });
    };
    
    
//    var plotDiskReadBytesRate     = $.plot("#dskReadBytesRate", [diskReadBytesRateData],    optionsBytesRwRate);
//    var plotDiskReadRequestsRate  = $.plot("#dskReadReqRate",   [diskReadRequestsRateData], optionsRequestsRwRate);
//    
//    bindHover("#dskReadBytesRate");
//    bindHover("#dskReadReqRate");
    
    

    var renderCpu = function(target, hasCpu, mapCpu) {
        target.empty(); // for times when we have to redraw because a different parameter was selected
        target.show("slow");
        if (hasCpu) target.append("<div class='titleBar'>" + $.i18n._("mtrc.hdr.cpu") + "</div>");
        for (c in mapCpu) {
            var id = mapCpu[c].meterName;
            var chart = $("#" + id);
            
            chart = $("#chartTemplate").clone().attr("id", id).removeClass("hide");
            
            target.append(chart);
            
            cpuDataArrays[id] = [];
            
            // save unit for later so we can determine min and max on the y axis.
            var unit = mapCpu[c].meterUnit;
            chart.data("unit", unit);
                        
            chart.children(".yaxisLabel").html($.i18n._("mtrc." + unit));
            chart.children(".chartTitle").html($.i18n._(optSelected + "." + mapCpu[c].meterName));
        }
    };
    
    
    var renderNetwork = function(bytesId, pktsId) {
        var chartBytes = $("#" + bytesId);
        var chartPkts  = $("#" + pktsId);
        
//        nwChartTarget.empty(); // for times when we have to redraw because a different parameter was selected
        nwChartTarget.show("slow");
        chartBytes = $("#chartTemplate").clone().attr("id", bytesId).removeClass("hide");
        chartPkts  = $("#chartTemplate").clone().attr("id", pktsId).removeClass("hide");
        
        
        var chartSetBox = $("<div>", {class: "chartSetBox fl mr10px"});
        chartSetBox.append("<div class='titleBar'>" + $.i18n._("mtrc.hdr.nw") + " (" + n + ")</div>");
        chartSetBox.append(chartBytes);
        chartSetBox.append(chartPkts);
        
        nwChartTarget.append(chartSetBox);
        
        nwDataArrays[bytesId] = [];
        nwDataArrays[bytesId]["incoming"] = [];
        nwDataArrays[bytesId]["outgoing"] = [];
        nwDataArrays[pktsId] = [];
        nwDataArrays[pktsId]["incoming"] = [];
        nwDataArrays[pktsId]["outgoing"] = [];
        
        chartBytes.children(".yaxisLabel").html($.i18n._("mtrc." + mapNw[n].networkIncomingBytesRate.meterUnit));
        chartBytes.children(".chartTitle").html($.i18n._(optSelected + ".nw.bytes"));
        chartPkts.children(".yaxisLabel").html($.i18n._("mtrc." + mapNw[n].networkIncomingPacketsRate.meterUnit));
        chartPkts.children(".chartTitle").html($.i18n._(optSelected + ".nw.packets"));    
    };

    
    
    // deal with the reload of data
    function getMoreData() {
        $.get("/osa/api/sampleSet/list/" + vnfId + "/" + optSelected, function(avgData) {
            
            if (avgData.length == 0) {
                $("#loadingContainer").hide();
                $("#dataLoadFail").html($.i18n._("mtrc.msg.no.data")).show("slow");
                $("#diskChartContainer").hide();
            }
            
            else {
                // reformat the data to be usable
                var hasCpu = false;
                var hasDisk = false;
                var hasNw = false;
                var cpuCount = 0;
                var diskCount = 0;
                var nwCount = 0;
                
                $("#dataLoadFail").html("").hide("slow");
                
                // ---------------------------------------------------
                // MAP DATA INTO MANAGEABLE SET
                // ---------------------------------------------------
                for (var i=0; i<avgData.length; i++ ) {
                    var curData = avgData[i];
                    
                    var meterType = curData.meterType;
                    var meterName = curData.meterName;
                    

                    
                    if (meterType == "cpu"){
                        mapCpu[meterName] = curData;
                        hasCpu = true;
                        cpuCount = cpuCount + 1;
                    }
                    else if (meterType == "disk") {
                        mapDsk[meterName] = curData;
                        hasDisk = true;
                        diskCount = diskCount + 1;
                    }
                    else {
                        if (mapNw[curData.portIpAddress] === undefined) {
                            mapNw[curData.portIpAddress] = [];
                        }
                        mapNw[curData.portIpAddress][meterName] = avgData[i];
                        hasNw = true;
                        nwCount = nwCount + 1;
                    }
                }
                
                // if data goes away, make sure to clear the charts
                if (!hasCpu) {
                    mapCpu = [];
                    cpuChartTarget.hide("slow").empty();
                }
                if (!hasDisk) {
                    mapDsk = [];
                    diskChartTarget.hide("slow").empty();
                }
                if (!hasNw) {
                    mapNw = [];
                    nwChartTarget.hide("slow").empty();
                }
                
                $("#loadingContainer").hide();
                
                // ---------------------------------------------------
                // PLOT CPU
                // ---------------------------------------------------
                if (firstLoad) {
                    renderCpu(cpuChartTarget, hasCpu, mapCpu);    
                }
                
                for (c in mapCpu) {
                    var id = mapCpu[c].meterName;
                    var curElem = cpuDataArrays[id];
                    
                    if (curElem === undefined) {
                        renderCpu(cpuChartTarget, hasCpu, mapCpu);
                        curElem = cpuDataArrays[id];
                    }
                    
                    // they will all be the same length
                    if (curElem.length == interval) {curElem.shift();}
                    
                    // build data
                    curElem.push([cpuIter, mapCpu[c].meterValue]);
                    
                    // hover over a single dot to see value
                    bindHover("#" + id);
                    
                    // if it is a percent unit, make it between 0 and 100
                    var unit = $("#" + id ).data("unit");
                    var optionsToUse = options;
                    if (unit == "percent") optionsToUse = optionsPercent;
                    
                    // Render 1 point
                    $.plot("#" + id + " .vnfChart", [{label: $.i18n._(""), data: curElem}], optionsToUse);
                }
                
                
                // ---------------------------------------------------
                // PLOT DISK
                // ---------------------------------------------------
                var plotDiskReadBytesRate;
                var plotDiskReadRequestsRate; 
                if (firstLoad) {
                    var dskReadBytesRate = $("#dskReadBytesRate");
                    var dskReadReqsRate  = $("#dskReadReqRate");

                    if (hasDisk) {
                        dskReadBytesRate.siblings(".chartTitle").html($.i18n._(optSelected + ".bytes.rwr"));
                        dskReadBytesRate.siblings(".yaxisLabel").html($.i18n._("mtrc." + mapDsk["diskReadBytesRate"].meterUnit));
                        dskReadBytesRate.data("unit", mapDsk["diskReadBytesRate"].meterUnit);
                        
                        
                        dskReadReqsRate.siblings(".chartTitle").html($.i18n._(optSelected + ".req.rwr"));
                        dskReadReqsRate.siblings(".yaxisLabel").html($.i18n._("mtrc." + mapDsk["diskReadRequestsRate"].meterUnit)); 
                        dskReadReqsRate.data("unit", mapDsk["diskReadRequestsRate"].meterUnit);
                        
                        
                        diskChartTarget.removeClass("hide");
                    }
                    else {
                        diskChartTarget.addClass("hide");
                    }
           
                }

                if (hasDisk) {
                    if (diskReadBytesRateData.length == interval) {
                        diskReadBytesRateData.shift();
                        diskWriteBytesRateData.shift();
                        diskReadRequestsRateData.shift();
                        diskWriteRequestsRateData.shift();
                        
                        diskIter = diskReadBytesRateData[interval-2][0] + 1;
                    }
                }
                
                


                if (hasDisk) {
                    diskChartTarget.show(); // just in case
                    
                    diskReadBytesRateData.push([diskIter, mapDsk["diskReadBytesRate"].meterValue]);
                    diskWriteBytesRateData.push([diskIter, mapDsk["diskWriteBytesRate"].meterValue]);
                    diskReadRequestsRateData.push([diskIter, mapDsk["diskReadRequestsRate"].meterValue]);
                    diskWriteRequestsRateData.push([diskIter, mapDsk["diskWriteRequestsRate"].meterValue]);
                    
                    var plotDiskReadBytesRate     = $.plot("#dskReadBytesRate", [diskReadBytesRateData],    optionsBytesRwRate);
                    var plotDiskReadRequestsRate  = $.plot("#dskReadReqRate",   [diskReadRequestsRateData], optionsRequestsRwRate);
                    
                    bindHover("#dskReadBytesRate");
                    bindHover("#dskReadReqRate");
                    
                    updateChart(plotDiskReadBytesRate, [{label: $.i18n._("mtrc.chrt.read"), data: diskReadBytesRateData}, {label: $.i18n._("mtrc.chrt.write"), data: diskWriteBytesRateData}]);
                    updateChart(plotDiskReadRequestsRate,  [{label: $.i18n._("mtrc.chrt.read"), data: diskReadRequestsRateData}, {label: $.i18n._("mtrc.chrt.write"), data: diskWriteRequestsRateData}]);

                }

                
                // ---------------------------------------------------
                // PLOT NETWORK
                // ---------------------------------------------------
                if (firstLoad) {
                    nwChartTarget.empty();
                }
                for (n in mapNw) {
                    var bytesId    = "bytes_" + n.split(".").join("_");
                    var pktsId     = "pkts_"  + n.split(".").join("_");
                    
                    if (firstLoad) {
                        renderNetwork(bytesId, pktsId);
                    }
                    
                    
                    // new data just turned on
                    if (nwDataArrays[bytesId] === undefined) {
                        renderNetwork(bytesId, pktsId);
                    }

                    // they will all be the same length
                    if (nwDataArrays[bytesId]["incoming"].length == interval) {
                        nwDataArrays[bytesId]["incoming"].shift();
                        nwDataArrays[bytesId]["outgoing"].shift(); 

                        nwDataArrays[pktsId]["incoming"].shift();
                        nwDataArrays[pktsId]["outgoing"].shift();

                    }
                    
                    nwDataArrays[bytesId]["incoming"].push([nwIter, mapNw[n].networkIncomingBytesRate.meterValue]);
                    nwDataArrays[bytesId]["outgoing"].push([nwIter, mapNw[n].networkOutgoingBytesRate.meterValue]);
                    nwDataArrays[pktsId]["incoming"].push([nwIter, mapNw[n].networkIncomingPacketsRate.meterValue]);
                    nwDataArrays[pktsId]["outgoing"].push([nwIter, mapNw[n].networkOutgoingPacketsRate.meterValue]);
                    
                    bindHover("#" + bytesId);
                    bindHover("#" + pktsId);

                    
                    $.plot("#" + bytesId + " .vnfChart", [{label: $.i18n._("mrtc.chrt.in"), data: nwDataArrays[bytesId]["incoming"]}, {label: $.i18n._("mrtc.chrt.out"), data: nwDataArrays[bytesId]["outgoing"]}], optionsBytes);
                    $.plot("#" + pktsId + " .vnfChart",  [{label: $.i18n._("mrtc.chrt.in"), data: nwDataArrays[pktsId]["incoming"]},  {label: $.i18n._("mrtc.chrt.out"), data: nwDataArrays[pktsId]["outgoing"]}],  optionsPackets);
                }
                
                nwIter = nwIter + 1;
                cpuIter = cpuIter + 1;
                diskIter = diskIter + 1;
                

            }
            
            if (firstLoad) {
                firstLoad = false;
            }
            

    }).fail(function() {
        $("#loadingContainer").hide();
        $("#dataLoadFail").html($.i18n._("mtrc.msg.fail.call")).show("slow");
        $("#diskChartContainer").hide("slow");
        $("#nwChartContainer").hide("slow");
        $("#cpuChartContainer").hide("slow");
        $("#listFilter").hide("slow");
        
        for (var nwData in nwDataArrays) { 
            nwDataArrays[nwData].incoming = [];
            nwDataArrays[nwData].outgoing = [];
        }
        
        cpuDataArrays.cpu = [];
        cpuDataArrays.cpuUtil = [];
        
        diskReadBytesRateData = [];
        diskWriteBytesRateData = [];
        diskReadRequestsRateData = [];
        diskWriteRequestsRateData = [];
    });
    }// end function get more data


    $("#cpuChartHdr").html($.i18n._("mtrc.hdr.cpu"));
    $("#diskChartHdr").html($.i18n._("mtrc.hdr.disk"));
    
    getMoreData();
    var poll = setInterval(function(){getMoreData();}, frequency*1000);

    $("#frequency").change(function() {
        clearInterval(poll);
        getMoreData(); // instant gratification
        poll = setInterval(function(){getMoreData();}, $(this).val()*1000);
    });

});
