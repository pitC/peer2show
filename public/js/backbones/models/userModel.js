define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         "backbones/models/userSettings"
         
], function($, _, Backbone, Settings,UserSettings){
	UserModel = Backbone.Model.extend({
		
		loginStatus : null,
		username : null,
		email : null,
		
		
		// checks if session authorised
		autoLogin : function(){
			var autoLogin = $.ajax({
	              url : '/autoLogin',
	              type : 'GET'
	        });
			var self = this;
			autoLogin.done(function(response){
				console.log("[USER MODEL]");
				console.log(response);
	            self.onLoginSuccess(response);
	           
	        });
			autoLogin.fail(function(response){
				// do nothing
				self.setUserSettings(response);
			});
			
			
		},
		
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
			console.log(response);
			this.setSettings(response);
			this.setUserParameters(response);
			console.log(Settings);
			this.loginStatus = "Authorised";
			
			this.trigger("authorised");
		},
		
		setSettings : function(response){
			Settings.userName = response.username;
			Settings.imageSettings = response.settings.imageSettings;
		},
		

		setUserSettings : function(response){
			this.userSettings = new UserSettings();
//			this.userSettings.fetch();
			
		},
		
		setUserParameters : function(response){
			this.username = response.username;
			this.email = response.email;
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
		},
		
		getUsername : function(){
			return this.usernmame;
		}
	});
	
	
	
	
	return UserModel;
});