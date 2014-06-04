define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomView',
         'backbones/views/homepageView',
         'app/settings'

], function($, _, Backbone, RoomView, HomepageView, Settings){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
            
            console.log("App Router init!");
        },
        routes : {
        	"":"homepage",
            ":roomId": "room"
        },
        
        
        homepage: function(){
        	console.log("Render homepage...");
        	this.loadHomepage(false);
        }
        ,
        room : function(inpRoomId){
        	
        	
           	console.log("Inp room ID "+inpRoomId);
        	
           	// open new room as a host/guest
           	if (Settings.owner || Settings.userName){
           		var options = {roomId: location.href.replace( /\/|:|#|%|\.|\[|\]/g , ''),
           				user:Settings.userName,
           				owner:Settings.owner
           				};
           		this.initRoom(options);
           	}
           	// load guest page 
           	else {
           		this.loadHomepage(true);
           	}
           	
        	
        },
        
        loadHomepage : function(guest){
        	this.el.empty();
        	var options = {guest:guest, rootEl : this.el, callback:this.initRoom};
        	
        	var homepageView = new HomepageView(options);
            this.el.empty();
            this.el.append(homepageView.render().el);
            homepageView.onShow();
        	
            $('#feedback-modal').on('show.bs.modal', function (e) {
            	console.log("show modal!");
            	var iframe = $(".uvw-dialog-iframe");
            	console.log(iframe);
            	iframe.src = iframe.src;
            });
        },
        
        initRoom : function(options){
        	// init room view
        	console.log("init room "+options.user+" "+options.roomId+" is owner?"+options.owner);
        	var element = this.el||this.$el; 
        	$(element).empty();
            var roomView = new RoomView(options);
            $(element).html(roomView.render().el);
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
