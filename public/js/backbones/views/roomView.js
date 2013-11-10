define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/overlay.html',
         'webrtc/webRTCClient',
         'webrtc/roomStatus',
         'app/slideshowApp',
         'app/appStatus',
         'backbones/collections/userCollection',
         'backbones/views/showArea',
         'backbones/views/previewArea',
         'backbones/views/userArea'
         
], function($, _, Backbone, roomTmpl,overlayTmpl, WebRTCClient,RoomStatus, SlideshowApp, AppStatus, UserCollection, ShowArea, PreviewArea, UserArea){

	
		var DEFAULT_ROOM_NAME = "test";
		var DEFAULT_USER_NAME = "user";

		RoomView = Backbone.View.extend({
	
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.overlay = _.template(overlayTmpl);
				this.roomName = options.roomId || DEFAULT_ROOM_NAME;
				this.username = options.user || DEFAULT_USER_NAME;  
				this.webRTCClient = WebRTCClient;
				
				var appOptions = {webRTC:this.webRTCClient};

				this.app = new SlideshowApp(appOptions);
				this.app.bindCommunicationEvents();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:this.username+"(me)"});
				
				this.app.on('change_status',this.render,this);
				
			},
			
			initWebRTC : function(){
				var self = this;
				this.app.setStatus(AppStatus.OPENING_CHANNEL);
				// TODO: callback on connection
				this.webRTCClient.joinOrCreate({roomName:this.roomName,userName:this.username},this.onRoomInitChange,this);
				
				
				this.webRTCClient.onstream = function(e){
					console.log("Join!");
					console.log(e);
					
				};

				this.webRTCClient.onopen = function(e){
					console.log("Open!");
					console.log(e);
					var username = e.extra['user-name'] || e.userid; 
					self.userCollection.add({username:username});
					self.app.setStatus(AppStatus.READY);
				};
				
				this.webRTCClient.onstreamended = function(e) {
					console.log("User left!");
					console.log(e);
				};
			},
			
			onRoomInitChange : function(caller,status){
				console.log("Room status change! "+status);
				switch(status){
				case RoomStatus.NEW_ROOM: 
					caller.app.setStatus(AppStatus.WAITING_FOR_USERS);
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
	            	this.$el.find("#container").append(this.showArea.render().el);
	            	this.$el.find("#container").append(this.previewArea.render().el);
	            	this.$el.find("#container").append(this.userArea.render().el);
	            	this.renderOverlay();
            	}
                return this;
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
            	this.renderOverlay();
            }
			
        });
		return RoomView;
});