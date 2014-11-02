define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         "backbones/models/userSettings"
         
], function($, _, Backbone, Settings,UserSettings){
	UserModel = Backbone.Model.extend({
		
		defaults:{
			"loginStatus" : null,
			"username" : null,
			"email" : null,
			"sessionSettings":new UserSettings()
		},
		
		// checks if session authorised
		autoLogin : function(){
			var autoLogin = $.ajax({
	              url : '/login',
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
			this.setUserSettings();
			this.setUserParameters(response);
			console.log(Settings);
			this.set("loginStatus", "Authorised");
			
			this.trigger("authorised");
		},
		
		setSettings : function(response){
			Settings.userName = response.username;
			Settings.imageSettings = response.settings.imageSettings;
		},
		

		setUserSettings : function(response){
//			var imageSettings = new UserSettings();
			var imageSettings = this.get("sessionSettings");
			imageSettings.fetch();
			
//			this.set("sessionSettings",imageSettings );
			
		},
		
		setUserParameters : function(response){
			this.set("username", response.username);
			this.set("email", response.email);
		},
		
		onLoginFail : function(response){
			console.log(response);
			this.setloginStatus = response.responseText;
			this.trigger("unauthorised");
		},
		
		isAuthorised : function(){
			if (this.get("loginStatus") == "Authorised"){
				return true;
			}
			else{
				return false;
			}
		}
	});
	
	
	
	
	return UserModel;
});