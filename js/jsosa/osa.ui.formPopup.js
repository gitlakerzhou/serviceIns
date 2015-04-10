
(function(o, undefined) {
    __FORM_ID_PREFIX = 'form-';
    var isSupportsPlaceholder = ("placeholder" in document.createElement("input"));
    var _openBox;

    var isSupportsRange = (function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'range');
        return input.type === 'range';
    })();

    o.ui = o.ui || {};
    o.ui.formPopup = {
        title: "Form",
        buttonList: [],
        options: [],
        __defaultOptions: {
            isOverlay:      true,
            submitLabel:    'Submit',
            buttons:        []
        },

        initialize: function() {
            this.$CONTAINER = $("<div></div>").addClass('modal-box');
            this.$BOXWRAPPER = $("<div></div").addClass('window-wrapper').addClass('vertical').addClass('flip-from-middle anim-fast');
            this.$BOX = $('<div></div>').addClass('window');
            this.$TITLE = $("<h1></h1>").addClass('title');
            this.$FORM = $("<form></form>", {
                action: '#',
                method: 'post'
            }).addClass('message');
            this.$FIELDSET = $("<fieldset></fieldset>").appendTo(this.$FORM);
            this.$BUTTONCONTAINER = $('<div></div>').addClass('button-container').appendTo(this.$FORM);

            this.$BOX.append(this.$TITLE).append(this.$FORM);
            this.$BOXWRAPPER.append(this.$BOX);

            if (this.getOptions('isOverlay')) {
                this.$CONTAINER.addClass('three-d-go');
                this.$OVERLAY = $("<div></div>").addClass('overlay');
                this.$CONTAINER.append(this.$OVERLAY);
                this.$OVERLAY.hide();
            }
            else {
                this.$BOX.addClass('no-overlay');
            }

            this.$CONTAINER.append(this.$BOXWRAPPER);
            this.$BOXWRAPPER.addClass('hide');
        },

        create: function(title, inputs, options) {
            if (!_openBox) {
                var _this = this;
                this.options = [];
                this.setOptions(options || this.__defaultOptions);

                this.initialize();
                this.$BOX.addClass('info');
                this.$TITLE.html(title);

                // If no buttons are in the options, add the default buttons.
                var btns = this.getOptions('buttons');
                if (btns.length === 0) {
                    this.addButton(this.getOptions('submitLabel'), _this.submitForm, true);
                    this.addButton('Cancel', _this.hide);
                }
                else {
                    for (var i = 0; i < btns.length; i++) {
                        this.addButton(btns[i].label, btns[i].action);
                    }

                    this.setPrimaryButton(btns[0].label);
                }
                
                return this;
            }
        },

        setOptions: function(opts) {
            for (var i in this.__defaultOptions) {
                if (this.__defaultOptions.hasOwnProperty(i)) {
                    this.options[i] = (opts[i] !== undefined) ? opts[i] : this.__defaultOptions[i];
                }
            }
        },

        getOptions: function(which) {
            if (which) {
                return this.options[which];
            }
            else {
                return this.options;
            }
        },

        setRange: function(fieldName, min, max) {
            var sts = this.getField(fieldName).empty();
            sts.append($("<option></option>", {value:null, html:""}));

            for (var i = min; i < max; i++) {
                sts.append($("<option></option>", { value: i, html: i}));
            }
            return sts;
        },


        getFormValues: function() {
            var ret = {};
            var vals = this.$FORM.serializeArray();
            for (var i in vals) {
                if (vals.hasOwnProperty(i)) {
                    ret[vals[i].name.replace(__FORM_ID_PREFIX, '')] = vals[i].value;
                }
            }
            return ret;
        },

        validateFields: function() {
            this.$FORM.find('.form-input-block').removeClass('form-invalid');
            var $invalidFields = this.$FORM.find("input,select")
                .filter(function() {
                    return ($(this).data('required') === true) && ($(this).val() === '');
                }).parents(".form-input-block").addClass('form-invalid');

            if ($invalidFields.size() > 0) {
                alert($.i18n._("old.common.fields"));
                return false;
            }
            return true;
        },

        setSubmitAction: function(cb) {
            var _this = this;

            this.$FORM.submit(function(ev) {
                ev.preventDefault();
                _this.validateFields() && ((cb || function() {})(_this.getFormValues()) !== false) && _this.hide();
                return false;
            });
        },

        addField: function(id, label, type, valueSet, onChangeFunction, rowClass ) {
            var inputName = __FORM_ID_PREFIX + id;
            var $row = $("<div class='form-input-block'></div>");
            var $status = $("<div class='form-status typcn typcn-warning'></div>");
            var $label = $("<label></label>").attr("for", inputName).html(label);
            var $input = "";
            var $div = "";
            
            if (rowClass) {
            	$row.addClass(rowClass);
            }

            switch (type) {
                case "hidden":
                    $label.empty();
                    $row.addClass("hide");
                    $input = $("<input />", {id:inputName, name:inputName, type:'hidden'}).val(valueSet);
                    break;
                case "range":
                    if (isSupportsRange) {
                        $input = $("<input />", {id:inputName, name:inputName, type:'range', min:valueSet.min, max:valueSet.max});
                    }
                    //else {
                    //    $div = $("<div></div>").slider({value: 1, min:valueSet.min, max:valueSet.max, slide:function(e, ui) {$input.val(ui.value);}});
                    //}
                    break;
                case "select":
                    $input = $("<select></select>", {id:inputName, name:inputName, 'class': 'text-input'});
                    // Add an action prompt field first.
                    $("<option></option>").attr('value', '').html("").appendTo($input);

                    for (var j in valueSet) {
                        if (valueSet.hasOwnProperty(j)) {
                        	var cls = valueSet[j].class || "";
                            $("<option></option>")
                                .attr('value', valueSet[j].key)
                                .attr('disabled', (valueSet[j].isDisabled) ? valueSet[j].isDisabled : false)
                                .html(valueSet[j].value)
                                .addClass(cls)
                                .appendTo($input);
                        }
                    }
                    break;
                case "checkbox":
                    //$label.addClass('checkbox-label');
                    $input = $("<input />", {id:inputName, name:inputName, type:'checkbox'}).addClass('checkbox');
                    if (valueSet === true) {
                        $input.attr("checked", "checked");
                    }
                    break;
                case "checkbox_hidden":
                	 $label.addClass('checkbox-label');
                     $input = $("<input />", {id:inputName, name:inputName, type:'checkbox'}).addClass('checkbox');
                     if (valueSet === true) {
                         $input.attr("checked", "checked");
                     }
                     $row.addClass("hide");
                	break;
                case "password":
                    $input = $("<input />", {id:inputName, name:inputName, type:'password'}).val(valueSet);
                    break;
                case "static":
                    $input2 = $("<input />", {id:inputName, name:inputName, type:'hidden'}).val(valueSet);
                    $input = $("<p></p>").html(valueSet).addClass('fake-text-input').append($input2);
                    break;
                case "textarea":
                    $input = $("<textarea />", {id:inputName, name: inputName, rows: "20", cols: "70", 'class': 'textarea'}).val(valueSet);
                    break;
                case "radio": // {prettyStr: "DHCP", valStr: 'dhcp', selected: true}
                    $input = $("<input type='radio' value='" + valueSet.valStr + "' name='" + valueSet.name + "' id='" + id + "'>" + valueSet.prettyStr + "</input>");
                    if (valueSet.selected === true) {
                        $input.attr("checked", "checked");
                    }                	
                	break;
                case "string":
                case "text":
                default:
                    $input = $("<input />", {id:inputName, name: inputName, type:'text', 'class': 'text-input'}).val(valueSet);
                    break;
            }

            $input.change(onChangeFunction || $.noop);
            $row.append($status).append($label).append($div).append($input).appendTo(this.$FIELDSET);
            
        },

        addHeader: function(text, id, cls) {
        	var idStr = "";
        	if (id) idStr = 'id="' + id + '"';
        	if (cls === "undefined") cls = "";
        	
            var $hdr = $("<div " + idStr + " class='header " + cls + "'>" + text + "</div>").addClass("clear");
            $hdr.appendTo(this.$FIELDSET);
        },


        getField: function(who) {
            return this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who);
        },

        hideField: function(who) {
            this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who).parent('.form-input-block').addClass('hide');
        },

        showField: function(who) {
            this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who).parent('.form-input-block').removeClass('hide');
        },

        disableField: function(who) {
            var $e = this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who);
            $e.attr("disabled", "disabled");
            $e.parent().addClass('disabled');
        },

        removeField: function(who) {
            this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who).parent('.form-input-block').remove();
        },

        enableField: function(who) {
            var $e = this.$FIELDSET.find("#" + __FORM_ID_PREFIX + who);
            $e.removeAttr("disabled");
            $e.parent().removeClass('disabled');
        },

        setRequiredFields: function(who) {
            if (typeof who === 'object') {
                for (var i in who) {
                    if (who.hasOwnProperty(i)) {
                        this.addRequiredField(who[i]);
                    }
                }
            }
            else {
                this.addRequiredField(who);
            }
        },

        addRequiredField: function(who) {
            this.getField(who).data({'required': true});
        },

        removeRequiredField: function(who) {
            this.getField(who).data({'required': false});
        },

        addButton: function(actionName, callback, isPrimaryAction) {
            var _this = this;
            callback = callback || $.noop;

            this.buttonList[actionName] =
                $('<input />', {
                    type: 'button',
                    value: actionName,
                    click: function(ev) {
                        ev.preventDefault();
                        callback.call(_this);
                    },
                    'class': 'button'
                })
                .appendTo(_this.$BUTTONCONTAINER);

            if (isPrimaryAction) {
                this.setPrimaryButton(actionName);
            }
            else {
                this.buttonList[actionName].addClass('btnClear btnCancel');
            }
        },

        setPrimaryButton: function(actionName) {
            if (this.buttonList[actionName]) {
                this.buttonList[actionName].removeClass('button-3').addClass('btnClear btnSave').attr({'type': 'submit', value:actionName});
            }
        },

        submitForm: function() {
            this.$FORM.submit();
        },
        
        show: function() {
            _openBox = this;
            this.$CONTAINER.appendTo('body').hide();
            this.$CONTAINER.show();
            if (this.getOptions('isOverlay')) {
                // $("#main-area").addClass("zoom-out");
                this.$OVERLAY.fadeIn().click(function() { _openBox.hide();});
            }
            this.$BOXWRAPPER.removeClass("hide");
            this.$FIELDSET.find(":input").first().focus();
        },
        
        reveal: function() {
            _openBox = this;
//            this.$CONTAINER.appendTo('body').hide();
            this.$CONTAINER.show();
            if (this.getOptions('isOverlay')) {
                // $("#main-area").addClass("zoom-out");
                this.$OVERLAY.fadeIn().click(function() { _openBox.hide();});
            }
            this.$BOXWRAPPER.removeClass("hide");
            this.$FIELDSET.find(":input").first().focus();        	
        },

        hide: function() {
            var _this = this;
            this.buttonList = [];

            if (this.getOptions('isOverlay')) {
                // $("#main-area").removeClass("zoom-out");
                this.$OVERLAY.fadeOut(ANIMATE_SPEED);
            }
            this.$BOXWRAPPER.addClass('hide');
            setTimeout(function() {
                _openBox = null;
                _this.$TITLE.empty();
                _this.$BUTTONCONTAINER.empty();
                _this.$CONTAINER.hide().remove();
            }, ANIMATE_SPEED);

        }
    };

    window.osa = o;

}((window.osa || {}), undefined));