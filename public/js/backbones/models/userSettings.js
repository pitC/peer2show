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
		}
		
	});
	
	
	
	
	return UserSettings;
});