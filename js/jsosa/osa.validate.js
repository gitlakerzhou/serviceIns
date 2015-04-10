var upperCase= new RegExp('[A-Z]');
var lowerCase= new RegExp('[a-z]');
var numbers = new RegExp('[0-9]');
var specialchar= new RegExp('[!@#\\$%^&*()~`\\-=_+\\[\\]{}|:\\\";\',\\./<>?]');


$.validator.addMethod('loweruppernumber', function(value) {
	return (value.match(upperCase) && value.match(lowerCase) && value.match(numbers));
},  $.i18n._("validate.reqLowUprNum"));



$.validator.addMethod('specialchar', function(value) {
	return (value.match(specialchar));
}, $.i18n._("validate.oneSpChar"));