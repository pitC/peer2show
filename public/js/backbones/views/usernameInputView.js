define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/usernameInput.html',
         'text!templates/slideshowApp/introHost.html',
         'text!templates/slideshowApp/introGuest.html',
         
], function($, _, Backbone, UserInputTmpl,IntroHostTmpl,IntroGuestTmpl){
	
	
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
			
        },
        events: {
            "click #apply-bt": "setUserName",
            "keypress #username-inp": "onEnter"
        },
        onEnter : function(event){
        	if (event.keyCode != 13) return;
			this.setUserName(event);
        },
        setUserName : function(event){
        	
        	var userName = $("#username-inp").val();
        	var options = {user : userName,owner:this.owner, app:this.appRef};
        	this.callback(options);
        },
        render : function(){
        	
        	var intro = this.introTemplate();
        	
        	this.$el.html(intro);
        	
			return this;
        }
	});
	
	return UsernameInputView;
});