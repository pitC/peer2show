define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         "backbones/models/userSettings"
         
], function($, _, Backbone, Settings,UserSettings){
	UserModel = Backbone.Model.extend({
		
		defaults:{
			"loginStatus" : "unauthorised",
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
				self.onLoginFail(response);
			});
			this.set("loginStatus","checking...");
		},
		
		logout : function(){
			var self = this;
			var logout = $.ajax({
	              url : '/logout',
	              type : 'POST'
	        });
			logout.done(function(response){
	            self.onLogoutSuccess(response);
	        });
			logout.fail(function(response){
				self.onLoginFail(response);
			});
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
			
			this.setUserSettings();
			this.setUserParameters(response);
			this.set("loginStatus", "authorised");
		},
		
		onLogoutSuccess : function(response){
			
			this.resetUserSettings();
			this.clear({silent:true}).set(this.defaults);
			
		},
		
		resetUserSettings : function(){
			var settings = this.get("sessionSettings"); 
			settings.clear({silent:true}).set(settings.defaults);
			
		},

		setUserSettings : function(response){

			var imageSettings = this.get("sessionSettings");
			imageSettings.fetch();
			
		},
		
		setUserParameters : function(response){
			this.set("username", response.username);
			this.set("email", response.email);
		},
		
		onLoginFail : function(response){
			console.log(response);
			
			this.set("loginStatus","unauthorised");
		},
		
		isAuthorised : function(){
			console.log("[USER MODEL] is authorised? "+this.get("loginStatus"));
			if (this.get("loginStatus") == "authorised"){
				// ask server again - in case session expired
//				this.autoLogin();
				return true;
			}
			else{
				return false;
			}
		}
	});
	
	return UserModel;
});