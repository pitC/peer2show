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
			
			this.listenTo(this.model,"authorised",this.onAuthorised);
			this.listenTo(this.model,"unauthorised",this.onUnauthorised);
			this.loggedIn = false;
        },
        
        
        
        render : function(){
        	var data = $.extend({},UIComponents,{});
            this.$el.html(this.template(data));
            
            return this;
        },
        
        
        
        events : {
//        	"click #login-btn": "login",
        	"submit #login-form":"login"
        		
        },
        
        login : function(event){
        	event.preventDefault();
        	console.log("Trying to log in...");
        	
        	var username = $("#usernameLoginInp").val();
        	var password = $("#passwordLoginInp").val();
        	this.model.login(username,password);
        }
        
	});
	
	return LoginModalView;
});