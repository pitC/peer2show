define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'text!templates/slideshowApp/usernameInput.html',
         'text!templates/slideshowApp/introHost.html',
         'text!templates/slideshowApp/introGuest.html',
         'backbones/views/components/newSessionModal',
         'carousel',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, Settings, UserInputTmpl,IntroHostTmpl,IntroGuestTmpl,NewSessionModal,Carousel,UIComponents){
	
	
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
            var section = '#learn-more-header';
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
        	var isOwner = $("#username-inp").attr('data-is-owner') == "true";
        	Settings.userName = userName;
        	Settings.owner = isOwner;
        	if (isOwner){
        		Settings.roomName = Settings.generateRoomId();
            	window.location.hash = Settings.roomName;
        	}
        	else{
        		var options = {user : userName,owner:false};
            	this.callback(options);
        	}
        },
        
        render : function(){
        	
        	var data = $.extend({},UIComponents,{});
        	var intro = this.introTemplate(data);
        	
        	this.$el.html(intro);
        	
        	this.$el.append(this.newSessionModal.render().el);
        	
			return this;
        },
        
        onShow : function(){
        	this.newSessionModal.onRender();
        	var carouselEl = $("#learn-more-header");
        	carouselEl.owlCarousel({
              	 
//                navigation : true, // Show next and prev buttons
                slideSpeed : 300,
                paginationSpeed : 400, 
                autoPlay:3000,
                singleItem:true,
                afterMove: moved,
                rewindNav:false
//                stopOnHover:true
            });
        	
        	var owl = carouselEl.data('owlCarousel');
        	
        	owl.stop();
        	
        	$(window).scroll(function() {
        		   var hT = carouselEl.offset().top,
        		       hH = carouselEl.outerHeight(),
        		       wH = $(window).height(),
        		       wS = $(this).scrollTop();
        		   if (wS > (hT+hH-wH)){
        		       console.log('you have scrolled to carousel!');
        		       owl.play();
        		   }
        		   else{
        			   console.log('you have scrolled out of carousel!');
        			   owl.stop();
        		   }
        		});
        	
        	function moved(el){
        		var emphesizeClass = 'emph';
        		console.log("owl moved!");
        		var srcId = $(el).attr('id');
        		var num = this.currentItem;
        		$('.carousel-sync').removeClass(emphesizeClass);
        		var target = '#'+srcId+"-"+num;
        		console.log("target "+target);
        		$(target).addClass(emphesizeClass);
        		
        	};
        	var self = this;
        	$("#learn-more-action").on("click",self.learnMore);
        }
	});
	
	return HomepageView;
});