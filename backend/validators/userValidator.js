
var rules = require('../../public/js/validation/rules');

exports.validatePassword = function(v){
	return test(v,'password');
};

exports.validateUsername = function(v){
	return test(v,"username");
};

exports.validateEmail = function(v){
	return test(v,'email');
};

exports.rules = rules;

var test = function(v,patternName){
	var pattern = new RegExp(rules[patternName].pattern,'i');
	if (pattern){
		console.log("Test "+v+" against pattern "+pattern+":"+pattern.test(v));
		return pattern.test(v);
	}
	else{
		return false;
	}
};


