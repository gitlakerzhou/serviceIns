//@ sourceURL=http://localhost:8080/ajax/locations-centralOffices.js
//var run_cos = function() {    

// This is called on load
(function(access) {
    var isWriteAccess = access.write;
    
    $("#location-add-co-btn .bigBtnTxt").html($.i18n._("loc.create.co"));
    
    // this reload data function came with the original code from Josh and has
    // been edited to alphabetise the data returned from the ajax call so the 
    // options in the select box are in alphabetical order
    var reloadData = function() {
        osa.ajax.list('centralOffices', function(coData) {
            
            if (coData.length == 0) {
                $("#centraloffice-block").html("<div class='mainInfo'>There are no central offices at this time.</div>");
            }
            else {
                coData.sort(function(a, b) {
                    if (a.displayName > b.displayName)            return 1;
                    else if (a.displayName == b.displayName)    return 0;
                    else                                        return -1;
                });

                for (var i=0; i<coData.length; i++) {
                    renderCardForLocation(coData[i], isWriteAccess);
                }    
            }
        });
    };

    // This came from the original set of code from Josh.  It manages the click event
    // for the delete button
    osa.page.addPageEvent(".block-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".list-block").data('id');
        ev.preventDefault();

        if (who) {
            if (confirm($.i18n._("loc.prmpt.dltSrvc"))) {
                osa.ajax.remove('centralOffices', who, function() {
                    $("#centraloffice-block").empty();
                    reloadData();
                });
            }
        }
    });


    // This came from Ritu's code in Josh's file.  It manages the click event for the add location button.
    // It was updated to be globalized.
    // TODO: change from popup to inline form
    osa.page.addPageEvent('#location-add-co-btn', 'click', function(ev) {
        ev.preventDefault();

        var p = osa.ui.formPopup.create($.i18n._("loc.hdr.add.co"), null, {submitLabel: $.i18n._("btn.save")});
        p.addField('co-name', $.i18n._("cmn.name"), 'string');
        p.setRequiredFields(['co-name']);
        p.setSubmitAction(function(fields) {
            var o = {
                'displayName': fields['co-name'],
                'locationCollection': [],
            };

            osa.ajax.add('centralOffices', o, function() {
                p.hide();
                $("#centraloffice-block").empty();
                reloadData();
            });
        });
        p.show();
    });

    
    // this came from Josh's code and is used to call the internal function in this function.
    reloadData();

})(osa.auth.getPageAccess('centralOffices'));


// This function is the function that renders the locations <table> and headers in each card.
// the delete column header only exists if the user has write access.
function updateTableWithLocations(data, target, isWriteAccess) {
    // show message
    $("#" + target).find(".successMsg").show("slow");

    // -----------
    // table
    // -----------
    var table = $("#" + target).find("table");
    var delText = "";
    
    if (isWriteAccess) delText = $.i18n._("cmn.delete");
    
    
    // if a table does not exist, put in a table.  This occurs when no data existed poreviously.
    if (table.length == 0) {
        $("#" + target).append('<table cellspacing="0"></table>');
        table = $("#" + target).find("table");
    }

    // get rid of any residual data
    table.empty();
    
    // put in the header as we just emptied it out.
    table.append('<tbody><tr><th class="innerTableHeader">' + $.i18n._("loc.name") + '</th><th class="innerTableHeader">' + $.i18n._("loc.co.remote") + '</th><th class="innerTableHeader">' + delText + '</th></tr></tbody>');
    
    // go put in the data.
    repopulateLocationTable(data, table, isWriteAccess);

    // clear up form
    var form = table.closest(".list-block");
    var id = form.data("id");
    $("#loc_name_" + id).val("");
    $("#loc_is_remote" + id).removeAttr("checked");

    // hide success
    setTimeout(function(){$("#" + target).find(".successMsg").hide("slow");}, 2000);
}

// Called only once from initial load via "reloadData" in main load function
function renderCardForLocation(data, isWriteAccess) {
    var target = $("#centraloffice-block");
    var id = data.key;
    
    target.append('<div id="coBlock-' + id + '" class="list-block"></div>');
    var card = $("#coBlock-" + id);
    card.append('<div class="displayName" id="coCard' + id + '">' + data.displayName + '</div>');
    card.data("id", id);
    
    // render buttons in button gutter
    if (isWriteAccess) {
        card.append('<div class="btnContainer btnGutter"></div>');
        card.find(".btnContainer").append('<a class="add-location-btn button btnAdd" href="#"><span class="typcn typcn-plus"></span>' + $.i18n._("loc.btn.add.loc") + '</a>');
        card.find(".btnContainer").append('<a href="#"  class="block-delete-btn button btnAdd btnCancel" href="#devices-add-customOpt"><span class="typcn typcn-times"></span>' + $.i18n._("cmn.cntrl.offc") + '</a>');        
    }

    
    // render location form
    card.append('<form class="inputBlock hide"></form>');
    
    var form = card.find(".inputBlock");
    
    form.addTextInput("loc_name_" + id, "cmn.name", false); //, cls, hlp)
    form.addCheckbox("loc_is_remote" + id, "loc.co.remote", false, "hide"); //, cls, hlp)
    form.append('<input id="cancel_loc_btn' + id + '" class="cancelBtn button btnSm fr" type="submit" value="' + $.i18n._("btn.close") + '">');
    form.append('<input id="save_loc_btn' + id + '" class="button btnSm btnSave fr" type="submit" value="' + $.i18n._("loc.btn.save.loc") + '">');
    
    // attach success message
    card.append('<div class="successMsg hide">' + $.i18n._("loc.msg.success.loc") + '</div>');
    
    // add table on initial load
    if (data.locationCollection.length > 0) {
        card.append('<table cellspacing="0"><tbody><tr><th class="innerTableHeader">' + $.i18n._("cmn.name") + '</th><th class="innerTableHeader">' + $.i18n._("loc.co.remote") + '</th><th class="innerTableHeader"></th></tr></tbody></table>');
        repopulateLocationTable(data, card.find("table"), isWriteAccess);
    }
    
    
    // VALIDATION
    form.validate();
//    $("#loc_name_" + id ).rules("add", "required");
    
    $("#loc_name_" + id ).rules( "add", {
        required: true,
        messages: {
            required: "Required"
        }
    });
    
    
    // LOCATIONS BUTTONS
    // click functions for buttons on location form.
    $("#cancel_loc_btn" + id).click(function(ev){
         ev.preventDefault();
        $("#loc_name_" + id).val("");
        $("#loc_is_remote" + id).removeAttr("checked");
        $(this).closest(".inputBlock").hide("slow");
    });
    
    $("#save_loc_btn" + id).click(function(ev){
        ev.preventDefault();
        
        var card = $(this).closest(".list-block");
        
        if (card.find(".inputBlock").valid()) {
            var id = card.data("id");
            var name = $("#loc_name_" + id).val();
            var remote = $("#loc_is_remote" + id).is(":checked");
            

            var o = {
                    "displayName": name,
                    "isCentralOfficeLocation": remote,
                    "centralOfficeKey"    : id
            };
            
            osa.ajax.add('centralOfficeLocations', o, function() {
                
                // want an API for just one guy, but does not exist, so call for all, then find the one guy I need and update his one card.
                
                osa.ajax.list('centralOffices', function(coData) {
                    for (var x=0; x<coData.length; x++) {
                        if (coData[x].key == id) {
                            updateTableWithLocations(coData[x], "coBlock-" + id, isWriteAccess);
                            break;
                        }
                    }
                });
            });
        }
    });
    
    card.find(".add-location-btn").click(function(ev){
        ev.preventDefault();
        var card = $(this).closest(".list-block");
        var inputBlock = card.find(".inputBlock");
        
        inputBlock.show("slow").css("display", "inline-block");
    });

}


//  This function renders the locations table in the card.
function repopulateLocationTable(data, table, isWriteAccess) {

    for (var j=0; j<data.locationCollection.length; j++) {
        var id = data.locationCollection[j].key;
        var isLocCO = data.locationCollection[j].isCentralOfficeLocation;
        var isChecked = isLocCO ? $.i18n._("cmn.yes") : $.i18n._("cmn.no");
        var delLocStr = $.i18n._("btn.deleteCtx", $.i18n._("loc.location"));
        var delBtn = ('<a id="del_loc_' + data.locationCollection[j].key + '" class="delete_loc_btn btnRound fr" href="#" title="' + delLocStr + '" alt="' + delLocStr + '"><img src="images/delete.png"></a>');
        
        
        // delete button only for write access
        if (isLocCO || !isWriteAccess) 
            table.append("<tr><td>" + data.locationCollection[j].displayName + "</td><td>" + isChecked + "</td><td></td></tr>");
        else {
            table.append("<tr><td>" + data.locationCollection[j].displayName + "</td><td>" + isChecked + "</td><td>" + delBtn + "</td></tr>");
            
            // code to support delete location action
            $("#del_loc_" + id).data("id", id);
            
            $("#del_loc_" + id).click(function(ev){
                var locId = $(this).data("id");
                
                var curListBlock = $(this).closest(".list-block");
        
                
                if (confirm($.i18n._("loc.prmpt.del.loc"))) {
                    osa.ajax.remove('centralOfficeLocations', locId, function(ev, locId, a, b) {
                        
                        // went well
                        var coId = curListBlock.data("id");
        
                        osa.ajax.list('centralOffices', function(coData) {
                            for (var x=0; x<coData.length; x++) {
                                if (coData[x].key == coId) {
                                    updateTableWithLocations(coData[x], "coBlock-" + coId, isWriteAccess);
                                    break;
                                }
                            }
                        });
                    });
                }
            });
        }
    }
}

//};