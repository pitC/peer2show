define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',

         'webrtc/webRTCClient',
         'app/slideshow/slideshowApp',
         'backbones/collections/userCollection',
         'backbones/views/showArea',
         'backbones/views/previewArea',
         'backbones/views/userArea'
         
], function($, _, Backbone, roomTmpl,WebRTCClient, SlideshowApp, UserCollection, ShowArea, PreviewArea, UserArea){

	
		var DEFAULT_ROOM_NAME = "test";

		RoomView = Backbone.View.extend({
	
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.roomName = options.room || DEFAULT_ROOM_NAME;
				this.webRTCClient = WebRTCClient;
				

				this.app = new SlideshowApp(this.webRTCClient);
				this.app.bindCommunicationEvents();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:"me"});
			},
			
			initWebRTC : function(){
				var self = this;
				this.webRTCClient.joinOrCreate({roomName:this.roomName});
				
				this.webRTCClient.onstream = function(e){
					console.log("Join!");
					console.log(e);
				};

				this.webRTCClient.onopen = function(e){
					console.log("Open!");
					console.log(e);
					self.userCollection.add({username:e.userid});
				};
				
				this.webRTCClient.onstreamended = function(e) {
					
				};
			},
			
			
	
            render : function(){
            	this.$el.html(this.template());
            	this.showArea  = new ShowArea(this.app);
            	this.previewArea = new PreviewArea(this.app);
                this.userArea = new UserArea({collection:this.userCollection});
            	
            	this.$el.find("#container").append(this.showArea.render().el);
            	this.$el.find("#container").append(this.previewArea.render().el);
            	this.$el.find("#container").append(this.userArea.render().el);
            	
                return this;
            },
            
            onShow : function(){
            	this.showArea.onShow();
            	this.previewArea.onShow();
            }
			
        });
		return RoomView;
});