//function run_users() {
(function(access) {
    var isWriteAccess = access.write;
    var loadingBlock = $("#userLoading");
    var formDiv = $("#createUserFormDiv");
    var infoNoUsers           = $("#userTableNoUsers");
    var infoNoUsersForTenant  = $("#userTableNoUsersForTenant");
    var createSuccess = $("#userTableUpdateSuccess");
    var createFailure = $("#userTableUpdateFailure");
    var deleteSuccess = $("#userTableDeleteSuccess");
    var deleteFailure = $("#userTableDeleteFailure");
    var editSuccess   = $("#userTableEditSuccess");
    var table = $("#userTable");
    var userTypesOld = [];
    var userTypes = [];
    var tenantTypes = [];
    var tenantNameFilter = [];
    var tenantNames = [];
    var tenantTypesMap = [];
    var userTypesMap = [];
    var tenantNameMap = [];
    var createButton = "";
    
    // ------------------------------------------------
    // I18N
    // ------------------------------------------------
    $("#userLoading").html($.i18n._("cmn.loading"));
    loadingBlock.html($.i18n._("cmn.loading"));
    $("#userTableTitle").addFormTitle("Tenancies");
    createSuccess.html($.i18n._("user.msg.crt.success"));
    deleteSuccess.html($.i18n._("user.msg.del.success"));
    editSuccess.html($.i18n._("user.msg.edt.success"));
    infoNoUsers.html($.i18n._("user.msg.no.users"));
    infoNoUsersForTenant.html($.i18n._("user.msg.no.users.tnt"));
    
    
    
    if (isWriteAccess) {
        // -----------------------------------------------------
        // MAIN ACTION BUTTON
        // -----------------------------------------------------
        $("#action-container").empty().append('<div id="tenants-add-user" class="button btnMain" href=""><div class="twinkle"></div><div class="bigBtnTxt">' + $.i18n._("user.create") + '</div></div>');
        createButton = $("#tenants-add-user");   
        
        // -----------------------------------------------------
        // RENDER FILTER
        // -----------------------------------------------------
        var filterBox = $("#userListFilter");
        filterBox.append('<div class="filterShowMe" >' + $.i18n._("cmn.fltr.show.me") + ' </div>');
        filterBox.addSelect("userListTenant", "cmn.tenant", false, false);
        
        $("#userListTenant").change(function() {
            updateTable();
        });

    }

    
    


    // -----------------------------------------------------
    // RENDER TABLE
    // -----------------------------------------------------
    var isEven = true;
    var updateTable = function() {
        osa.ajax.list('users', [$("#userListTenant").val()], function(data) {
            $("#userTableHdrs").siblings().remove();
            $("#userLoading").hide();
            var userName = "";
            var firstName = "";
            var lastName = "";
            var email = "";
            var login = "";
            var phone = "";
            
            
            // no data is returned
            if (data.length == 0) {
                $("#userTable").hide();
                if ($("#userListTenant").val() == null || $("#userListTenant").val() == "") {
                    infoNoUsersForTenant.hide("slow");
                    infoNoUsers.show("slow");
                }
                else {
                    infoNoUsers.hide("slow");
                    infoNoUsersForTenant.show("slow");
                }
            }
            
            // render table
            else {
                infoNoUsers.hide("slow");
                infoNoUsersForTenant.hide("slow");
                $("#userTable").show();
                
                for (var i=0; i<data.length; i++) {
                    firstName = data[i].firstName || "";
                    lastName = data[i].lastName || "";
                    userName = firstName + " " + lastName;
                    email = data[i].emailAddress || "";
                    login = data[i].login || "";
                    phone = data[i].phoneNumber || "";
                    
                    // STRIPE ROWS
                    var trClass = "odd";
                    if (isEven) trClass = "even";
                    
                    table.append("<tr id='userId_" + data[i].key + "' class='" + trClass + " allowHover'><td>" + login + "</td><td>" + userTypesMap[data[i].userType] + "</td><td>" + tenantNameMap[data[i].tenantKey] + "</td><td>" + userName + "</td>" +
                            "<td>" + email + "</td>" +
                            "<td>" + phone + "</td>" +
                            "<td><div class='btnRound btnEdit'><img src='images/edit.png'/></div></td>" + 
                            "<td><div class='btnRound btnDelete'><img src='images/delete.png'/></div></td></tr>");
                    
                    $("#userId_" + data[i].key).data("data", data[i]);
                    
                    isEven = !isEven;
                };
                
                // -----------------------------------------------------
                // DELETE ROW
                // -----------------------------------------------------
                table.find(".btnDelete").click(function(ev) {
                    var id = $(this).closest("tr").data("data").key;
                    
                    if (confirm($.i18n._("user.msg.del.confirm"))) {
                       osa.ajax.remove('users', id, 
                               function() { 
                                       updateTable(); 
                                       deleteFailure.hide();
                                       deleteSuccess.show("slow");
                                       setTimeout(function(){
                                           deleteSuccess.hide("slow");
                                       }, 5000);                                       
                                   }, 
                                   function (resp) {
                                       deleteFailure.html($.i18n._("user.msg.del.fail") + resp.responseJSON.status);
                                       deleteFailure.show("slow");
                                       setTimeout(function(){
                                           deleteFailure.hide("slow");
                                       }, 5000);
                       });
                    }
                });
                
                
                // ------------------------------------------
                // EDIT FORM
                // -----------------------------------------
                table.find(".btnEdit").click(function(ev) {
                    var who = $(ev.target).closest("tr").data("data");
                    var p = osa.ui.formPopup.create($.i18n._("user.edit"), null, {submitLabel: $.i18n._("btn.save")});
                    var form = p.$FORM;
                    p.show();
                    
                    form.addTextInput("key", "Userkey", true, who.key);
                    
                    form.addTextNoInput("userName", "cmn.username", who.login);
                    form.addTextInput("login", "Username", false, who.login);
                    form.addTextInput("firstName","user.firstName", false, who.firstName);
                    form.addTextInput("lastName","user.lastName", false, who.lastName);
                    form.addTextInput("emailAddress","user.emailAddr", false, who.emailAddress);
                    form.addTextInput("phoneNumber","user.phoneNum", false, who.phoneNumber);
                    
                    $("#login").hideRow();

                    var isCarrier = (osa.auth.getUserDetails().tenantType == "CARRIER");
                    if (isCarrier) {
                        form.addSelect("tenantKey", $.i18n._("user.tenant.name"), true, false, tenantNames, who.tenantKey);
                    } else {
                        form.addTextNoInput("tenantKey", $.i18n._("user.tenant.name"), tenantNameMap[who.tenantKey]);
                    }

                    form.addSelect("userType", $.i18n._("user.user.type"), true, false, userTypes, who.userType);
                    p.setSubmitAction(function(data) {
                        osa.ajax.update('users', data, function() { updateTable(); });
                    });
                    
                    $("#row_key").addClass("hide");
                    $("#row_userType").after(p.$BUTTONCONTAINER);
                    
                    
                });
            }
        });
    };
    
    
    // ----------------------------------------------
    // CREATE FORM
    // ----------------------------------------------
    if (isWriteAccess) {
        formDiv.append("<form id='createUserForm' class='inlineForm'></form>");
        var form = $("#createUserForm");
        
        form.addFormTitle("user.create");
        
        
        var leftDiv = $("<div/>", {id:"createUserLeftForm", class:"addressHalf"}).appendTo(form);
        var rightDiv = $("<div/>", {id:"createUserRightForm", class:"addressHalf"}).appendTo(form);
        
        leftDiv.append("<div class='subheader'>" + $.i18n._("user.sub.hdr.info") + "</div>");
        leftDiv.addTextInput("tenantName", "cmn.username", true);
        leftDiv.addTextInput("tenantPassword", "cmn.password", true);
        leftDiv.addSelect("tenancyNameOfTenant","user.tenant.name", "", true);
        leftDiv.addSelect("tenancyTypeOfUser","user.user.type", "", true);
      
        rightDiv.append("<div class='subheader'>" + $.i18n._("user.sub.hdr.primary") + "</div>");
        rightDiv.addTextInput("tenantFirst","user.firstName");
        rightDiv.addTextInput("tenantLast","user.lastName");
        rightDiv.addTextInput("tenantEmail","user.emailAddr");
        rightDiv.addTextInput("tenantPhone","user.phoneNum");
        
        
        form.append("<div class='buttonTray clear'><div class='addBtn button btnSm' id='tenantCreateSave'>" + $.i18n._( "user.btn.save.user") + "</div><div class='cancelBtn button btnSm' id='tenantCreateCancel'>" + $.i18n._("btn.close") + "</div></div>");
        
        
        // FORM BUTTONS
        $("#tenantCreateCancel").click(function() {
            $("#createUserFormDiv").hide("slow"); 
            createSuccess.hide(); 
            createFailure.hide();
            form.find("input").val("");
            form.find("select").val("");
           });

        createButton.click(function() {
            $("#tenantTypeOfUser").val("");
            $("#tenantTypeOfUser").val("");
            $("#tenantMultiUser").removeAttr("checked");
            $("#createUserFormDiv").show("slow");
            $("#tenancyNameOfTenant").val($("#userListTenant").val());
            
        });
        
        
        // VALIDATION
        form.validate({
            rules : {
                "tenancyNameOfTenant" : {
                    required : true,
                },
                "tenancyTypeOfUser" : {
                    required: true,
                },
                "tenantPassword" : {
                    required: true,
                },
                "tenantName" : {
                    required: true,
                }
            },
            messages: {
                 "tenancyTypeOfUser" : {
                    required: $.i18n._("user.vld.user.type.req"),    
                },
                "tenancyNameOfTenant" : {
                    required: $.i18n._("user.vld.tnt.name.req"),
                },
                "tenantPassword" : {
                    required: $.i18n._("err.msg.required"),
                },
                "tenantPassword" : {
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
        
        
        // ---------------------------------------------------
        // SUBMIT
        // ---------------------------------------------------
        form.find(".addBtn").click(function(ev) {
            if (form.valid()) {
                ev.preventDefault();

                var o = {
                         'emailAddress': $("#tenantEmail").val(),
                         'firstName': $("#tenantFirst").val(),
                         'lastName': $("#tenantLast").val(),
                         'login' : $("#tenantName").val(),
                         'password': $("#tenantPassword").val(),
                         "phoneNumber" : $("#tenantPhone").val(),
                         "tenantKey" : $("#tenancyNameOfTenant").val(),
                         "userType" : $("#tenancyTypeOfUser").val(),
                         
                };
                    
                // -----------------------------------------------
                // SAVE CREATE
                // -----------------------------------------------
                osa.ajax.add('users', o, function() {
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
                    createFailure.html($.i18n._("user.msg.fail.create") + " " + resp.responseJSON.status);
                    createFailure.show("slow");
                       setTimeout(function(){
                           createFailure.hide("slow");
                       }, 5000);            
                });
            }
 
        });
    }

    
    
    // populate the selects
    var userTypeSel = $("#tenancyTypeOfUser");
    
    // make sure you have tenant types before you render the table as you will need the types to translate the returned data for getTenants
    osa.ajax.list('tenantTypes', function(data) {
        for (var i=0; i<data.length; i++) {
            var key = data[i].key;
            tenantTypes.push({"displayName" : data[i].name, "key" : key});
            tenantTypesMap[key] = data[i].name;
        }
        
        osa.ajax.list('userTypes', function(data) {
            for (var i=0; i<data.length; i++) {
                userTypesOld.push({"value" : data[i].name, "key" : data[i].key});
                userTypes.push({"displayName" : data[i].name, "key" : data[i].key});
                userTypesMap[data[i].key] = data[i].name;
            }
            userTypeSel.populateSelect(userTypes, true, "");
            
            
            osa.ajax.list('tenants', function(data) {
                tenantNameFilter.push({"displayName" : $.i18n._("cmn.all"), "key" : ""});
                
                
                for (var i=0; i<data.length; i++) {
                    tenantNameFilter.push({"displayName" : data[i].tenantName, "key" : data[i].key});
                    tenantNames.push({"displayName" : data[i].tenantName, "key" : data[i].key});
                    tenantNameMap[data[i].key] = data[i].tenantName;
                }
                
                $("#tenancyNameOfTenant").populateSelect(tenantNames);
                $("#userListTenant").populateSelect(tenantNameFilter);
                

                updateTable();
            });

        });

    });
    


    
    
    // ----------------------------------------------------
    // I18N
    // ----------------------------------------------------
    $("#tenantNameHdr").html($.i18n._("user.tbl.hdr.tenant"));
    $("#userTypeHdr").html($.i18n._("user.tbl.hdr.type"));
    $("#userNameHdr").html($.i18n._("user.tbl.hdr.tnt.type"));
    $("#userLoginHdr").html($.i18n._("user.tbl.hdr.name"));
    $("#userEmailHdr").html($.i18n._("user.tbl.hdr.email"));
    $("#userPhoneHdr").html($.i18n._("user.tbl.hdr.phone"));
    $("#userNameHdr").html($.i18n._("user.tbl.hdr.contact"));
    $("#userEditHdr").html($.i18n._("btn.edit"));
    $("#userDeleteHdr").html($.i18n._("btn.delete"));
    
})(osa.auth.getPageAccess('users'));




//}