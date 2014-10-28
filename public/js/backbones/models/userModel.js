define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings'
], function($, _, Backbone, Settings){
	UserModel = Backbone.Model.extend({
		
		loginStatus : null,
		
		logout : function(){
			
		},
		
		login : function(username, password){
			var credentials = {"username":username,"password":password};
			var self = this;
			var login = $.ajax({
	              url : '/login',
	              data : credentials,
	              type : 'POST'
	        });
			login.done(function(response){
	            self.onLoginSuccess(response);
	          });
			login.fail(function(response){
				self.onLoginFail(response);
			});
		},
		
		onLoginSuccess : function(response){
			console.log("success!");
			Settings.userName = response.username;
			console.log(Settings);
			this.loginStatus = "Authorised";
			this.trigger("authorised");
		},
		
		onLoginFail : function(response){
			console.log(response);
			this.loginStatus = response.responseText;
			this.trigger("unauthorised");
		},
		
		isAuthorised : function(){
			if (this.loginStatus == "Authorised"){
				return true;
			}
			else{
				return false;
			}
		}
		
		
	});
	
	
	
	
	return UserModel;
});