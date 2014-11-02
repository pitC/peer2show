define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'app/globals',
         'backbones/views/userHomeSections/userSettingsView',
         'text!templates/homeUser/homeUserMain.html',
         'text!templates/homeUser/sessionSettings.html',
         'text!templates/homeUser/unauthorisedMain.html',
         'text!templates/homeUser/authorisationOngoing.html',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, Settings, Globals,UserSettingsView,HomeUserTmpl,SessionSettingsTmpl,UnauthorisedTmpl,AuthorisationOngoingTmpl,UIComponents){
	
	
	HomeUserView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.template = _.template(HomeUserTmpl);
			this.userModel = Globals.user;
			this.listenTo(this.userModel,"change:username",this.onUsernameChange);
			this.listenTo(this.userModel,"change:loginStatus",this.render);
			
			var sessionSettingsModel = this.userModel.get("sessionSettings");
			this.settingSections = {
					"#session-settings":new UserSettingsView({model:sessionSettingsModel,template:SessionSettingsTmpl})
			};
        },
        
        render : function(){
        	var status = this.userModel.get("loginStatus");
        	console.log("What is the loginStatus? "+status);
        	if (status =="authorised"){
        		this.renderAuthorised();
        	}
        	else if (status == "unauthorised"){
        		this.renderUnauthorised();
        	}
        	else{
        		this.renderAuthorising();
        	}
        	
        	return this;
        },
        
        renderAuthorised : function(){
        	console.log("Render user home!");
        	
        	var data = $.extend({},UIComponents,this.userModel.toJSON());
        	console.log(data);
        	
        	var mainElement = this.template(data);
        	this.$el.html(mainElement);
        	this.renderSettingSections();
        	return this;
        },
        
        renderUnauthorised : function(){
        	var unauthorisedTemplate = _.template(UnauthorisedTmpl);
        	var data = $.extend({},UIComponents,{});
        	var mainElement = unauthorisedTemplate(data);
        	this.$el.html(mainElement);
        	return this;
        },
        
        renderAuthorising : function(){
        	var authorisingTemplate = _.template(AuthorisationOngoingTmpl);
        	var data = $.extend({},UIComponents,{});
        	var mainElement = authorisingTemplate(data);
        	this.$el.html(mainElement);
        	return this;
        },
        
        renderSettingSections : function(){
        	for (var key in this.settingSections){
        		var view = this.settingSections[key];
        		this.$el.find(key).append(view.render().el);
        	}
        },
        
        onUsernameChange : function(event){
        	console.log(event);
        	var username = this.userModel.get("username");
        	$("#username").text(username);
        }
        
	});
	
	return HomeUserView;
});