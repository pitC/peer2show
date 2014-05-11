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
	
	
	HomepageView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.guest = options.guest || false;
			this.callback = options.callback;
			
			if(this.guest){
				this.introTemplate = _.template(IntroGuestTmpl);
			}
			else{
				this.introTemplate = _.template(IntroHostTmpl);
				
			}
			
			this.newSessionModal = new NewSessionModal(options);
			
        },
        events: {
            "click #apply-bt": "joinSession",
            "keypress #username-inp": "onEnter",
            "click #step-one": "focusCreate"
        },
        
        focusCreate : function(event){
        	$('#new-session-modal').modal('show');
        },
                
        onEnter : function(event){
        	if (event.keyCode != 13) return;
			this.joinSession(event);
        },
        joinSession : function(event){
        	
        	var userName = $("#username-inp").val();
        	var options = {user : userName,owner:false};
        	
        	Settings.userName = userName;
        	Settings.owner = false;
        	
        	
        	this.callback(options);
        },
        
        render : function(){
        	
        	var intro = this.introTemplate();
        	
        	this.$el.html(intro);
        	
        	this.$el.append(this.newSessionModal.render().el);
        	
			return this;
        },
        
        onShow : function(){
        	this.newSessionModal.onRender();
        }
	});
	
	return HomepageView;
});