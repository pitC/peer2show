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
            }
        });

		RoomView = Backbone.View.extend({
			
			
			
			initialize : function(options){
				this.template = _.template(roomTmpl);
				this.subviews = [];
				this.roomName = options.room || DEFAULT_ROOM_NAME;
				this.webRTCClient = WebRTCClient;
				var self = this;
				this.webRTCClient.testSessionPresence(self.roomName,function(isPresent){
					if (isPresent){
						console.log("Room exists, let's join!");
						
						self.webRTCClient.onNewSession = function(session) {
							self.webRTCClient.join(session);
						};
						self.webRTCClient.connect(self.roomName);
					}
					else{
						console.log("Create new room");
						self.webRTCClient.setupNewSession({sessionName:self.roomName});
					}
				});
				
			},
 
            render : function(){
            	this.$el.html(this.template());
                var sidebar = new SidebarView();
				
                this.$el.find("#sidebar").append(sidebar.render().el);
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
            	var whiteboard = new WhiteboardView();
            	this.$el.find("#sidebar").prepend(whiteboard.renderSidebarExtension());
            	this.$el.find("#main").append(whiteboard.render().el);
            	this.subviews.push(whiteboard);
            }
			
        });
		return RoomView;
});