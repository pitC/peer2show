if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
	
	var rules = {
		"password":{
			// any character, min 4 
			pattern:'^.{4,}$',
			error:'passwordError'
		},
		"oldPassword":{
			error:'wrongPasswordError'
		},
		"passwordConfirm":{
			error:'passwordsNotEqual'
		},
		"resetToken":{
			error:"invalidTokenError"
		},
		"username":{
			// only letters, min 3
			pattern:'^[a-z]{3,}$',
			error:'usernameError'
		},
		"email":{
			pattern:'^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$',
			error:'emailError'
		},
		"maxWidth":{
			min:400,
			max:5000
		},
		"maxHeight":{
			min:400,
			max:5000
		}
	};	
    return rules;
});