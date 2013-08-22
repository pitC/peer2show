define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/rooms/roomsView',
         'backbones/views/room/roomView'
], function($, _, Backbone,RoomsView, RoomView){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
        },
        routes : {
            "Rooms" : "rooms",
            "Room/:roomId" : "room"
        },
        rooms : function(){
            var roomsView = new RoomsView();          
            this.el.empty();
            this.el.append(roomsView.render().el);
        },
        room : function(roomId){
            var roomView = new RoomView({
            	room:roomId
            });          
            this.el.empty();
            this.el.append(roomView.render().el);
            roomView.onShow();
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
