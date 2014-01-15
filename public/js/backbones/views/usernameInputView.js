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
			if(this.owner){
				this.introTemplate = _.template(IntroHostTmpl);
			}
			else{
				this.introTemplate = _.template(IntroGuestTmpl);
			}
			this.template = _.template(UserInputTmpl);
        },
        events: {
            "click #apply-bt": "setUserName",
            "keypress input[type=text]": "onEnter"
        },
        onEnter : function(event){
        	if (event.keyCode != 13) return;
			this.setUserName(event);
        },
        setUserName : function(event){
        	var roomId =  location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
        	
        	var userName = $("#username-inp").val();
        	var options = {roomId : roomId, user : userName,owner:this.owner};
        	this.callback(options);
        },
        render : function(){
        	
        	var intro = this.introTemplate();
        	var usernameInput = this.template();
        	this.$el.html(intro);
        	this.$el.append(usernameInput);
			return this;
        }
	});
	
	return UsernameInputView;
});