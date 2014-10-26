define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){
	UserModel = Backbone.Model.extend({
		/*
		 * Dynamically added attributes:
		 * id - UUID set in slideshowApp
		 * dataURL
		 * upload - status of upload in %
		 * 
		 * */
		login : function(username, password,callback){
			var credentials = {"username":username,"password":password};
			var login = $.ajax({
	              url : '/login',
	              data : credentials,
	              type : 'POST'
	        });
			login.done(function(response){
	              console.log("Authenticated!");
	              console.log(response);// response is the user object delivered by server
	              if (callback){
	            	  callback();
	              }
	          });
		}
	});
	
	
	
	
	return UserModel;
});