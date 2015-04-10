//@ sourceURL=http://localhost:8080/ajax/clouds-create.js
//function run_cloudsCreate() {
(function(access) {
    var isWriteAccess = access.write;
})(osa.auth.getPageAccess('clouds'));


function cloudRenderForm() {
    var cloudDetailSection = $("#cloudDetailsSection");
    
    cloudDetailSection.append('<div class="titleBar">' + $.i18n._("cld.hdr.cloud.details") + '</div>');
    
    cloudDetailSection.append('<input type="hidden" name="cloud-edit-key" id="cloud-edit-key" value="" />');  // used for edit
    cloudDetailSection.addSelect("cloudCO", "cld.central.office", true, true);
    cloudDetailSection.addTextNoInput("cloudCoText", "cld.central.office");                         // EDIT
    cloudDetailSection.addTextInput("cloudName", "cld.cloud.name", true);
    cloudDetailSection.addTextInput("cloudAuthUrl", "cld.auth.host", true);
    cloudDetailSection.addTextInput("cloudAuthUrlPort", "cld.auth.port", true);
    cloudDetailSection.addTextNoInput("cloudAuthUrlText", "cld.auth.host");                         // EDIT
    cloudDetailSection.addTextNoInput("cloudAuthUrlPortText", "cld.auth.port");                     // EDIT
    cloudDetailSection.addTextInput("cloudHostUser", "cld.host.user", true);
    cloudDetailSection.addTextInput("cloudHostUserPw",  "cld.host.user.password", true);
    cloudDetailSection.addTextInput("cloudTenant", "cld.project.tenant", true);
    cloudDetailSection.addTextInput("cloudLogin", "cld.cloud.user", true);
    cloudDetailSection.addTextInput("cloudPassword", "cld.cloud.password", true);
    
    // EDIT
    $("#row_cloudCoText").addClass("hide");
    $("#row_cloudAuthUrlPortText").addClass("hide");
    $("#row_cloudAuthUrlText").addClass("hide");
    
    var cloudSwitches = $("#cloudSwitches");
    
    cloudSwitches.append("<div class='titleBar'><div class='sectTitle fl'>" + $.i18n._("cld.hdr.cld.sws") + "</div></div>");
    cloudSwitches.find(".titleBar").append('<div class="btnContainer"><a href="#" id="button-add-cloudSwitch" class="button btnAdd"><span class="typcn typcn-plus"></span> ' + $.i18n._("btn.add") + '</a></div>');
    cloudSwitches.append('<div id="cloud-create-cloudSwitch-list"></div>');
    
    var physicalSwitches = $("#physSwitches");
    physicalSwitches.append("<div class='titleBar'><div class='sectTitle fl'>" + $.i18n._("cld.hdr.phys.sws") + "</div></div>");
    physicalSwitches.find(".titleBar").append('<div class="btnContainer"><a href="#" id="button-add-physicalConnection" class="button btnAdd disabled"><span class="typcn typcn-plus"></span> ' + $.i18n._("btn.add") + '</a></div>');
    physicalSwitches.append('<div id="cloud-create-physicalConnection-list"></div>');
    
    var virtualIpRanges = $("#virtualIP");
    virtualIpRanges.append("<div class='titleBar'><div class='sectTitle fl'>" + $.i18n._("cld.hdr.vrt.ip") + "</div></div>");
    virtualIpRanges.find(".titleBar").append('<div class="btnContainer"><a href="#" id="button-add-vipr" class="button btnAdd"><span class="typcn typcn-plus"></span> ' + $.i18n._("btn.add") + '</a></div>');
    virtualIpRanges.append('<div id="cloud-create-vipr-list"></div>');
    
    $("#cloud-create-create").val($.i18n._("btn.create"));
    $("#cloud-create-cancel").val($.i18n._("btn.cancel"));

};

function cloudPopulateDefaults() {
    $("#cloudAuthUrlPort").val("35357");
    $("#cloudHostUser").val("esoadmin");
}

//@ sourceURL = osa-dynamicScripts/location-clouds.js
//}