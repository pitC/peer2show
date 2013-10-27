define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){
	SlideModel = Backbone.Model.extend({
		/*
		 * Dynamically added attributes:
		 * id - UUID set in slideshowApp
		 * dataURL
		 * upload - status of upload in %
		 * 
		 * */
	});
	
	
	
	return SlideModel;
});