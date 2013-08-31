define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/room.html',
         'text!templates/room/sidebarBasic.html',
         'backbones/views/subapps/whiteboard/whiteboardView',
         'webrtc/webRTCClient'
         
], function($, _, Backbone, roomTmpl,sidebarTmpl, WhiteboardView,WebRTCClient){

	
		var DEFAULT_ROOM_NAME = "test";
		
		SidebarView = Backbone.View.extend({
        	initialize:function () {
                this.template = _.template(sidebarTmpl);
                
            },
			
			
            render : function(){
                this.$el.html(this.template());
                
                return this;
            },
            
            renderVideoContainer : function(video){
            	this.$el.prepend(video);
            }
            
            
        });

		RoomView = Backbone.View.extend({
			
			
			
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.subviews = [];
				this.roomName = options.room || DEFAULT_ROOM_NAME;
				this.webRTCClient = WebRTCClient;
				
				this.sidebar = new SidebarView();
				
				this.webRTCClient.joinOrCreate({roomName:this.roomName});
				
				var self = this;
				
				this.webRTCClient.onstream = function(e){
					console.log(e);
					self.sidebar.renderVideoContainer(e.mediaElement);
				};
				
				this.webRTCClient.onopen = function(e){
					for (var i = 0; i<self.subviews.length;i++){
						if(self.subviews[i].onNewPeer)
							self.subviews[i].onNewPeer(e);
					}
				};
				
			},
	
            render : function(){
            	this.$el.html(this.template());
                
				
                this.$el.find("#sidebar").append(this.sidebar.render().el);
                this.startWhiteboard();	
                return this;
            },
            
            onShow : function(){
            	for (var i = 0; i<this.subviews.length;i++){
            		if(this.subviews[i].onShow)
            			this.subviews[i].onShow();
            	}
            },
            
            startWhiteboard : function(){
            	whiteboard = new WhiteboardView(this.webRTCClient);
            	//this.$el.find("#sidebar").prepend(whiteboard.renderSidebarExtension());
            	this.$el.find("#main").append(whiteboard.render().el);
            	this.subviews.push(whiteboard);
            }
			
        });
		return RoomView;
});