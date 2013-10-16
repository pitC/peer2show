define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/sidebarBasic.html',
         'text!templates/room/sidebarRoomAppLink.html',
         'webrtc/webRTCClient',
         'backbones/views/roomapps/whiteboard/whiteboardView',
         'backbones/views/roomapps/chat/chatView',
         'backbones/views/roomapps/call/callView',
         'backbones/views/roomapps/slideshow/slideshowView'
         
], function($, _, Backbone, roomTmpl,sidebarTmpl,sidebarRoomAppLinkTmpl, WebRTCClient,
		WhiteboardView,ChatView, CallView, SlideshowView){

	
		var DEFAULT_ROOM_NAME = "test";
		
		SidebarView = Backbone.View.extend({
        	initialize:function () {
                this.template = _.template(sidebarTmpl);
                this.roomLinkTmpl = _.template(sidebarRoomAppLinkTmpl);
                this.roomAppTitles = [];
                this.appSwitch = null;
            },
            
            events : {
				
				"click button": "onRoomAppLinkClick",
				
			},
			
			onRoomAppLinkClick : function(event){
				
				if(this.appSwitch){
					var title = $(event.target).text();
					this.appSwitch(title);
				}
			},
			
            render : function(){
                this.$el.html(this.template());
                
                for (var index in this.roomAppTitles){
                	var roomAppTitle = this.roomAppTitles[index];
                	this.$el.find("#room-app-links").append(this.roomLinkTmpl({title:roomAppTitle}));
                }
                
                return this;
            },
            
            addRoomAppLink : function(title){
            	console.log("Sidebar: add link "+title);
            	this.roomAppTitles.push(title);
            },
            
            
            renderVideoContainer : function(video){
            	video.controls = false;
            	this.$el.prepend(video);
            }
            
            
        });

		RoomView = Backbone.View.extend({
			
			
			
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.roomAppViews = {};
				this.activeAppView = null;
				this.roomName = options.room || DEFAULT_ROOM_NAME;
				this.webRTCClient = WebRTCClient;
				var self = this;
				
				
				this.sidebar = new SidebarView();
				this.sidebar.appSwitch = function(title){
					self.activateRoomApp(title);
				};
				
				this.webRTCClient.joinOrCreate({roomName:this.roomName});
				
				
				
				this.webRTCClient.onstream = function(e){
					console.log(e);
					
					self.sidebar.renderVideoContainer(e.mediaElement);
					for (var index in self.roomAppViews){
						if(self.roomAppViews[index].onStream)
							self.roomAppViews[index].onStream(e);
					}
				};
				
				
				
				this.webRTCClient.onopen = function(e){
					
					for (var index in self.roomAppViews){
						if(self.roomAppViews[index].onNewPeer)
							self.roomAppViews[index].onNewPeer(e);
					}
				};
				
				this.webRTCClient.onstreamended = function(e) {
					//TODO: remove stream from webRTC registry(streams)
					if (e.mediaElement.parentNode) {
                        e.mediaElement.parentNode.removeChild(e.mediaElement);
                    }
					for (var index in self.roomAppViews){
						if(self.roomAppViews[index].onStreamEnd)
							self.roomAppViews[index].onStreamEnd(e);
						if(self.roomAppViews[index].onPeerLeave)
							self.roomAppViews[index].onPeerLeave(e);
						
					}
				};
				
				
			},
			
			
	
            render : function(){
            	this.$el.html(this.template());
            	
            	this.initRoomApps();
                this.$el.find("#sidebar").append(this.sidebar.render().el);
                
                return this;
            },
            
            onShow : function(){
            	// either all 
            	/*
            	for (var key in this.roomAppViews) {
            		if (this.roomAppViews[key].onShow)
            			this.roomAppViews[key].onShow();
            	}
            	*/
            	
            	// or only the active one - tbd
//            	if (this.activeAppView.onShow)
//            		this.activeAppView.onShow();
            	
            	// or just activate app view where on show will be called as well
            	this.activateRoomApp("Whiteboard");
            	
            },
            
            initRoomApps : function(){
            	var whiteboard = new WhiteboardView(this.webRTCClient);
            	this.roomAppViews[whiteboard.title] = whiteboard;
            	
            	var chat = new ChatView(this.webRTCClient);
            	this.roomAppViews[chat.title] = chat;
            	
            	var call = new CallView(this.webRTCClient);
            	this.roomAppViews[call.title] = call;
            	
            	var slideshow = new SlideshowView(this.webRTCClient);
            	this.roomAppViews[slideshow.title] = slideshow;
            	
            	// fill links in sidebar
            	for (var key in this.roomAppViews) {
            		var title = this.roomAppViews[key].title;
            		this.sidebar.addRoomAppLink(title);
            	}
            	
            	
            },
            
            activateRoomApp : function(title){
            	var roomAppToActivate = this.roomAppViews[title];
            	var roomAppToDeactivate = this.activeAppView;
            	
            	if (roomAppToActivate){
            		this.$el.find("#main").empty();
                	this.$el.find("#main").append(roomAppToActivate.render().el);
                	this.activeAppView = roomAppToActivate;
                	this.activeAppView.onActivate();
                	if (roomAppToDeactivate) 	
                		roomAppToDeactivate.onDeactivate();
            	}
            }
			
        });
		return RoomView;
});