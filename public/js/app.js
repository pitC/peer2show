define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/indexView',
         'backbones/views/roomView',
         'backbones/views/homepageView',
         'app/settings',
         'app/globals',
         'app/logManager'

], function($, _, Backbone, IndexView, RoomView, HomepageView, Settings, Globals, LogManager){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
            this.indexView = options.indexView;
            
            console.log("App Router init! ");
            Globals.router = this;
            
        },
        routes : {
        	"":"homepage",
            "s/:roomId": "room",
            "home/":"loginHome"
//            ":roomId": "room"
        },
        
        loginHome : function(){
        	
        	console.log("Render login homepage...");
        	console.log(Settings);
        	this.loadHomepage(true);
        	this.indexView.renderHeader();
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
        },
        
        initRoom : function(options){
        	// init room view
        	console.log("init room "+options.user+" "+options.roomId+" is owner?"+options.owner);
        	var element = this.el||this.$el; 
        	$(element).empty();
            var roomView = new RoomView(options);
            $(element).html(roomView.render().el);
            $(".landing-page-style").removeClass("landing-page-style").addClass("session-style");
            $(".session-end-style").removeClass("session-end-style").addClass("session-style");
            roomView.onShow();
           
        	
        }
    });
	
	var initialize = function(){
		// disable console logs
        LogManager.switchConsoleLogs(Settings.enableConsoleLog);
		var indexView = renderIndex();
		
		var router = new AppRouter({el : $('#content'),indexView:indexView});
	    Backbone.history.start({pushState:true});
//	    Backbone.history.start();
	};
	
	var renderIndex = function(){
		var indexView = new IndexView({headerEl:$('#header'),footerEl:$('#footer')});
		indexView.render();
		indexView.onShow();
		return indexView;
	};
	
	
	return {
		initialize : initialize
	};
});
