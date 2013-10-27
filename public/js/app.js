define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomView',

], function($, _, Backbone, RoomView){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
        },
        routes : {
        	"New":"room",
        	"":"room",
            ":roomId": "room"
        },
        room : function(inpRoomId){
        	var roomId;
        	if (inpRoomId){
        		roomId = inpRoomId;
        	}
        	else{
        		roomId = this.generateRoomId();
        		window.location.hash = roomId;
        		
        	}
        	
        	console.log("Room id is "+roomId);
            var roomView = new RoomView({
            	room:roomId
            });
            this.el.empty();
            this.el.append(roomView.render().el);
            roomView.onShow();
        },
        generateRoomId : function(){
    		var rand = function() {
    		    return Math.random().toString(36).substr(2); // remove `0.`
    		};
    		return rand();
    	}
    });
	
	var initialize = function(){
		var router = new AppRouter({el : $('#content')});
	    Backbone.history.start();
	};
	
	return {
		initialize : initialize
	};
	
	

});
