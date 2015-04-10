//function run_tenant() {
(function(access) {
    var isWriteAccess = access.write;
    var loadingBlock = $("#tenantLoading");
    var formDiv = $("#createTenantFormDiv");
    var createSuccess = $("#tenantTableUpdateSuccess");
    var createFailure = $("#tenantTableUpdateFailure");
    var deleteSuccess = $("#tenantTableDeleteSuccess");
    var deleteFailure = $("#tenantTableDeleteFailure");
    var editSuccess   = $("#tenantTableEditSuccess");
    var table = $("#tenantTable");
    var tenantTypes = [];

    
    
    loadingBlock.html($.i18n._("cmn.loading"));
    $("#tenantTableTitle").addFormTitle($.i18n._("user.tenants"));
    createSuccess.html($.i18n._("usr.msg.crt.success"));
    deleteSuccess.html($.i18n._("usr.msg.del.success"));
    editSuccess.html($.i18n._("usr.msg.edt.success"));
    
    
    // MAIN ACTION BUTTON
    if (isWriteAccess) {
        var btnStr = $.i18n._("user.tnnt.hdr.add");
        $("#action-container").empty().append('<div id="tenants-add-tenant" class="button btnMain" href=""><div class="twinkle"></div><div class="bigBtnTxt">' + btnStr + '</div></div>');
        var createButton = $("#tenants-add-tenant");        
    }



    // -----------------------------------------------------
    // RENDER TABLE
    // -----------------------------------------------------
    var isEven = true;
    var updateTable = function() {
        osa.ajax.list('tenants', function(data) {
            $("#tenantTableHdrs").siblings().remove();
            $("#tenantLoading").hide();
            
            var contactName = "";
            var contactPhone = "";
            
            
            
            for (var i=0; i<data.length; i++) {
                contactName = (data[i].primaryContactFirstName || "") + " " + (data[i].primaryContactLastName || "");
                contactPhone = data[i].primaryContactPhoneNumber || "";
                
                
                // STRIPE ROWS
                var trClass = "odd";
                if (isEven) trClass = "even";
                
                table.append("<tr id='tenantId_" + data[i].key + "' class='" + trClass + " allowHover'><td>" + data[i].tenantName + "</td>" + 
                        "<td class=''>" + tenantTypesMap[data[i].tenantType] + "</td>" +
                        "<td>" + contactName + "</td><td class=''>" + data[i].addressCity + "</td>" +
                        "<td class=''>" + data[i].addressState + "</td>" +
                        "<td class=''>" + contactPhone + "</td>" +
                        "<td><div class='btnRound btnEdit'><img src='images/edit.png'/></div></td>" + 
                        "<td><div class='btnRound btnDelete'><img src='images/delete.png'/></div></td></tr>");
                
                $("#tenantId_" + data[i].key).data("data", data[i]);
                
                isEven = !isEven;
            };
            
            // -----------------------------------------------------
            // DELETE ROW
            // -----------------------------------------------------
            table.find(".btnDelete").click(function(ev) {
                var id = $(this).closest("tr").data("data").key;
                
                if (confirm($.i18n._("user.msg.confirm.del"))) {
                   osa.ajax.remove('tenants', id, 
                           function() { 
                                   updateTable(); 
                                   deleteFailure.hide();
                                   deleteSuccess.show("slow");
                                   setTimeout(function(){
                                       deleteSuccess.hide("slow");
                                   }, 5000);                                       
                               }, 
                               function (resp) {
                                   deleteFailure.html($.i18n._("user.msg.del.fail") + " " + resp.responseJSON.status);
                                   deleteFailure.show("slow");
                                   setTimeout(function(){
                                       deleteFailure.hide("slow");
                                   }, 5000);
                   });
                }
            });
            
            
            table.find(".btnEdit").click(function(ev) {
                var data = $(ev.target).closest("tr").data("data");
                var p = osa.ui.formPopup.create($.i18n._("user.hdr.tenant.update"), null, {submitLabel: $.i18n._("btn.update")});

                
                
                p.$FIELDSET.append('<div class="header clear">' + $.i18n._("user.primary.cntc") + '</div>');
                p.addField('key', 'TenantID', 'hidden', data.key);
                p.addField('tenantName', $.i18n._("user.tenant.name"), 'static', data.tenantName);
                p.addField('addressStreet', $.i18n._("user.address"), 'string', data.addressStreet);
                p.addField('addressCity', $.i18n._("user.city"), 'string', data.addressCity);
                p.addField('addressState', $.i18n._("user.state"), 'string', data.addressState);
                p.addField('addressZip', $.i18n._("user.zip"), 'string', data.addressZip);
                p.$FIELDSET.append('<div class="header clear">' + $.i18n._("usr.sub.hdr.tenant.info") + '</div>');
                p.addField('primaryContactFirstName', $.i18n._("user.firstName"), 'string', data.primaryContactFirstName);
                p.addField('primaryContactLastName', $.i18n._("user.lastName"), 'string', data.primaryContactLastName);
                p.addField('primaryContactPhoneNumber', $.i18n._("user.phoneNum"), 'string', data.primaryContactPhoneNumber);
                
                var isCarrier = (osa.auth.getUserDetails().tenantType == "CARRIER");
                console.log("isCarrier: " + isCarrier)
                if (isCarrier) {
                    p.addField('tenantType', $.i18n._("user.tenant.type"), "select", tenantTypesOptions);
                    p.getField('tenantType').val(data.tenantType);
                }

                p.setSubmitAction(function(data) {
                    osa.ajax.update('tenants', data, updateTable);
                });

                p.show();
            });            
            
        });
    };
    
    
    
    
    
    
    
    
    // make sure you have tenant types before you render the table as you will need the types to translate the returned data for getTenants
    
    var tenantTypesMap = [];
    
    osa.ajax.list('tenantTypes', function(data) {
        for (var i=0; i<data.length; i++) {
            var key = data[i].key;
            tenantTypesMap[key] = data[i].name;
        }
        
        updateTable();
    });
    
    
    
    // ----------------------------------------------
    // CREATE FORM
    // ----------------------------------------------
    if (isWriteAccess) {
        formDiv.append("<form id='createTenantForm' class='inlineForm'></form>");
        var form = $("#createTenantForm");
        
        form.addFormTitle("user.tnnt.hdr.add");
        
        
        var leftDiv = $("<div/>", {id:"createTenantLeftForm", class:"addressHalf"}).appendTo(form);
        var rightDiv = $("<div/>", {id:"createTenantRightForm", class:"addressHalf"}).appendTo(form);

        
        
        leftDiv.append("<div class='subheader'>" + $.i18n._("usr.sub.hdr.tenant.info")  + "</div>");
        leftDiv.addTextInput("tenantName", "cmn.name", true);
        leftDiv.addTextInput("tenantAddress", "user.address");
        leftDiv.addTextInput("tenantCity", "user.city");
        leftDiv.addTextInput("tenantState", "user.state");
        leftDiv.addTextInput("tenantZip", "user.zip");
      
        rightDiv.append("<div class='subheader'>" + $.i18n._("usr.sub.hdr.prim.cntc")  + "</div>");
        rightDiv.addTextInput("tenantPrimaryName", "user.firstName");
        rightDiv.addTextInput("tenantSecondaryName",  "user.lastName");
        rightDiv.addTextInput("tenantPhone", "user.phoneNum");
        rightDiv.addSelect("tenantType", "cmn.type", "", true);
        
        var saveStr = $.i18n._("user.btn.save.tenant");
        var cancelStr = $.i18n._("btn.cancel");
        
        form.append("<div class='buttonTray clear'><div class='addBtn button btnSm' id='tenantCreateSave'>" + saveStr + "</div><div class='cancelBtn button btnSm' id='tenantCreateCancel'>" + cancelStr + "</div></div>");
        
        // ---------------------------------------
        // VALIDATION
        // ---------------------------------------
        form.validate({
            rules : {
                "tenantType" : {
                    required: true,
                },
                "tenantName" : {
                    required: true,
                }
            },
            messages: {
                "tenantType" : {
                    required: $.i18n._("err.msg.required"),
                },
                "tenantName" : {
                    required: $.i18n._("err.msg.required"),
                }
            },
            errorPlacement : function(error, element) {
                error.appendTo(element.parent());
            }
        });

        // ---------------------------------------
        // FORM BUTTONS
        // ---------------------------------------
        $("#tenantCreateCancel").click(function() {
            $("#createTenantFormDiv").hide("slow"); 
            createSuccess.hide(); 
            createFailure.hide();
            form.find("input").val("");
            form.find("select").val("");
           });

        createButton.click(function() {
            $("#tenantTypeOfUser").val("");
            $("#tenantTypeOfUser").val("");
            $("#tenantMultiTenant").removeAttr("checked");
            $("#createTenantFormDiv").show("slow");
            
        });
    }

    
    
    
    // populate the selects

    var tenantTypeSel = $("#tenantType");
    var tenantTypesOptions = [];


    osa.ajax.list('tenantTypes', function(data) {
        for (var i=0; i<data.length; i++) {
            tenantTypes.push({"displayName" : data[i].name, "key" : data[i].key});
            tenantTypesOptions.push({key: data[i].key, value:data[i].name});
        }
        tenantTypeSel.populateSelect(tenantTypes, true, "");
    });
    
    
    // ---------------------------------------------------
    // SUBMIT
    // ---------------------------------------------------
    $("#tenantCreateSave").click(function(ev) {
        ev.preventDefault();
        var form = $("#createTenantForm");
        
        if (form.valid()) {
            var o = {addressCity                : $("#tenantCity").val(),
                    addressState               : $("#tenantState").val(),
                    addressStreet              : $("#tenantAddress").val(),
                    addressZip                 : $("#tenantZip").val(),
                    primaryContactFirstName    : $("#tenantPrimaryName").val(),
                    primaryContactLastName     : $("#tenantSecondaryName").val(),
                    primaryContactPhoneNumber  : $("#tenantPhone").val(),
                    tenantName                 : $("#tenantName").val(),
                    tenantType                 : $("#tenantType").val()
           };
               
           // -----------------------------------------------
           // SAVE CREATE
           // -----------------------------------------------
           osa.ajax.add('tenants', o, function() {
               createSuccess.show("slow");
                  setTimeout(function(){
                      createSuccess.hide("slow");
                  }, 5000);

                  form.find("input").val("");
                  form.find("select").val("");
               
                  updateTable();
           }, 
           function(resp) {
               createSuccess.hide();
               createFailure.html($.i18n._("usr.msg.del.fail") + " " + resp.responseJSON.status);
               createFailure.show();
                  setTimeout(function(){
                      createFailure.hide("slow");
                  }, 5000);            
           });
        }
    });
    
    
    
    // ---------------------------------------------
    // I18N
    // ---------------------------------------------    
    $("#tenantCityHdr").html( $.i18n._("user.city"));
    $("#tenantNameHdr").html( $.i18n._("cmn.name"));
    $("#tenantStateHdr").html( $.i18n._("user.state"));
    $("#tenantTypeHdr").html( $.i18n._("cmn.type"));
    $("#tenantContactHdr").html($.i18n._("user.primary.cntc"));
    $("#tenantPhoneHdr").html($.i18n._("user.primary.phone"));
   
})(osa.auth.getPageAccess('tenants'));


//}