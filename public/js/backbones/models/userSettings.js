define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'validation/rules',
         "i18n!nls/validationErrors",
         'utils/stringUtils'
         
], function($, _, Backbone,Rules,ValidationErrors,StringUtils){
	UserSettings = Backbone.Model.extend({
		
		urlRoot:'/settings/session',
		
		defaults:{
			"maxWidth" : 800,
			"maxHeight" : 500,
			"quality":0.9,
			"processImage":true
		},
		
		validate: function (attrs,options) {
			var errors = [];
			console.log(attrs);
	        if (isNaN(attrs.maxWidth)) {
	        	var errorMsg = StringUtils.replace(ValidationErrors.invalidNumber,{"%VALUE%":attrs.maxWidth});
	            errors.push({field:'maxWidth',error:errorMsg});
	        }
	        if (isNaN(attrs.maxHeight)) {
	        	var errorMsg = StringUtils.replace(ValidationErrors.invalidNumber,{"%VALUE%":attrs.maxHeight});
	        	errors.push({field:'maxHeight',error:errorMsg});
	        }
	        if (attrs.maxWidth < Rules.maxWidth.min || attrs.maxWidth > Rules.maxWidth.max){
	        	var errorMsg = StringUtils.replace(ValidationErrors.rangeError,{"%VALUE%":attrs.maxWidth,"%MIN%":Rules.maxWidth.min,"%MAX%":Rules.maxWidth.max,"%FORMAT%":"px"});
	        	errors.push({field:'maxWidth',error:errorMsg});
	        }
	        if (attrs.maxHeight < Rules.maxHeight.min || attrs.maxHeight > Rules.maxHeight.max){
	        	var errorMsg = StringUtils.replace(ValidationErrors.rangeError,{"%VALUE%":attrs.maxHeight,"%MIN%":Rules.maxWidth.min,"%MAX%":Rules.maxWidth.max,"%FORMAT%":"px"});
	        	console.log("Max height not in range! "+errorMsg);
	        	errors.push({field:'maxHeight',error:errorMsg});
	        }
	        console.log(errors);
	        return errors.length > 0 ? errors : false;
	    }
		
	
	});
	
	
	
	
	return UserSettings;
});