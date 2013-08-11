define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/rooms/roomsView'
], function($, _, Backbone,RoomsView){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
        },
        routes : {
            "Rooms" : "rooms",
        },
        rooms : function(){
            var roomsView = new RoomsView();          
            this.el.empty();
            this.el.append(roomsView.render().el);
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
