define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomView',
         'backbones/views/usernameInputView'

], function($, _, Backbone, RoomView, UsernameInputView){ 
	
	var AppRouter = Backbone.Router.extend({
        initialize : function(options){
            this.el = options.el;
            this.username = null;
            this.owner = null;
        },
        routes : {
        	"New":"room",
        	"":"room",
            ":roomId": "room"
        },
        room : function(inpRoomId){
        	
        	
        	// init room id
        	
        	console.log("Inp room ID "+inpRoomId);
        	
        	if (inpRoomId){
        		if (this.owner == null){
        			this.owner = false;
        		}
        	}
        	else{
        		if(this.owner == null){
        			this.owner = true;
        		}
        		window.location.hash =  this.generateRoomId();
        	}
        	
        	// init user name
        	if (!this.username){
	        	this.el.empty();
	        	var options = {callback:this.initRoomCallback,owner:this.owner};
	        	var userInputView = new UsernameInputView(options);
	            this.el.empty();
	            this.el.append(userInputView.render().el);
        	}
        	// if already exists
        	else{
        		var options = {roomId: location.href.replace( /\/|:|#|%|\.|\[|\]/g , ''),user:this.username,owner:this.owner};
        		this.initRoomCallback(options);
        	}
        },
        
        initRoomCallback : function(options){
        	// init room view
        	console.log("init room "+options.user+" "+options.roomId+" is owner?"+options.owner);
            
        	this.$el.empty();
            var roomView = new RoomView(options);
            this.$el.html(roomView.render().el);
            roomView.onShow();

            this.username = options.user;
        },
        
       
        generateRoomId : function(){
        	var LENGTH = 5;
    		var rand = function() {
    		    return Math.random().toString(36).substr(2, LENGTH); // remove `0.`
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
