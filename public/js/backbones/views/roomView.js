define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/overlay.html',
         'text!templates/modals/linkShareModal.html',
         'text!templates/modals/notificationModal.html',
         'webrtc/webRTCClient',
         'webrtc/roomStatus',
         'app/slideshowApp',
         'app/appStatus',
         'app/settings',
         'backbones/collections/userCollection',
         'backbones/views/showArea',
         'backbones/views/previewArea',
         'backbones/views/userArea',
         'backbones/views/chatArea'
         
], function($, _, Backbone, roomTmpl,overlayTmpl,linkShareModalTmpl,notificationModalTmpl, WebRTCClient,RoomStatus, SlideshowApp, AppStatus, Settings, UserCollection, ShowArea, PreviewArea, UserArea, ChatArea){

	
		var DEFAULT_ROOM_NAME = "test";
		var DEFAULT_USER_NAME = "user";

		RoomView = Backbone.View.extend({
	
			initialize : function(options){
				console.log("Settings: "+Settings.maxHeight);
				Settings.calculateMaxDimensions();
				
				this.roomName = options.roomId || DEFAULT_ROOM_NAME;
				this.username = options.user || DEFAULT_USER_NAME;
				this.owner = options.owner || false;
			
				this.template = _.template(roomTmpl);
				this.overlay = _.template(overlayTmpl);
				this.linkShare = _.template(linkShareModalTmpl);
				this.notificationModal = _.template(notificationModalTmpl);
				
				this.initApp();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:this.username+"(me)"});
				
				
				
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
					self.renderNotification(options);
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
						self.renderNotification(options);
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
            	
            	if(this.showArea != null && this.previewArea != null){
            		this.renderOverlay();
            	}
            	else{
            		console.log("Rerender all!");
            		this.$el.html(this.template());
	            	this.showArea  = new ShowArea(this.app);
	            	this.previewArea = new PreviewArea(this.app);
	                this.userArea = new UserArea({collection:this.userCollection});
	                this.chatArea = new ChatArea(this.app);
	            	this.$el.find("#show-area").append(this.showArea.render().el);
	            	this.$el.find("#preview-area").append(this.previewArea.render().el);
	            	this.$el.find("#users-area").append(this.userArea.render().el);
	            	this.$el.find("#chat-area").append(this.chatArea.render().el);
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
                "click #btn-fullscr": "fullscreen"
//                "keypress ": "onKeypress"
            },
            
            fullscreen : function(e){
            	var element = document.getElementById("slide-show-area");
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
//            	this.renderNotification({});
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
            		$('#sidebar').toggle();
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){});
            	}
            	else{
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){
            			$('#sidebar').toggle();
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
            
            renderNotification : function(options){
            	var notification = this.notificationModal(options);
            	var self = this;
            	if (options.appendMode){
            		if ($('.notification.alert-info').length > 0){
            			
            			$("<p>"+options.alert_message+"</p>").hide().appendTo($('.notification.alert-info')).fadeIn();
            			
            		}
            		else{
            			$(notification).hide().prependTo(self.$el).fadeIn().css('z-index',1);
            		}
            	}
            	else{            	
	            	var maxz = 0;    
	            	$('.notification.alert-info').each(function(){
	            	    var z = parseInt($(this).css('z-index'), 10);
	            	    if (maxz<z) {
	            	        
	            	        maxz = z;
	            	    }
	            	});
	            	var topZ = maxz +1;
	            	$(notification).hide().prependTo(self.$el).fadeIn().css('z-index',topZ);
            	}
            	
            },
            
            renderModals : function(){
            	this.$el.append(this.linkShare({link:location.href}));

            },
                       
            renderOverlay : function(){
            	console.log("Not rerendering everything...");
        		if (this.app.status == AppStatus.READY){
        			this.removeOverlay();
        		}
        		else{
        			var options = {msg:this.app.status};
        			this.addOverlay(options);
        		}
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
            	
            	this.showArea.onShow();
            	this.previewArea.onShow();
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