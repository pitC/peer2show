define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'text!templates/slideshowApp/usernameInput.html',
         'text!templates/slideshowApp/introHost.html',
         'text!templates/slideshowApp/introGuest.html',
         'backbones/views/components/newSessionModal',
         'carousel'
         
], function($, _, Backbone, Settings, UserInputTmpl,IntroHostTmpl,IntroGuestTmpl,NewSessionModal,Carousel){
	
	
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
            "click #step-one": "focusCreate",
            "click #learn-more-action": "learnMore"
        },
        
        learnMore : function(event){
        	event.preventDefault();
            var section = '#learn-more';
            $("html, body").animate({
                scrollTop: $(section).offset().top
            });
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
        	$(".carousel-enabled").owlCarousel({
           	 
                //navigation : true, // Show next and prev buttons
                slideSpeed : 300,
                paginationSpeed : 400,
//                items : 1,
                autoPlay:3000,
                singleItem:true
           
                // "singleItem:true" is a shortcut for:
                // items : 1, 
                // itemsDesktop : false,
                // itemsDesktopSmall : false,
                // itemsTablet: false,
                // itemsMobile : false
           
            });
        }
	});
	
	return HomepageView;
});