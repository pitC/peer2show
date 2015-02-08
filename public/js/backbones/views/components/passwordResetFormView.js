define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/homeUser/passwordResetForm.html',
         'app/settings',
         'app/globals',
         'validation/rules',
         "i18n!nls/uiComponents",
         "i18n!nls/validationErrors"
         
], function($, _, Backbone, PasswordResetTmpl, Settings, Globals, Rules, UIComponents,ValidationErrors){

	
	
	PasswordResetFormView = Backbone.View.extend({
		initialize:function (options) {
			this.passwordResetTemplate = _.template(PasswordResetTmpl);
			this.options = options || {};
			console.log("Render password reset!");
			console.log(options);
			this.token = this.options.token;
			this.user = Globals.user;
        },
        render : function(){
        	
        	var data = $.extend({},UIComponents,{rules:Rules},{errors:ValidationErrors});
        	
        	this.$el.html(this.passwordResetTemplate(data));

			return this;
        },
        
        events : {
        	"submit #reset-form":"reset"
        },
        
        reset : function(event){
        	event.preventDefault();
        	var self = this;
        	
        	var data = {
        			'oldPassword':$("#old-password-inp").val(),
        			'password':$("#password-inp").val(),
        			'passwordConfirm':$("#password-confirm-inp").val(),
        			'token':self.token
        	};
        	$("#reset-success").hide();
        	$("#reset-error").hide();
        	$("#reset-btn").text(UIComponents.changingPasswordLbl).prop("disabled", true);
        	this.user.resetPassword(data,self.resetDone,self.resetFail);
        },
        
        resetDone : function(response){
        	console.log("Reset done!");
        	console.log(response);
        	
            $("#reset-success").show(100);
            $("#reset-btn").text(UIComponents.changePasswordLbl).prop("disabled", false);
        },
        
        resetFail : function(response){
        	$("#reset-error").show(100);
        	console.log("Reset failed!");
        	console.log(response);
        	var uiText = ValidationErrors[response.responseText]||UIComponents.resetFailLbl;
        	
        	$("#reset-error").text(uiText).show(100);
         	
        	$("#reset-btn").text(UIComponents.changePasswordLbl).prop("disabled", false);
        },
        
        onShow : function(){
        	$("#reset-error").hide();
            $("#reset-success").hide();
            // if token exists, do not require old password
            if (this.token){
            	$("#old-password-form").remove();
            }
        }
        
	});
	
	return PasswordResetFormView;
});