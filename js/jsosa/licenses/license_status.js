// Type: "ESO" or "EBI"
// Param: ["maxServices", "maxClouds"] (stuff like that)
$.fn.appendLicenseStatus = function(type, paramArr, id) {
    var appendLicenseStatus = osa.auth.userCapabilities["/api/licenses"].read;
    
    if (appendLicenseStatus) {
        var target = this;
        
        if (!id) id="";
        
        var getPrettyString = function(param, str) {
            var xlate = $.i18n._(str);
            
            if (xlate == str)    return param;
            else                 return xlate;
        };
        
        target.append('<table id="' + id + '" class="licenseLimitBar"></table>');
        var table = target.find("table"); // in case the ID is null or "";
                
        osa.ajax.list('licenses', function(data) {
            
            for (var i=0; i<data.length; i++) {
                var lic = data[i];
                
                // ESO or EBI
                if (lic.licenseType == type) { 
                    
                    // make the rows in the table
                    for (var j=0; j<paramArr.length; j++) {
                        var param = paramArr[j];
                        var pcnt = lic[param + "PercentUsed"];
                        var colorStyle = "percentMeterGood";
                        
                        if (pcnt > 85) colorStyle = "percentMeterBad";
                        else if (pcnt > 75) colorStyle = "percentMeterWarn"; 
                        
                        table.append('<tr class="' + param + '"><td class="percentMeterName">' + getPrettyString(param, "lic.stat." + param + ".allowed") + ':</td><td class="percentMeterVal fr"> ' + lic[param] + '</td>' +
                                '<td class="percentMeterTitle">' + getPrettyString(param, "lic.stat." + param + ".used") + ': </td>' +
                                '<td class="percentMeterPercent fr">' + pcnt + '%</td>' +
                                '<td class="visualData"><div class="percentMeter"><div class="percentMeterFiller ' + colorStyle + '" style="width:' + pcnt + 'px"></div></div>' +
                                '</td></tr>');
                    }
                } // end if
            } // end for
        });
    }
};


// we only have one license ever so might as well nip this in the bud and get [0]
$.fn.updateLicenseStatus = function(type, paramArr, id) {
    var appendLicenseStatus = osa.auth.userCapabilities["/api/licenses"].read;
    if (appendLicenseStatus) {
        var table = this.find(".licenseLimitBar");
        
         osa.ajax.list('licenses', function(data) {
             var lics = data[0];
             
             for (var j=0; j<paramArr.length; j++) {
                 var row = table.find("." + paramArr[j]);
                 var percentMeterVal = row.find(".percentMeterVal");
                 var percentMeterPercent = row.find(".percentMeterPercent");
                 
                 percentMeterVal.html(lics[paramArr[j]]);
                 var curPcnt = parseInt(percentMeterPercent.html());
                 var newPcnt = lics[paramArr[j] + "PercentUsed"] ;
                 if (curPcnt !== newPcnt) {
                     percentMeterPercent.html(newPcnt + "%");
                     
                     var prettyVis = row.find(".visualData");
                     var colorStyle = "percentMeterGood";
                     if (newPcnt > 85) colorStyle = "percentMeterBad";
                     else if (newPcnt > 75) colorStyle = "percentMeterWarn"; 
                     
                     prettyVis.html('<div class="percentMeter"><div class="percentMeterFiller ' + colorStyle + '" style="width:' + newPcnt + 'px"></div>');
                 }
             }
         });
    }
};