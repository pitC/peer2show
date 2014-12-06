define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/homeUser/passwordReset.html',
         'backbones/views/components/passwordResetFormView',
         'app/settings',
         'app/globals',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, PasswordResetTmpl, PasswordResetForm, Settings, Globals, UIComponents){

	
	
	PasswordResetView = Backbone.View.extend({
		initialize:function (options) {
			this.passwordResetTemplate = _.template(PasswordResetTmpl);
			this.options = options || {};
			console.log("Render password reset!");
			console.log(options);
			this.token = this.options.token;
			this.user = Globals.user;
			this.passwordResetForm = new PasswordResetForm(this.options);
        },
        render : function(){
        	
        	
        	var data = $.extend({},UIComponents,event);
        	
        	this.$el.html(this.passwordResetTemplate(data));
        	var formViewEl = this.passwordResetForm.render().el;
        	console.log("Render Form view");
        	console.log(formViewEl);
        	this.$el.find("#password-reset").append(formViewEl);
        	
			return this;
        },
        
        onShow : function(){
        	this.passwordResetForm.onShow();
        }
        
	});
	
	return PasswordResetView;
});