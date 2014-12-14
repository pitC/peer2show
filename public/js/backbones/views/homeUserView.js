define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'app/globals',
         'backbones/views/userHomeSections/userSettingsView',
         'backbones/views/userHomeSections/accountSettingsView',
         'text!templates/homeUser/homeUserMain.html',
         'text!templates/homeUser/sessionSettings.html',
         'text!templates/homeUser/unauthorisedMain.html',
         'text!templates/homeUser/authorisationOngoing.html',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, Settings, Globals,UserSettingsView,AccountSettingsView, HomeUserTmpl,SessionSettingsTmpl,UnauthorisedTmpl,AuthorisationOngoingTmpl,UIComponents){
	
	
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
			
			this.accountSettingsView = new AccountSettingsView({model:this.userModel});
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
        	this.renderAccountSettings();
        	this.onShow();
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
        		this.adjustSectionWidth(key);
        	}
        },
        
        renderAccountSettings : function(){
        	
        	this.$el.find("#account-settings").append(this.accountSettingsView.render().el);
        	this.adjustSectionWidth("#account-settings");
        },
        
        adjustWidths : function(){
        	for (var key in this.settingSections){
        		this.adjustSectionWidth(key);	
        	}
        	this.adjustSectionWidth("#account-settings");
        },
        
        adjustSectionWidth : function(sectionId){
        	var maxWidthFound = 0;
        	var currentWidth = 0;
        	$(sectionId).find('.input-group-addon').each(function(){
        		currentWidth = $(this).outerWidth();
        		console.log("Current width: "+currentWidth);
        		console.log($(this));
        		if (currentWidth > maxWidthFound){
        			
        			maxWidthFound = currentWidth;
        		}
        	});
        	console.log("max width found:"+maxWidthFound);
        	// apply to all
        	if (maxWidthFound > 0){
        		$(sectionId).find('.input-group-addon').css({"min-width":maxWidthFound,'text-align':'left'});
        	}
        },
        
        onUsernameChange : function(event){
        	console.log(event);
        	var username = this.userModel.get("username");
        	$("#username").text(username);
        },
        
        onShow : function(){
        	this.accountSettingsView.onShow();
        	this.adjustWidths();
        }
        
	});
	
	return HomeUserView;
});