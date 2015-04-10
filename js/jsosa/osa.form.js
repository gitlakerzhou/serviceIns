// -------------------------------------------------------
// MESSAGES
// -------------------------------------------------------
// SUCCESS INFO / ERROR / WARNING
$.fn.addSuccessMsg = function(msg, id, cls) {
    var idStr = "";
    var clsStr = "";
    if (id !== (undefined && null)) idStr = ' id="' + id +  '"';
    if (cls !== (undefined && null)) clsStr = cls;

    var successBox = this.append('<div class="mainSuccess ' + clsStr +  '"' + idStr + '>' + $.i18n._(msg) + '</div>');
    
    // use fx for showing and hiding for success only.  CSS for the other message types.
    $(successBox).find('.mainSuccess').hide();
};

$.fn.addInfoMsg = function(msg, id, cls) {
    var info = this.append('<div class="mainInfo">' + $.i18n._(msg) + '</div>');
    if (id !== (undefined && null)) info.attr(id);
    if (cls !== (undefined && null)) info.addClass(cls);
};

$.fn.addWarningMsg = function(msg, id, cls) {
    var info = this.append('<div class="mainWarning">' + $.i18n._(msg) + '</div>');
    if (id !== (undefined && null)) info.attr(id);
    if (cls !== (undefined && null)) info.addClass(cls);
};

$.fn.addErrorMsg = function(msg, id, cls) {
    var idStr = "";
    var clsStr = "";
    if (id !== (undefined && null)) idStr = ' id="' + id +  '"';
    if (cls !== (undefined && null)) clsStr = cls;
    // just show and hide via css, nothing fancy.
    this.append('<div class="mainError hide ' + clsStr +  '"' + idStr + '>' + $.i18n._(msg) + '<span class="detailedMsg"></span></div>');
};

$.fn.showAndHide = function(time) {
    var target = $(this);
    if (!time) time = 5000,
    target.show("slow");
    setTimeout(function(){target.hide("slow");}, time);
};

//-------------------------------------------------------
// INPUTS
//-------------------------------------------------------
$.fn.prepSel = function (hasBlank, show) {
    this.empty();
    
    if (show === undefined) show = true;
    
    if (show) {
        this.showRow();
    }
    
    if (hasBlank)
        this.append($("<option></option>", {value : '',    html : ''}));    
};

$.fn.addRequired = function() {
        $(this).parent().append('<span class="star"> *</span>');
};

$.fn.removeRequired = function() {
    $(this).parent().find(".star").remove();
};

$.fn.addTextInput = function(id, label, req, val, cls, hlp) {
	
    this.append('<div class="form-input-block row" id="row_' + id + '"><label for="' + id + '">' + $.i18n._(label) + '</label><input id="' + id + '"  name="' + id + '"></input></div>');
    if (cls !== (undefined && null)) $("#" + id).parent().addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
    if (req) {
        $("#row_" + id).append('<span class="star"> *</span>');
        $("#" + id).addClass("required");
    }
    if (val) {
    	$("#" + id).val(val);
    } 

};

$.fn.addTextNoInput = function(id, label, val, cls, hlp) {
    if (val === undefined || val == null) val = "";
    this.append('<div class="form-input-block row" id="row_' + id + '"><label>' + $.i18n._(label) + '</label><span class="noEditPairRight" id="' +  id +  '">' + val + '</span></div>');
    if (cls !== (undefined && null)) $("#" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
};


$.fn.addTextArea = function(id, label, val, cls, hlp) {
    if (val === undefined || val == null) val = "";
    
    this.append('<div class="form-input-block row" id="row_' + id + '"><label>' + $.i18n._(label) + '</label><textarea  id="' + id + '"  name="' + id + '"></textarea ></div>');
};

$.fn.addSelect = function(id, label, firstEmpty, req, opts, dflt, cls, hlp) {
    this.append('<div class="form-input-block row" id="row_' + id + '"><label for="' + id + '">' + $.i18n._(label) + '</label><select id="' + id + '"  name="' + id + '"></select></div>');
    if (firstEmpty) {
        $("#" + id).append("<option value=''></option>");
    }
    
    if (opts) {
        for (var i=0; i<opts.length; i++ ) {
            if (opts[i].str) // one way - get rid of this
                $("#" + id).append("<option value='" + opts[i].val + "'>" + $.i18n._(opts[i].str) + "</option>");
            else // - other way
                $("#" + id).append("<option value='" + opts[i].key + "'>" + $.i18n._(opts[i].displayName) + "</option>");
        }
        $("#" + id).val(dflt);
    }
    
    if (cls !== (undefined && null)) $("#row_" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
    if (req) {
        $("#row_" + id).append('<span class="star"> *</span>');
        $("#" + id).addClass("required");
    }

};



$.fn.addRadio = function(id, rowLbl, radLbl, nm, val, isChk, cls, hlp) {
    var label = '<label for="' + id + '">' + $.i18n._(rowLbl) + '</label>';
    var checkedStr = "";
    
    if (isChk) {checkedStr = 'checked="checked"';}
    var input = '<input id="' + id + '" type="radio" name="' + nm + '" value="' + val + '" ' + checkedStr + '>' + $.i18n._(radLbl) + '</input>';
    
    this.append('<div class="form-input-block" id="row_' + id + '">' + label + input + '</div>');
    
    
    if (cls !== (undefined && null)) $("#" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
};

$.fn.addCheckbox = function (id, lbl, isChk, cls, hlp) {
    var label = '<label for="' + id + '">' + $.i18n._(lbl) + '</label>';
    
    var checkedStr = "";
    
    if (isChk) {checkedStr = 'checked="checked"';}
    
    var input = '<input id="' + id + '" class="checkbox" type="checkbox" name="' + id + '"' + checkedStr + '>';
    
    this.append('<div class="form-input-block" id="row_' + id + '">' + label + input + '</div>');

    if (cls !== (undefined && null)) $("#row_" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
};

$.fn.addCheckboxReverse = function (id, lbl, isChk, cls, hlp) {
    var label = '<label for="' + id + '" class="checkboxReverseLabel">' + $.i18n._(lbl) + '</label>';
    
    var checkedStr = "";
    
    if (isChk) {checkedStr = 'checked="checked"';}
    
    var input = '<input id="' + id + '" class="checkbox checkboxReverseBox" type="checkbox" name="' + id + '"' + checkedStr + '>';
    
    this.append('<div class="form-input-block" id="row_' + id + '">' + input + label + '</div>');

    if (cls !== (undefined && null)) $("#row_" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
};

$.fn.addPassword = function(id, label, req, cls, hlp) {
    this.append('<div class="form-input-block row" id="row_' + id + '"><label for="' + id + '">' + $.i18n._(label) + '</label><input type="password" id="' + id + '" name="' + id + '" autocomplete="off" /></div>');
    if (cls !== (undefined && null)) $("#" + id).addClass(cls);
    if (hlp !== (undefined && null))  {
        $("#row_" + id).attr("alt", $.i18n._(hlp));
        $("#row_" + id).attr("title", $.i18n._(hlp));
    }
};



$.fn.populateSelect = function(vals, firstEmpty, dflt) {
    this.empty();
    
    if (firstEmpty) {
        this.append("<option value=''></option>");
    }
    else {
        if (dflt === undefined) dflt = vals[0].key;
    }

    for (var i=0; i<vals.length; i++) {
        this.append("<option value='" + vals[i].key + "'>"  + $.i18n._(vals[i].displayName) + "</option>");
    }
    
    
    this.val(dflt);
};

//-------------------------------------------------------
// TITLES
//-------------------------------------------------------
$.fn.addFormTitle = function(txt, id, cls) {
    if (!id) id="";
    if (!cls) cls = "";
    this.append("<div id='" + id + "' class='formTitle " + cls + "'>" + $.i18n._(txt) + "</div>");
};

$.fn.addSecTitle = function(txt, id, cls) {
    var idStr = "";
    var clsStr = "";
    if (id !== (undefined || null)) idStr = ' id="' + id +  '"';
    if (cls !== (undefined || null)) clsStr = cls;    
    this.append('<div class="sectTitle ' +  clsStr + '"' + idStr +  '>' +  txt +  '</div>');
};

//-------------------------------------------------------
// UTILITIES
//-------------------------------------------------------
$.fn.hideRow = function() {
    this.parent().addClass("hide");
};
$.fn.showRow = function() {
    this.parent().removeClass("hide");
};