//function run_tenancy() {
(function(access) {
    var isWriteAccess = access.write;
    var loadingBlock = $("#tenancyLoading");
    var formDiv = $("#createTenancyFormDiv");
    var createSuccess = $("#tenancyTableUpdateSuccess");
    var createFailure = $("#tenancyTableUpdateFailure");
    var deleteSuccess = $("#tenancyTableDeleteSuccess");
    var deleteFailure = $("#tenancyTableDeleteFailure");
    var editSuccess   = $("#tenancyTableEditSuccess");
    var table = $("#tenancyTable");
    var userTypes = [];
    var tenantTypes = [];

    
    
    loadingBlock.html($.i18n._("cmn.loading"));
    $("#tenancyTableTitle").addFormTitle($.i18n._("tncy.tenancies"));
    createSuccess.html($.i18n._("tncy.msg.crt.success"));
    deleteSuccess.html($.i18n._("tncy.msg.del.success"));
    editSuccess.html($.i18n._("tncy.msg.edt.success"));
    
    
    // MAIN ACTION BUTTON
    $("#action-container").empty().append('<div id="tenants-add-tenancy" class="button btnMain" href=""><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._("tncy.hdr.create") + '</div></div>');
    var createButton = $("#tenants-add-tenancy");


    // -----------------------------------------------------
    // RENDER TABLE
    // -----------------------------------------------------
    var isEven = true;
    var updateTable = function() {
        osa.ajax.list('tenancy', function(data) {
            $("#tenancyTableHdrs").siblings().remove();
            $("#tenancyLoading").hide();
            
            var check = "";
            
            for (var i=0; i<data.length; i++) {
                var chkHvr = $.i18n._("tncy.multi.tnt");
                if (data[i].singleTenant)
                    check = "";
                else
                    check = '<img class="ptop4px" title="Multi Tenant" alt="' + chkHvr + '" title="' + chkHvr + '" src="images/check.png">';
                
                // STRIPE ROWS
                var trClass = "odd";
                if (isEven) trClass = "even";
                
                table.append("<tr id='tenancyId_" + data[i].key + "' class='" + trClass + " allowHover'><td>" + data[i].tenantType + "</td><td>" + data[i].userType + "</td>" + 
                        "<td class='centerCell'>" + check + "</td>" + 
                        "<td><div class='btnRound btnEdit'><img src='images/edit.png'/></div></td>" + 
                        "<td><div class='btnRound btnDelete'><img src='images/delete.png'/></div></td></tr>");
                
                $("#tenancyId_" + data[i].key).data("data", data[i]);
                
                isEven = !isEven;
            };
            
            // -----------------------------------------------------
            // DELETE ROW
            // -----------------------------------------------------
            table.find(".btnDelete").click(function(ev) {
                var id = $(this).closest("tr").data("data").key;
                
                if (confirm($.i18n._("tncy.cnfrm.delete"))) {
                   osa.ajax.remove('tenancy', id, 
                           function() { 
                                   updateTable(); 
                                   deleteFailure.hide();
                                   deleteSuccess.show("slow");
                                   setTimeout(function(){
                                       deleteSuccess.hide("slow");
                                   }, 5000);                                       
                               }, 
                               function (resp) {
                                   deleteFailure.html($.i18n._("tncy.msg.del.fail") + " " + resp.responseJSON.status);
                                   deleteFailure.show("slow");
                                   setTimeout(function(){
                                       deleteFailure.hide("slow");
                                   }, 5000);
                   });
                }
            });
            
            
            // ------------------------------------------
            // EDIT ROW
            // -----------------------------------------
            table.find(".btnEdit").click(function(ev) {
                 var data = $(this).closest("tr").data("data");
                
                
                var p = osa.ui.formPopup.create($.i18n._("tncy.hdr.update"), null, {submitLabel: $.i18n._("btn.update")});

                p.addField('tenantType', $.i18n._("tncy.tnt.type"), "select");
                p.getField('tenantType').populateSelect(tenantTypes, true, data.tenantTypeId);
                p.addField('userType', $.i18n._("tncy.usr.type"), "select");
                p.getField('userType').populateSelect(userTypes, true, data.userTypeId);
                p.addField('tenancyView', $.i18n._("tncy.allow.mlt.tnt"), 'checkbox', (data.singleTenant == false));

                p.addRequiredField('tenantType');
                p.addRequiredField('userType');

                p.setSubmitAction(function(data) {
                    var o = {
                             'singleTenant': !($("#form-tenancyView").is(":checked")),
                             'tenantTypeId':$("#form-tenantType").val(),
                             'tenantType': $("#form-tenantType option:selected").html(),
                             'userTypeId' : $("#form-userType").val(),
                             'userType': $("#form-userType option:selected").html()
                         };
                    osa.ajax.update('tenancy', o, function() {
                        updateTable();
                        editSuccess.show("slow");
                           setTimeout(function(){
                               editSuccess.hide("slow");
                           }, 5000);                        
                    });
                });

                p.show();
                
            });
            
            
        });
    };
    
    updateTable();
    
    // ----------------------------------------------
    // CREATE FORM
    // ----------------------------------------------
    formDiv.append("<form id='createTenancyForm' class='inlineForm'></form>");
    var form = $("#createTenancyForm");
    form.addFormTitle("tncy.hdr.create");
    form.addSelect("tenancyTypeOfTenant", $.i18n._("tncy.tnt.type"));
    form.addSelect("tenancyTypeOfUser", $.i18n._("tncy.usr.type"));
    form.addCheckbox("tenancyMultiTenant", $.i18n._("tncy.allow.mlt.tnt"));
    form.append("<div class='buttonTray'><div class='addBtn button btnSm'>" + $.i18n._("tncy.btn.save.tenancy") + "</div><div class='cancelBtn button btnSm'>" + $.i18n._("btn.cancel") + "</div></div>");
    
    
    // FORM BUTTONS
    form.find(".cancelBtn").click(function() {$("#createTenancyFormDiv").hide("slow"); createSuccess.hide(); createFailure.hide();});
    createButton.click(function() {
        $("#tenancyTypeOfUser").val("");
        $("#tenancyTypeOfUser").val("");
        $("#tenancyMultiTenant").removeAttr("checked");
        $("#createTenancyFormDiv").show("slow");
        
    });
    
    
    
    // populate the selects
    var userTypeSel = $("#tenancyTypeOfUser");
    var tenantTypeSel = $("#tenancyTypeOfTenant");
    
    osa.ajax.list('userTypes', function(data) {
        for (var i=0; i<data.length; i++) {
            userTypes.push({"displayName" : data[i].name, "key" : data[i].key});
        }
        userTypeSel.populateSelect(userTypes, true, "");
    });
    

    osa.ajax.list('tenantTypes', function(data) {
        for (var i=0; i<data.length; i++) {
            tenantTypes.push({"displayName" : data[i].name, "key" : data[i].key});
        }
        tenantTypeSel.populateSelect(tenantTypes, true, "");
    });
    
    
    // ---------------------------------------------------
    // SUBMIT
    // ---------------------------------------------------
    form.find(".addBtn").click(function(ev) {
        ev.preventDefault();
        
        var isMultiTenant = $("#tenancyMultiTenant").is(":checked");
        

        var o = {
                 'singleTenant': !isMultiTenant,
                 'tenantTypeId': tenantTypeSel.val(),
                 'tenantType': tenantTypeSel.find("option:selected").html(),
                 'userTypeId' : userTypeSel.val(),
                 'userType': userTypeSel.find("option:selected").html()
        };
            
        // -----------------------------------------------
        // SAVE CREATE
        // -----------------------------------------------
        osa.ajax.add('tenancy', o, function() {
            createSuccess.show("slow");
               setTimeout(function(){
                   createSuccess.hide("slow");
               }, 5000);
            tenantTypeSel.val("");
            userTypeSel.val("");
            $("#tenancyMultiTenant").removeAttr("checked");
            updateTable();
        }, 
        function(resp) {
            createSuccess.hide();
            createFailure.html($.i18n._("tncy.msg.del.fail") + " " + resp.responseJSON.status);
            createFailure.show("slow");
               setTimeout(function(){
                   createFailure.hide("slow");
               }, 5000); 
        });
    });
    

    
    $("#userTypeHdr").html( $.i18n._("tncy.usr.type"));
    $("#tenantNameHdr").html( $.i18n._("tncy.tnt.type"));
    $("#multiTenantHdr").html($.i18n._("tncy.multi.tnt"));
    
    


    
    
    
    
    
})(osa.auth.getPageAccess('tenancy'));


//}