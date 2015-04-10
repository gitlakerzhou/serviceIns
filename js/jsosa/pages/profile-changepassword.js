//@ sourceURL=http://localhost:8080/ajax/profile-changepassword.js
//var run_changePassword = function() {
    
// Create a simple form used to change the password.  Provides submit with success and error handling.
// This form is unique in that it sends the user to the login screen on success.
(function() {
    var form = $("#profile-changepassword-form");
    
    form.addInfoMsg("user.info.pwChange");
    form.addWarningMsg("user.warning.pwChange");
    form.addSuccessMsg("user.success.pwChange");
    form.addErrorMsg("user.error.pwChange");
    
    form.addPassword("user_change_pw_cur", "user.curPassword");
    form.addPassword("user_change_pw_new", "user.newPassword");
    form.addPassword("user_change_pw_confirm", "user.retypePassword");
    form.append('<div class="button-container"><input id="edit-password-create" class="button btnSm" type="submit" value="' + $.i18n._("btn.update") + '"  style="margin-right: 5px;"><a href="#services-list"><input id="edit-password-cancel" class="button btnSm btnCancel" type="button" value="' + $.i18n._("btn.cancel") + '"></a></div>');
    
    form.validate({
        rules : {
            user_change_pw_cur : {
                required : true,
            },
            user_change_pw_new : {
                required : true,
                minlength: 8,
                maxlength: 20,
                loweruppernumber: true,
                specialchar: true
            },
            user_change_pw_confirm : {
                required : true,
                equalTo : "#user_change_pw_new"
            }
        },
        messages: {
            user_change_pw_new : {
                minlength: "Need at least {0} characters",
                maxlength: "No more than {0} characters"    
            }        
        }
    }); 
    
    $("#edit-password-cancel").click(function() {
//        $(".logout-btn").trigger("click");
    });
    
    form.submit(function() {
        if (form.valid()) {
            $(".mainError").addClass("hide");
            // update: function(type, newValue, successCallback, failCallback)
            var data = {
                "userKey"        : osa.auth.getUserDetails().key,
                "oldPassword"     : $("#user_change_pw_cur").val(),
                "newPassword"     : $("#user_change_pw_new").val()
            };
            osa.ajax.update('password', data, successSubmit, failSubmit);
        }
        return false;
    });

})();


//};




function successSubmit() {
    $(".mainError").addClass("hide");
    $(".mainWarning").addClass("hide");
    $(".mainInfo").addClass("hide");
    
    $("input").attr("disabled", "disabled");
    
    $(".mainSuccess").slideDown('slow').delay('4000').slideUp('slow');
    
    setTimeout(function() {
        $(".logout-btn").trigger("click");
    }, 5000);
}

// TODO: beef up to share with other components
function failSubmit(jqXHR, ts, err, data) {
    var jsonErr = $.parseJSON(jqXHR.responseText);
    $(".mainError").removeClass("hide");
    $(".detailedMsg").html(jsonErr.status);
}