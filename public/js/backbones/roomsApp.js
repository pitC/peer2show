
window.App = {
	Models: {},
	Collections: {},
	Routers: {},
	Views: {},
	init: function(){
		tpl.loadTemplates(['new-room-form', 'room-thumb'], function () {
			App.router = new App.Routers.main();
			Backbone.history.start();
		});
		
	}	
};



(function($){
 
        var Rooms = {};
        
        Rooms.Router = Backbone.Router.extend({
            initialize : function(options){
                this.el = options.el;
            },
            routes : {
                "Rooms" : "rooms",
            },
            rooms : function(){
                var roomsView = new Rooms.RoomsView();          
                this.el.empty();
                this.el.append(roomsView.render().el);
            }
        });
 
})(jQuery);


