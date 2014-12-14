define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'validation/rules'
         
], function($, _, Backbone,Rules){
	UserSettings = Backbone.Model.extend({
		
		urlRoot:'/settings/session',
		
		defaults:{
			"maxWidth" : 1000,
			"maxHeight" : 500,
			"quality":0.9
		},
		
		validate: function (attrs,options) {
			var errors = [];
			console.log(attrs);
//	        if (isNaN(attrs.maxWidth)) {
//	            errors.push({field:'maxWidth',error:attrs.maxWidth+' is not a valid number'});
//	        }
//	        if (isNaN(attrs.maxHeight)) {
//	        	errors.push({field:'maxHeight',error:attrs.maxHeight+' is not a valid number'});
//	        }
//	        if (attrs.maxWidth < Rules.maxWidth.min || attrs.maxWidth > Rules.maxWidth.max){
//	        	errors.push({field:'maxWidth',error:attrs.maxWidth+' is not within range 400-5000px'});
//	        }
//	        if (attrs.maxHeight < Rules.maxHeight.min || attrs.maxHeight > Rules.maxHeight.max){
//	        	errors.push({field:'maxHeight',error:attrs.maxHeight+' is not within range 200-5000px'});
//	        }
	        console.log(errors);
	        return errors.length > 0 ? errors : false;
	    }
		
	
	});
	
	
	
	
	return UserSettings;
});