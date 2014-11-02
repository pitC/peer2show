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
			var self = this;
			var logout = $.ajax({
	              url : '/logout',
	              type : 'POST'
	        });
			logout.done(function(response){
	            self.onLogoutSuccess(response);
	        });
			logout.fail(function(response){
				// no necessary to handle (?)
				null;
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
			this.set("loginStatus", "Authorised");
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
			this.setloginStatus = response.responseText;
			this.trigger("unauthorised");
		},
		
		isAuthorised : function(){
			
			if (this.get("loginStatus") == "Authorised"){
				// ask server again
				this.autoLogin();
				return true;
			}
			else{
				return false;
			}
		}
	});
	
	
	
	
	return UserModel;
});