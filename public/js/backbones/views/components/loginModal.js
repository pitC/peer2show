define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/loginModal.html',
         'app/settings',
         "i18n!nls/uiComponents"
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, LoginModalTmpl, Settings, UIComponents
){
	
	LoginModalView = Backbone.View.extend({
		initialize:function () {
			this.template = _.template(LoginModalTmpl);
			this.modalEl = $('#login-modal');
			
			
			this.listenTo(this.model,"change:loginStatus",this.onLogout);
			this.loggedIn = false;
			// 0 - login
			// 1 - Sign up
			// 2 - password reset
			this.currentView = 0;
        },
        
        onLogout : function(){
        	if (!this.model.isAuthorised()){
        		this.render();
        	}
        },
        
        render : function(){
        	var data = $.extend({},UIComponents,{});
            this.$el.html(this.template(data));
            $("#login-error").hide();
            $("#forgot-error").hide();
            $("#forgot-success").hide();
            return this;
        },
        
        
        
        events : {
        	"submit #login-form":"login",
        	"submit #forgot-form":"forgotPassword",
        	"click #item-toggle-btn" : "toggleSignInUp",
        	"click #goto-forgot-btn": "gotoPasswordReset"
        },
        
        toggleSignInUp : function(){
        	console.log("goto!");
        	var index = 0;
        	if (this.currentView == 0){
        		index = 1;
        	}
        	else{
        		index = 0;
        	}
        
        	this.gotoView(index);
        	
        },
        
        gotoPasswordReset : function(e){
        	e.preventDefault();
        	this.gotoView(2);
        },
        
        
        gotoView : function(index){
        	var btnLbl = '';
        	var headerLbl = '';
        	switch(index){
        	case 0:
        		btnLbl = UIComponents.registerLbl;
        		headerLbl = UIComponents.loginLbl;
        		break;
        	case 1:
        		btnLbl = UIComponents.loginLbl;
        		headerLbl = UIComponents.registerLbl;
        		break;
        	case 2:
        		btnLbl = UIComponents.loginLbl;
        		headerLbl = UIComponents.passwordResetLbl;
        		break;
        	}
        	this.currentView = index;
        	$('#user-management-carousel').carousel(index);
        	$('#item-toggle-btn').text(btnLbl);
        	$('#carousel-item-header').text(headerLbl);
        },
        
        
        
        
        login : function(event){
        	event.preventDefault();
        	console.log("Trying to log in...");
        	
        	var username = $("#username-login-inp").val();
        	var password = $("#password-login-inp").val();
        	this.model.login(username,password,this.onLoginFail);
        	$("#login-error").hide(100);
        	$("#login-btn").text(UIComponents.logingInLbl).prop("disabled", true);
        	
        },
        
        forgotPassword : function(event){
        	event.preventDefault();
        	var email = $("#email-inp").val();
        	var self = this;
        	this.model.forgotPassword(email,self.onForgotDone,self.onForgotFail);
        	$("#forgot-error").hide(100);
        	$("#forgot-success").hide(100);
        	$("#forgot-btn").text(UIComponents.sendingLinkLbl).prop("disabled", true);
        },
        
        onForgotDone : function(response){
        	console.log("Forgot done!");
        	console.log(response);
        	$("#forgot-success").show(100);
        	$("#forgot-btn").text(UIComponents.forgotLbl).prop("disabled", false);
        },
        
        onForgotFail : function(response){
        	console.log("Forgot failed!");
        	console.log("response");
        	$("#forgot-error").show(100);
        	$("#forgot-btn").text(UIComponents.forgotLbl).prop("disabled", false);
        },
        
        onLoginFail : function(){
        	$("#login-error").show(100);
        	$("#login-btn").text(UIComponents.loginLbl).prop("disabled", false);
        	
        }
        
        
	});
	
	return LoginModalView;
});