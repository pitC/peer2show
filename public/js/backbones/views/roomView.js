define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/overlay.html',
         'text!templates/modals/linkShareModal.html',
         'backbones/views/components/bugreportModalView',
         'webrtc/webRTCClient',
         'webrtc/roomStatus',
         'app/slideshowApp',
         'app/appStatus',
         'app/settings',
         'app/notificationManager',
         'backbones/collections/userCollection',
         'backbones/views/components/userArea',
         'backbones/views/roomSubviews'
], function($, _, Backbone, roomTmpl,overlayTmpl,linkShareModalTmpl, BugreportModalView, WebRTCClient,RoomStatus, SlideshowApp, AppStatus, Settings, NotificationManager, UserCollection, UserArea, RoomSubviews){

	
		var DEFAULT_ROOM_NAME = "test";
		var DEFAULT_USER_NAME = "user";

		RoomView = Backbone.View.extend({
	
			initialize : function(options){
				console.log("Settings: "+Settings.maxHeight);
				Settings.calculateMaxDimensions();
				
				this.roomName = options.roomId || DEFAULT_ROOM_NAME;
				this.username = options.user || DEFAULT_USER_NAME;
				this.owner = options.owner || false;
				
				this.notificationManager = new NotificationManager(this.$el);
			
				this.template = _.template(roomTmpl);
				this.overlay = _.template(overlayTmpl);
				this.linkShare = _.template(linkShareModalTmpl);
				this.bugreportModal = new BugreportModalView();
				
				
				
				this.initApp();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:this.username+"(me)"});
				
				this.roomSubviews = new RoomSubviews(this.$el,this.app);
				
				this.app.on('change_status',this.render,this);
				
				
			},
			
			initApp : function(){
				this.webRTCClient = new WebRTCClient();
				var appOptions = {webRTC:this.webRTCClient};
				this.app = new SlideshowApp(appOptions);
				this.app.bindCommunicationEvents();
			},
			
			initWebRTC : function(){
				var self = this;	
				this.app.setStatus(AppStatus.OPENING_CHANNEL);
				
				this.webRTCClient.onerror = function(e){
					alert(e.message);
				};
				
				if (this.owner){
					this.webRTCClient.create({roomName:this.roomName,username:this.username},this.onRoomInitChange,this);
				}
				else{
					this.webRTCClient.join({roomName:this.roomName,username:this.username},this.onRoomInitChange, this);
				}
				
				this.webRTCClient.onopen = function(e){
					console.log("Open!");
					var username = e.username || e.peerId || "Guest"; 
					self.userCollection.add({username:username});
					self.app.setStatus(AppStatus.READY);
					
					// must be delayed, otherwise receiver is not yet prepared
					setTimeout(function(){
						self.webRTCClient.sendOtherPeers(e.peerId);
						
						self.app.retransmitFiles(e.peerId||null);
					},2000);
					
					var options = {
							'alert_class':'alert-info',
							'alert_message':username+' joined',
							appendMode : true
					};
					self.notificationManager.render(options);
				};
				
				this.webRTCClient.onclose = function(e) {
					console.log("User left!");
					console.log(e);
					var success = self.userCollection.removeUser(e.username);
					if (success){
						var options = {
								'alert_class':'alert-info',
								'alert_message':e.username+' left!',
								appendMode : true
						};
						self.notificationManager.render(options);
					}
				};
			},
			
			onRoomInitChange : function(caller,status){
				console.log("Room status change! "+status);
				switch(status){
				case RoomStatus.NEW_ROOM: 
					caller.app.setStatus(AppStatus.READY);
					break;
				case RoomStatus.JOINING:
					caller.app.setStatus(AppStatus.JOINING_ROOM);
					break;
				}
				
			},
			
            render : function(){
            	console.log("Room view rerender! "+this.app.status);
            	
            	if (this.roomSubviews.isInitialized()){
            		this.renderOverlay();
            	}
            	else{
            		console.log("Rerender all!");
            		this.$el.html(this.template());
            		// TODO: refactor - keep userCollection as peer Ids in app object. Move UserArea to roomSubviews
	                this.userArea = new UserArea({collection:this.userCollection});
	            	this.$el.find("#users-area").append(this.userArea.render().el);
	            	this.roomSubviews.render();
	            	this.renderOverlay();
	            	this.renderModals();
            	}
                return this;
            },
            events: {
                "click .btn-prev": "prev",
                "click .btn-next": "next",
                "change #file-input" : "onFileInput",
                "click #sidebar-toggle":"sidebarToggle",
                "click #btn-fullscr": "fullscreen",
                
//                "keypress ": "onKeypress"
            },
            
                     
            fullscreen : function(e){
            	var element = document.getElementById("show-area");
            	if (element.webkitRequestFullScreen)
            		{
            		element.webkitRequestFullScreen();
            		}
            	else if(element.mozRequestFullScreen) {
            		element.mozRequestFullScreen();
            	}
            	else{
            		element.requestFullScreen();
            	};
            },
        
            prev : function(e){
            	this.app.prevSlide();
            },
            next : function(e){
            	this.app.nextSlide();
            },
            
            onFileInput : function(event){
            	console.log("File input!");
            	console.log(event);
            	var files = event.target.files;
            	this.app.readfiles(files);
            },
            
            sidebarToggle : function(event){
            	var displayed = $("#sidebar").is(":visible");
            	if (displayed){
            		// if displayed, then hide
            		$('#sidebar').toggleClass('hidden');
            		
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){});
            		// slide topbar to the left
            		$('#topbar').toggleClass('col-md-offset-3 col-md-offset-4',300).promise().done(function(){});
            		
            		$('#sidebar-toggle-div').toggleClass('col-md-offset-3 col-md-offset-4',300);
            		
            	}
            	else{
            		// if hidden, then display
            		// slide topbar to the right
            		$('#topbar').toggleClass('col-md-offset-3 col-md-offset-4',300);
            		// slide toggle button right-most
        			$('#sidebar-toggle-div').toggleClass('col-md-offset-3 col-md-offset-4',300);
        			
        			// side bar must be toggled after,
        			// otherwise it's shown shortly at the bottom of the page for small pictures
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){
            			$('#sidebar').toggleClass('hidden');	
            		});
            		
            	}
            },
            
            onKeypressInit : function(){
            	var self = this;
            	$(document).bind('keyup', function(e){
            		switch(e.keyCode){
                	case 37:
                	case 38:
                		self.app.prevSlide();
                		e.preventDefault();
                		break;
                	case 39:
                	case 40:
                	case 32:	
                		self.app.nextSlide();
                		e.preventDefault();
                		break;
                		
                	}

            	});
            	
            },
            
            renderModals : function(){
            	this.$el.append(this.linkShare({link:location.href}));
            	
            	this.$el.append(this.bugreportModal.render().el);

            },
                       
            renderOverlay : function(){
            	console.log("Not rerendering everything...");
        		if (this.app.status == AppStatus.READY){
        			this.removeOverlay();
        		}
        		// temporarily block overlay
//        		else{
//        			var options = {msg:this.app.status};
//        			this.addOverlay(options);
//        		}
            },
            
            addOverlay : function(options){
            	// if overlay exists, remove it first to have only one instance
            	if ($("#overlay").length > 0){
            		this.removeOverlay(options);
				}
            	var overlayHtml = this.overlay(options);
            	this.$el.append(overlayHtml);
            	console.log("Overlay added!");
            },
            
            removeOverlay : function(options){
            	$("#overlay").remove();
            },
            
            onShow : function(){
            	
            	this.roomSubviews.onShow();
            	this.userArea.onShow();
            	this.renderOverlay();
            	this.onKeypressInit();
            	this.setHeight();
            },
            
            setHeight :function(){
            	var height = "500px";
            	$('#sidebar-panel').css("max-height",height);
            	
            }
            
			
        });
		return RoomView;
});