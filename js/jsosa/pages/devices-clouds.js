//@ sourceURL=http://localhost:8080/ajax/devices-clouds.js


// I DO NOT THINK THIS PAGE IS USED !!!


(function(access) {
  //  var isMultiTenant = !access.singleTenantView;
    var isMultiTenant = true;
    var isWriteAccess = access.write;
    var $listing = $("#clouds-list");
    var $block = $("#cloud-block-template");
    var $viprBlock = $("#virtualIPRange-block-template");
    var $cloudSwitchBlock = $("#cloudSwitch-block-template");
    var $coSelect = $('#location-sites-co-select');
    var __clouds = [];
    var __coList = [];

    var updateTable = function(coName) {
        $listing.empty();
        osa.ajax.list('clouds', [coName], function(cloudData) {
            __clouds = cloudData;

            for (var i = 0; i < __clouds.length; i++) {
                if (__clouds.hasOwnProperty(i)) {
                    var $b = $block.clone().removeAttr("id").data({'id': __clouds[i].key});
                    $b.find(".displayName").html(__clouds[i].displayName);
                    $b.find(".authorizationURL").html(__clouds[i].authorizationURL);
                    $b.find(".centralOfficeKey").html(__clouds[i].centralOfficeKey);

                    for (var j = 0; j < __clouds[i].virtualIPRanges.length; j++) {
                        var $v = $viprBlock.clone().removeAttr("id").data(__clouds[i].virtualIPRanges[j]);
                        $v.find(".cidr").html(__clouds[i].virtualIPRanges[j].cidr);
                        $v.find(".blockSize").html(__clouds[i].virtualIPRanges[j].blockSize);
                        $v.appendTo($b.find(".virtualIPRanges-block"));
                    }

                    for (var k = 0; k < __clouds[i].cloudSwitches.length; k++) {
                        var $c = $cloudSwitchBlock.clone().removeAttr("id").data({'id': __clouds[i].cloudSwitches[k].key});
                        $c.find(".displayName").html(__clouds[i].cloudSwitches[k].displayName);
                        $c.appendTo($b.find(".cloudSwitches-block"));
                    }

                    $b.appendTo($listing);
                }
            }
        });
    };

    var reloadData = function() {
        osa.ajax.list('centralOffices', function(coList) {
            $("<option></option>").val("").html("").appendTo($coSelect);
            for (var i = 0; i < coList.length; i++) {
                __coList.push({key: coList[i].key, value:coList[i].displayName});
                $("<option></option>").val(coList[i].key).html(coList[i].displayName).appendTo($coSelect);
            }
        });
    };

    osa.page.addPageEvent(".block-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".list-block").data('id');
        ev.preventDefault();

        if (who) {
            if (confirm("Are you sure you would like to delete this cloud?")) {
                osa.ajax.remove('clouds', who, function() {
                    reloadData();
                });
            }
        }
    });

    osa.page.addPageEvent(".vipr-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".vipr-block").data();
        ev.preventDefault();

        if (who) {
            if (confirm("Are you sure you would like to delete this Virtual IP range?")) {
                osa.ajax.removeByObj('virtualIPRanges', who, function() {
                    reloadData();
                });
            }
        }
    });

    osa.page.addPageEvent(".cloudSwitch-delete-btn", 'click', function(ev) {
        var who = $(ev.target).parents(".cloudSwitch-block").data('id');
        ev.preventDefault();

        if (who) {
            if (confirm("Are you sure you would like to delete this Cloud Switch?")) {
                osa.ajax.remove('cloudSwitches', who, function() {
                    reloadData();
                });
            }
        }
    });

    osa.page.addPageEvent(".add-vipr-btn", 'click', function(ev) {
        var p = osa.ui.formPopup.create("Add Virtual IP Range", null, {submitLabel: $.i18n._("btn.add")});
        var who = $(ev.target).parents(".list-block").data('id');
        ev.preventDefault();
        p.addField("vipr-cidr", 'CIDR', 'string');
        p.addField("vipr-blockSize", 'Block Size', 'string');
        p.addField('vipr-cloudKey', 'Cloud Key', 'hidden', who);

        p.setRequiredFields(['vipr-cidr', 'vipr-blockSize']);
        p.setSubmitAction(function(fields) {
            osa.ajax.add('virtualIPRanges', {cidr: fields['vipr-cidr'], blockSize: fields['vipr-blockSize'], cloudKey:fields['vipr-cloudKey']}, function() {
                p.hide();
                reloadData();
            });
        });
        p.show();
    });

    osa.page.addPageEvent('.add-cloudswitch-btn', 'click', function(ev) {
        var who = $(ev.target).parents(".list-block").data('id');
        var p = osa.ui.formPopup.create("Add Cloud Switch", null, {submitLabel: $.i18n._("btn.add")});
        ev.preventDefault();
        p.addField("cs-name", 'Name', 'string');
        p.addField('cs-cloudKey', 'Cloud Key', 'hidden', who);
        p.setRequiredFields(['cs-name', 'cs-cloudKey']);
        p.setSubmitAction(function(fields) {
            var o = {
                key: fields['cs-name'],
                displayName: fields['cs-name'],
                portCollection: [],
                centralOfficeKey: 'Westford',
                cloudKey: fields['cs-cloudKey']
            };

            osa.ajax.add('cloudSwitches', o, function() {
                p.hide();
                reloadData();
            });
        });

        p.show();
    });


    $coSelect.change(function(ev) {
        ev.preventDefault();
        updateTable($coSelect.val());
    });

    $('#location-add-cloud-btn').click(function(ev) {
        ev.preventDefault();

        var p = osa.ui.formPopup.create("Add New Cloud", null, {submitLabel: 'Add Cloud'});
        p.addField('cloud-name', 'Name of Cloud', 'string');
        p.addField('cloud-authURL', 'Authorization URL', 'string');
        p.addField('cloud-centraloffice', "Central Office", 'select', __coList);
        p.setRequiredFields(['cloud-name', 'cloud-authURL', 'cloud-centraloffice']);
        p.setSubmitAction(function(fields) {
            var o = {
                'displayName':      fields['cloud-name'],
                'authorizationURL': fields['cloud-authURL'],
                'centralOfficeKey': fields['cloud-centraloffice'],
                'virtualIPRanges':  [],
                'cloudSwitches':    [],
            };

            osa.ajax.add('clouds', o, function() {
                p.hide();
                reloadData();
            });
        });
        p.show();
    });

    reloadData();

})(osa.auth.getPageAccess('clouds'));

