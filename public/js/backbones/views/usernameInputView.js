define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'text!templates/slideshowApp/usernameInput.html',
         'text!templates/slideshowApp/introHost.html',
         'text!templates/slideshowApp/introGuest.html',
         'backbones/views/components/newSessionModal',
         
], function($, _, Backbone, Settings, UserInputTmpl,IntroHostTmpl,IntroGuestTmpl,NewSessionModal){
	
	
	UsernameInputView = Backbone.View.extend({
		initialize:function (options) {
			this.callback = options.callback;
			this.owner = options.owner;
			this.appRef = options.app;
			if(this.owner){
				this.introTemplate = _.template(IntroHostTmpl);
			}
			else{
				this.introTemplate = _.template(IntroGuestTmpl);
			}
			
			this.newSessionModal = new NewSessionModal();
			
        },
        events: {
            "click #apply-bt": "setUserName",
            "keypress #username-inp": "onEnter",
            "click #step-one": "focusCreate"
        },
        
        focusCreate : function(event){
        	
        	$("#username-inp").focus();
        },
                
        onEnter : function(event){
        	if (event.keyCode != 13) return;
			this.setUserName(event);
        },
        setUserName : function(event){
        	
        	var userName = $("#username-inp").val();
        	var options = {user : userName,owner:this.owner, app:this.appRef};
        	
        	Settings.userName = userName;
        	Settings.owner = this.owner;
        	
        	
        	this.callback(options);
        },
        render : function(){
        	
        	var intro = this.introTemplate();
        	
        	this.$el.html(intro);
        	
        	this.$el.append(this.newSessionModal.render().el);
        	
			return this;
        }
	});
	
	return UsernameInputView;
});