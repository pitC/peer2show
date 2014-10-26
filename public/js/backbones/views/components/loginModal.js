define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/loginModal.html',
         'app/settings',
         "i18n!nls/uiComponents",
         "backbones/models/userModel"
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, LoginModalTmpl, Settings, UIComponents,UserModel
){
	
	LoginModalView = Backbone.View.extend({
		initialize:function (options) {
			this.template = _.template(LoginModalTmpl);
			this.modalEl = $('#login-modal');
			this.userModel = new UserModel();
        },
        
        render : function(){
        	var data = $.extend({},UIComponents,{});
            this.$el.html(this.template(data));
            return this;
        },
        
        events : {
        	"click #login-btn": "login"
        },
        
        login : function(event){
        	console.log("Trying to log in...");
        	
        	var username = $("#usernameLoginInp").val();
        	var password = $("#passwordLoginInp").val();
        	this.userModel.login(username,password);
        }
        
	});
	
	return LoginModalView;
});