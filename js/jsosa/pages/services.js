//@ sourceURL = osa-dynamicScripts/services.js

(function() {
    var $l = $("#serviceList");

    osa.ajax.list('services', function(d) {
        for (var i = 0; i < d.length; i++) {
            var $d = $("<div></div>");
            for (var j in d[i]) {
                if (d[i].hasOwnProperty(j)) {
                    $("<p></p>").html(j + ": " + d[i][j]).appendTo($d);
                }
            }
            $d.appendTo($l);
        }
    });
})();

