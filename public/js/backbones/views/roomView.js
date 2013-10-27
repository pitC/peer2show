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
		var DEFAULT_USER_NAME = "user";

		RoomView = Backbone.View.extend({
	
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.roomName = options.room || DEFAULT_ROOM_NAME;
				this.username = options.user || DEFAULT_USER_NAME;  
				this.webRTCClient = WebRTCClient;
				

				this.app = new SlideshowApp(this.webRTCClient);
				this.app.bindCommunicationEvents();
				this.initWebRTC();
				
				this.userCollection = new UserCollection();
				this.userCollection.add({username:this.username+"(me)"});
			},
			
			initWebRTC : function(){
				var self = this;
				this.webRTCClient.joinOrCreate({roomName:this.roomName,userName:this.username});
				
				this.webRTCClient.onstream = function(e){
					console.log("Join!");
					console.log(e);
				};

				this.webRTCClient.onopen = function(e){
					console.log("Open!");
					console.log(e);
					var username = e.extra['user-name'] || e.userid; 
					self.userCollection.add({username:username});
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