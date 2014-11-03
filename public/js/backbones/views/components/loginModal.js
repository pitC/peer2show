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
            
            return this;
        },
        
        
        
        events : {
        	"submit #login-form":"login",
        	"click #item-toggle-btn" : "toggleSignInUp",
        	"click #password-reset-btn": "gotoPasswordReset"
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
        	switch(index){
        	case 0:
        		btnLbl = UIComponents.registerLbl;
        		break;
        	case 1:
        	case 2:
        		btnLbl = UIComponents.loginLbl;
        		break;
        	}
        	this.currentView = index;
        	$('#user-management-carousel').carousel(index);
        	$('#item-toggle-btn').text(btnLbl);
        },
        
        
        
        
        login : function(event){
        	event.preventDefault();
        	console.log("Trying to log in...");
        	
        	var username = $("#username-login-inp").val();
        	var password = $("#password-login-inp").val();
        	this.model.login(username,password);
        }
        
	});
	
	return LoginModalView;
});