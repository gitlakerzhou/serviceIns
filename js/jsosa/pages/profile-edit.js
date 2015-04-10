//@ sourceURL=http://localhost:8080/ajax/profile-edit.js
//var run_profileEdit = function() {

    (function() {
        var form = $("#profile-edit-form");
        
//        form.addInfoMsg("user.info.editMe");
//        form.addWarningMsg("user.warning.editMe");
//        form.addSuccessMsg("user.success.editMe");
//        form.addErrorMsg("user.error.editMe");
        
//         TODO: if ever editable
        
//        form.addTextInput("profile-login", "cmn.username");
//        form.addTextInput("profile-firstname", "user.firstName");
//        form.addTextInput("profile-lastname", "user.lastName");
//        form.addTextInput("profile-email", "user.emailAddr");
//        form.addTextInput("profile-phonenumber", "user.phoneNum");
        
//        var user = osa.auth.getUserDetails();
//      $("#profile-login").val(user.login);
//      $("#profile-firstname").val(user.firstName);
//      $("#profile-lastname").val(user.lastName);
//      $("#profile-email").val(user.emailAddress);
//      $("#profile-phonenumber").val(user.phoneNumber);
        
        form.addTextNoInput("profile-login", "cmn.username");
        form.addTextNoInput("profile-firstname", "user.firstName");
        form.addTextNoInput("profile-lastname", "user.lastName");
        form.addTextNoInput("profile-email", "user.emailAddr");
        form.addTextNoInput("profile-phonenumber", "user.phoneNum");
        
        var user = osa.auth.getUserDetails();
        $("#profile-login").html(user.login);
        $("#profile-firstname").html(user.firstName);
        $("#profile-lastname").html(user.lastName);
        $("#profile-email").html(user.emailAddress);
        $("#profile-phonenumber").html(user.phoneNumber);

        
        // original code, but internal function does not get called.
//        osa.auth.getUserDetails(function(user) {
//            $("#profile-login").val(user.login);
//            $("#profile-firstname").val(user.firstName);
//            $("#profile-lastname").val(user.lastName);
//            $("#profile-email").val(user.emailAddress);
//            $("#profile-phonenumber").val(user.phoneNumber);
//        });

        // TODO: Send user profile update to system
//        $("#profile-edit-form").submit(function() {
//            return false;
//        });

    })();
//};



