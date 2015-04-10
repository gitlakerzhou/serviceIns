//@ sourceURL=http://localhost:8080/ajax/systemProperties-list.js

//var run_sysPropList = function() {

(function(access) {
    var isWriteAccess = access.write;
    var $listing = $("#propertyList");
    var $propBlockTemplate = $("#property-block-template");
    var __propList = [], __tenantDD = [];

    // Because there's no way to promote Java ENUMs to the WebUI easily,
    // Manually recreate it
    var __propTypes = [
        'NorthBoundAPI',
        'VNFTypeDefault',
        'OrchestrationAPI',
        'Cloud',
        'Debug',
        'VNFImage',
        'CloudFlavor',
        'HiddenVNFTypeDefault',
        'EBI',
        'NetworkController',
        "Metrics",
        "Database"
    ];

    var __propTypesDD = __propTypes.map(function(e) {
        return {key: e, value: e};
    });
    
    // ---------------------------------------------------
    // i18n
    // ---------------------------------------------------
    $("#aclHdrPropKey").html($.i18n._("sys.tbl.hdr.key"));
    $("#aclHdrType").html($.i18n._("sys.tbl.hdr.type"));
    $("#aclHdrValue").html($.i18n._("sys.tbl.hdr.val"));
    $("#aclHdrTenant").html($.i18n._("sys.tbl.hdr.tenant"));
    $("#aclHdrDescription").html($.i18n._("sys.tbl.hdr.desc"));
    $("3noPropertiesAvailable").html($.i18n._("sys.msg.no.props"));
    $("#add-systemProperty-btn .bigBtnTxt").html($.i18n._("sys.btn.crt.prop"));
    

    // ---------------------------------------------------
    // Render data into table
    // ---------------------------------------------------
    var updateTable = function() {
        __propList.length = 0;
        $listing.empty();

        osa.ajax.list('systemProperties', function(props) {
            __propList = props;

            for (var i = 0; i < props.length; i++) {
                var $p = $propBlockTemplate.clone().attr("id", "property-block-" + props[i].key).data({'id': props[i].key});
                var tenantKey = "";
                var preventDelete = true;
                
                if (props[i].tenantKey !== null) {
                    tenantKey = getTenantPrettyName(props[i].tenantKey);
                    preventDelete = false;
                }
                
                $p.find(".propertyKey").html(props[i].propertyKey).attr("title", props[i].description);
                $p.find(".propertyValue").html(props[i].propertyValue);
                $p.find(".type").html(props[i].type);
                $p.find(".tenantCol").html(tenantKey);
                $p.find(".descCol").html(props[i].description);
                if (preventDelete) {
                    $p.find(".property-delete-btn").remove();
                }
                else {
                    $p.find(".property-delete-btn").attr("title", $.i18n._("sys.btn.del.prop")).click(deleteProperty);
                }
                
                $p.find(".property-edit-btn img").data(props[i]).click(editProperty);
                $p.find(".property-edit-btn").attr("title", $.i18n._("sys.btn.edt.prop"));
                $p.appendTo($listing);
            }
        });
    };

    var getTenantPrettyName = function (key) {
        var prettyString = "";
        
        if (__tenantDD.length == 0) {
            osa.ajax.list('tenants', function(t) {
                for (var i = 0; i < t.length; i++) {
                    var curKey = t[i].key;
                    if (curKey == key) return t[i].value;
                }
            });
        }
        else {
            for (var i=0; i<__tenantDD.length; i++) {
                var curKey = __tenantDD[i].key;
                if (curKey == key) return __tenantDD[i].value;
            }
        }
        return prettyString; // just in case of fail.
    };

    var deleteProperty = function(ev) {
        ev.preventDefault();
        var who = $(ev.target).parents(".property-block").first().data('id');

        if ((who) && (confirm($.i18n._("sys.msg.sure.del")))) {
            osa.ajax.remove('systemProperties', who, updateTable);
        }
    }

    var editProperty = function(ev) {
        ev.preventDefault();
        var who = $(ev.target).data();

        if (who) {
            var p = osa.ui.formPopup.create($.i18n._("sys.ttl.edit.property"), null, {submitLabel: $.i18n._("btn.update")});
            p.addField('key', $.i18n._("sys.key"), 'hidden', who.key);
            p.addField("propertyKey", $.i18n._("sys.key"), 'string', who.propertyKey);
            p.addField("propertyValue", $.i18n._("sys.val"), 'string', who.propertyValue);
            p.addField("description", $.i18n._("sys.desc"), 'string', who.description);
            p.addField("type", $.i18n._("sys.prop.type"), 'select', __propTypesDD);
            p.addField("tenantKey", $.i18n._("sys.assoc.tnt"), 'select', __tenantDD);
            p.getField('type').val(who.type);
            p.getField('tenantKey').val(who.tenantKey);

            p.setSubmitAction(function(fields) {
                fields['tenantKey'] = (fields['tenantKey'] == '') ? null : fields['tenantKey'];
                osa.ajax.update('systemProperties', fields, updateTable);
            });

            p.setRequiredFields(["propertyKey", "propertyValue", 'type']);
            p.show();
        }
    };

    osa.ajax.list('tenants', function(t) {
        for (var i = 0; i < t.length; i++) {
            __tenantDD.push({key: t[i].key, value:t[i].tenantName});
        }
    });

    osa.page.addPageEvent('#add-systemProperty-btn', 'click', function(ev) {
        ev.preventDefault();

        var p = osa.ui.formPopup.create($.i18n._("sys.ttl.create.property"), null, {submitLabel: $.i18n._("btn.add")});
        p.addField("propertyKey", $.i18n._("sys.key"), 'string');
        p.addField("propertyValue", $.i18n._("sys.val"), 'string');
        p.addField("type", $.i18n._("sys.prop.type"), 'select', __propTypesDD);
        p.addField("description", $.i18n._("sys.desc"), 'string');
        p.addField("tenantKey", $.i18n._("sys.assoc.tnt"), 'select', __tenantDD);
        p.setSubmitAction(function(fields) {
            if (fields['tenantKey'] == '') {
                delete(fields['tenantKey']);
            }
            osa.ajax.add('systemProperties', fields, updateTable);
        });

        p.setRequiredFields(["propertyKey", "propertyValue", 'type']);
        
        p.show();
    });

    updateTable();

})(osa.auth.getPageAccess('systemProperties'));

//};