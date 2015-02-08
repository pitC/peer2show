define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/overlay.html',
         'text!templates/modals/confirmCloseModal.html',
         'webrtc/webRTCClient',
         'webrtc/roomStatus',
         'app/slideshowApp',
         'app/appStatus',
         'app/settings',
         'app/logManager',
         'app/notificationManager',
         'backbones/collections/userCollection',
         'backbones/views/components/userArea',
         'backbones/views/roomSubviews',
         'backbones/views/sessionEndView',
         'backbones/views/components/newSessionModal',
         'backbones/views/components/sessionShareModal',
         "i18n!nls/uiComponents"
], function($, _, Backbone, roomTmpl,overlayTmpl,confirmCloseModalTmpl,WebRTCClient,RoomStatus, SlideshowApp, AppStatus, Settings, LogManager,  NotificationManager, UserCollection, UserArea, RoomSubviews, SessionEndView, NewSessionModal, SessionShareModal,UIComponents){

	
		var DEFAULT_ROOM_NAME = "test";
		var DEFAULT_USER_NAME = "user";

		RoomView = Backbone.View.extend({
			
			tagName: "div",
			id: "room-container",
			className: "container",
	
			initialize : function(options){
				
				console.log("Settings: ");
				console.log(Settings);
				Settings.calculateMaxDimensions();
				
				this.roomName = options.roomId || DEFAULT_ROOM_NAME;
				this.username = options.user || DEFAULT_USER_NAME;
				this.owner = options.owner || false;
				
				if (this.owner){
					LogManager.setSessionRole("owner");
				}
				else{
					LogManager.setSessionRole("guest");
				}
				
				this.notificationManager = new NotificationManager();
			
				this.template = _.template(roomTmpl);
			
				
				this.overlay = _.template(overlayTmpl);
				
				this.confirmClose = _.template(confirmCloseModalTmpl);
				
				this.newSessionModal = new NewSessionModal();
				this.sessionShareModal = new SessionShareModal();
				
				this.initApp();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:this.username+UIComponents.userMeLbl,id:-1});
				
				this.roomSubviews = new RoomSubviews(this.$el,this.app);
				
				this.app.on('change_status',this.render,this);			
			},
			
			initApp : function(){
				this.webRTCClient = new WebRTCClient();
				var appOptions = {webRTC:this.webRTCClient};
				this.app = new SlideshowApp(appOptions);
				this.app.bindCommunicationEvents();
				
				this.app.loaderLog.on("change",this.updateOverlay);
				var self = this;
				this.app.loaderLog.on("finished",function(errorLog){
					console.log("Load finished!");
					for (var i in errorLog){
						var msg = errorLog[i];
						console.log("Log error");
						console.log(msg);
						var alertMsg = UIComponents.loadingError+msg.msg||UIComponents[msg.msgType];
						var alertMsgExt = UIComponents[msg.msgType];
						var options = {
								'alertClass':'alert-danger',
								'alertMessage':alertMsg,
								'alertMessageExt':alertMsgExt
						};
						self.notificationManager.render(options);
					}
				});
			},
			
			
			initWebRTC : function(){
				var self = this;	
				this.app.setStatus(AppStatus.OPENING_CHANNEL);
				
				
				this.webRTCClient.onerror = function(e){
//					alert(e);
					console.log(">>> FATAL ERROR!");
					console.log(e);
					LogManager.logEvent(e,LogManager.ERROR);
					
					self.app.setStatus(AppStatus.FATAL_ERROR);
				};
				
				if (this.owner){
					this.webRTCClient.create({roomName:this.roomName,username:this.username},this.onRoomInitChange,this);
					
				}
				else{
					this.webRTCClient.join({roomName:this.roomName,username:this.username},this.onRoomInitChange, this);
				}
				
				this.webRTCClient.onopen = function(e){
					console.log("Open!");
					var username = e.username || e.peerId || UIComponents.userGuestLbl; 
					self.userCollection.add({username:username,id:e.peerId});
					self.app.setStatus(AppStatus.READY);
					
					// must be delayed, otherwise receiver is not yet prepared
					setTimeout(function(){
						self.webRTCClient.sendOtherPeers(e.peerId);
						
						self.app.retransmitFiles(e.peerId||null);
					},2000);
					
					var options = {
							'alertClass':'alert-info',
							'alertMessage':username+' '+UIComponents.userJoinedMsg,
							'alertMessageExt':''
					};
					self.notificationManager.render(options);
					
					if (Settings.owner){
						if (Settings.userName !== 'do-not-log'){
							var event = {session:Settings.roomName,type:'new-guest'};
							LogManager.logEvent(event,LogManager.KEEN);
						}
					};
				};
				
				this.webRTCClient.onclose = function(e) {
					console.log("User left!");
					console.log(e);
					var success = self.userCollection.removeUser(e.username);
					if (success){
						var options = {
								'alertClass':'alert-info',
								'alertMessage':e.username+' '+UIComponents.userLeftMsg,
								'alertMessageExt':''
						};
						self.notificationManager.render(options);
					}
				};
			},
			
			onRoomInitChange : function(caller,status,event){
				console.log("Room status change! "+status);
				console.log(event);
				switch(status){
				case RoomStatus.NEW_ROOM: 
					caller.app.setStatus(AppStatus.READY);
					break;
				case RoomStatus.JOINING:
					caller.app.setStatus(AppStatus.JOINING_ROOM);
					break;
				case RoomStatus.FAILED:
					LogManager.logEvent(event,LogManager.ERROR);
					caller.app.setStatus(AppStatus.FATAL_ERROR);
//					caller.render();
					break;
				}
				
			},
			
			updateOverlay : function(status){
				
				// if status loading photos
				if($("#overlay").length > 0){
					console.log("[OVERLAY] Update!"+status);
					$("#msgExt").text(status);
				}
			},
			
            render : function(){
            	console.log("Room view rerender! "+this.app.status);
        
            	if (this.app.status == AppStatus.SESSION_ENDED || this.app.status == AppStatus.FATAL_ERROR){
            		
            		console.log("Render session end");
            		options = {message:LogManager.getLastMessage(),status:this.app.status};
            		this.sessionEnd = new SessionEndView();
            		this.$el.html(this.sessionEnd.render().el);
            		this.removeOverlay();
            	}
            	
            	else if(this.roomSubviews.isInitialized()){
            
            		this.renderOverlay();
            	}            	
            	else{
            		console.log("Rerender all!");
            		
                	var data = $.extend({},UIComponents,{});
            		this.$el.html(this.template(data));
            		// TODO: refactor - keep userCollection as peer Ids in app object. Move UserArea to roomSubviews
	                this.userArea = new UserArea({collection:this.userCollection,app:this.app});
	            	this.$el.find("#users-area").append(this.userArea.render().el);
	            	this.roomSubviews.render();
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
                "click #close-fullscreen":"leaveFullscreen",
                "click #confirm-close": "switchOffConfirmed",
                "click a[data-target='#chat-area']":"onChatAreaClick",
                "click a[data-target='#feedback-modal']": "onFeedbackFormOpen",
                "click a[data-target='#smartvote-modal']": "onFeedbackFormOpen"
//                "keypress ": "onKeypress"
            },
            

            onChatAreaClick : function(e){
            	this.roomSubviews.subviews['#chat-area'].toggleBlink(false);
            },
                       
            switchOffConfirmed : function(e){
            	console.log("switch off!");
            	this.app.close();
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
            
            leaveFullscreen : function(e){
            	console.log("Leave fullscreen!");
            	document.webkitCancelFullScreen();
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
            	var self = this; 
            	if (displayed){
            		// if displayed, then hide
            		$('#sidebar').toggleClass('hidden');
            		
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){
            			self.roomSubviews.subviews["#show-area"].renderCurrentSlide();
            		});
            		// slide topbar to the left
            		$('#topbar').toggleClass('col-md-offset-4 col-md-offset-3',300).promise().done(function(){});
            		
            		$('#sidebar-toggle-div').toggleClass('col-md-offset-3 col-md-offset-4',300);
            		
            	}
            	else{
            		// if hidden, then display
            		// slide topbar to the right
            		$('#topbar').toggleClass('col-md-offset-4 col-md-offset-3',300);
            		// slide toggle button right-most
        			$('#sidebar-toggle-div').toggleClass('col-md-offset-3 col-md-offset-4',300);
        			
        			// side bar must be toggled after,
        			// otherwise it's shown shortly at the bottom of the page for small pictures
            		$('#show-area').toggleClass('col-md-10 col-md-12',300).promise().done(function(){
            			$('#sidebar').toggleClass('hidden');
            			self.roomSubviews.subviews["#show-area"].renderCurrentSlide();
            		});	
            	}
            	
            	
            },
            
            onKeypressInit : function(){
            	var self = this;
            	$(document).bind('keyup', function(e){
            		switch(e.keyCode){
                	case 37:
                	case 38:
                		// do it only if message chat has no focus
                		if (!$("#message-inp").is(":focus")){
                			self.app.prevSlide();
                		}
                		e.preventDefault();
                		break;
                	case 39:
                	case 40:
                	case 32:
                		// do it only if message chat has no focus
                		if (!$("#message-inp").is(":focus")){
                			self.app.nextSlide();
                		}
                		e.preventDefault();
                		break;
                		
                	}

            	});
            	
            },
            
            renderModals : function(){
            	var modalContainer = this.$el.find("#modal-container");
            	$(modalContainer).append(this.sessionShareModal.render().el);
            	$(modalContainer).append(this.newSessionModal.render().el);            	
            	var confirmCloseData = UIComponents;
            	$(modalContainer).append(this.confirmClose(confirmCloseData));
//            	$("#modal-container").append(this.confirmClose(confirmCloseData));
            },
            
            renderOverlay : function(){
            	console.log("Not rerendering everything...");
        		if (this.app.status == AppStatus.READY || this.app.status == AppStatus.FATAL_ERROR){
        			this.removeOverlay();
        		}
        		else{
        			var options = {msg:UIComponents[this.app.status]};
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
            	
            	this.roomSubviews.onShow();
            	if (this.userArea){
            		this.userArea.onShow();
            	}
            	this.renderOverlay();
            	this.onKeypressInit();
            	this.setHeight();
            	this.newSessionModal.onRender();
            	this.listenToFullscreenEvents();
            },
                       
            setHeight :function(){
            	var height = "500px";
            	$('#sidebar-panel').css("max-height",height);
            },
            
            listenToFullscreenEvents : function(){
            	var self = this;
            	console.log("[ROOM VIEW] listen to fullscreen");
		    	document.addEventListener("fullscreenchange", self.onFullScreenChange, false);      
		    	document.addEventListener("webkitfullscreenchange", self.onFullScreenChange, false);
		    	document.addEventListener("mozfullscreenchange", self.onFullScreenChange, false);
            },
            
            onFullScreenChange : function(){
            	console.log("[ROOM VIEW] toggle elements");
            	$('.fullscreen-element').toggle();
            },
            
            
            
            
			
        });
		return RoomView;
});