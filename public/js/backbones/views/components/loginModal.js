define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/loginModal.html',
         'app/settings',
         'app/globals',
         "i18n!nls/uiComponents"
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, LoginModalTmpl, Settings,Globals, UIComponents
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
        
        onShow : function(){
        	var self = this;
            $('#login-modal').on('hidden.bs.modal', function (e) {
				console.log("On modal hide!"+self.loggedIn);
				if (self.loggedIn){
					Globals.router.navigate("home/",{trigger:true,replace: true});
				}  
			});
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
        },
        
        onAuthorised : function(event){
        	console.log(event);
        	this.loggedIn = true;
        	$('#login-modal').modal('hide');
        	
        },
        
        onUnauthorised : function(event){
        	console.log(event);
        	
        }
        
	});
	
	return LoginModalView;
});