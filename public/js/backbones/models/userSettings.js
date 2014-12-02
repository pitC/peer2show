define([ 
         'jquery', 
         'underscore', 
         'backbone'
         
], function($, _, Backbone){
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
	        if (isNaN(attrs.maxWidth)) {
	            errors.push({field:'maxWidth',error:attrs.maxWidth+' is not a valid number'});
	        }
	        if (isNaN(attrs.maxHeight)) {
	        	errors.push({field:'maxHeight',error:attrs.maxHeight+' is not a valid number'});
	        }
	        if (attrs.maxWidth < 200 || attrs.maxWidth > 5000){
	        	errors.push({field:'maxWidth',error:attrs.maxWidth+' is not within range 200-5000px'});
	        }
	        console.log(errors);
	        return errors.length > 0 ? errors : false;
	    }
		
	
	});
	
	
	
	
	return UserSettings;
});