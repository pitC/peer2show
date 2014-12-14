define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/indexView',
         'backbones/views/roomView',
         'backbones/views/homepageView',
         'backbones/views/homeUserView',
         'backbones/views/passwordResetView',
         'app/settings',
         'app/globals',
         'app/logManager'

], function($, _, Backbone, IndexView, RoomView, HomepageView, HomeUserView, PasswordResetView, Settings, Globals, LogManager){ 
	
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
            "home(/)":"userHome",
            "r/:token":"resetPassword"
//            ":roomId": "room"
        },
        
        resetPassword : function(token){
        	var options = {token:token}; 
            var passwordResetView = new PasswordResetView(options);
            this.el.empty();
            
            this.el.append(passwordResetView.render().el);
        	Globals.switchWindowStyle("session-end-style");
        	passwordResetView.onShow();
        },
        
        userHome : function(){
        	console.log("Render login homepage...");
        	var homeuserView = new HomeUserView();
            this.el.empty();
            this.el.append(homeuserView.render().el);
            Globals.switchWindowStyle("session-end-style");
            
            homeuserView.onShow();
        },
        
        homepage: function(){
        	console.log("Render homepage...");
        	this.loadHomepage(false);
        },
        
        room : function(inpRoomId){
        	
        	
           	console.log("Inp room ID "+inpRoomId+" "+Settings.roomName);
           	
           	
           	Settings.roomName = inpRoomId||location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
           	Settings.imageSettings = Globals.user.get("sessionSettings").toJSON();
           	
           	// open new room as a host/guest
           	if (Settings.owner || Settings.userName){
           		var options = {roomId: Settings.roomName,
           				user:Settings.userName,
           				owner:Settings.owner
           				};
           		this.initRoom(options);
           	}
           	// load guest page 
           	else {
           		this.loadHomepage(true);
           		Globals.switchWindowStyle("session-end-style");
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
            Globals.switchWindowStyle("session-style");
            roomView.onShow();
        }
    });
	
	var initialize = function(){
		// disable console logs
        LogManager.switchConsoleLogs(Settings.enableConsoleLog);
        
        Globals.init();
        var indexView = renderIndex();
		var router = new AppRouter({el : $('#content'),indexView:indexView});
	    Backbone.history.start({pushState:true});
	    Globals.user.autoLogin();
	    
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
