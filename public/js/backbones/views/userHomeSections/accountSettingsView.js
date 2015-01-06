define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/homeUser/accountSettings.html',
         'backbones/views/components/passwordResetFormView',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone,AccountSettingsTmpl, PasswordResetForm, UIComponents){
	
	
	UserSettingsView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.template = _.template(AccountSettingsTmpl);
			
			this.passwordResetForm = new PasswordResetForm(this.options);
        },
        
        render : function(){
        	
        	
        	var data = $.extend({},UIComponents,this.model.toJSON());
        	
        	this.$el.html(this.template(data));
        	var formViewEl = this.passwordResetForm.render().el;
        	console.log("Render Form view");
        	console.log(formViewEl);
        	this.$el.append(formViewEl);
        	
			return this;
        },
        
        onShow : function(){
        	console.log("On show called!");
        	this.passwordResetForm.onShow();
        }
        
        
	});
	
	return UserSettingsView;
});