define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel',
        'backbones/collections/messageCollection',
        'app/appStatus',
        'app/settings',
        'app/logManager',
        'app/submodules/uiActivator',
        'app/submodules/fileLoader',
        'app/submodules/navigator',
        'app/submodules/rpcCaller'
],function ($, _, Backbone,SlideCollection, SlideModel,MessageCollection,AppStatus, Settings,Logger, UIActivator, FileLoader,Navigator,RPCCaller) {

	App = Backbone.Model.extend({
		
		
		
		initialize:function (options) {	
			
			this.webrtc = options.webRTC;
			this.slideCollection = new SlideCollection();
			this.messageCollection = new MessageCollection();
			
			this.status = AppStatus.READY;
			
			this.initEventCallbacks();			
			
			this.initSubmodules();
		},
		
		initSubmodules : function(){
			this.submodules = [new UIActivator(),new FileLoader(), new Navigator(), new RPCCaller()];
			var len = this.submodules.length;
			for (var i=0; i<len; ++i) {
			    var submodule = this.submodules[i];
			    submodule.init(this);
			};
		},

	    setStatus : function(status){
	    	if (AppStatus.isValid(status)){
	    		if (this.status != status){
	    			console.log("Switch status from "+this.status+" to "+status);
	    			this.status = status;
	    			this.trigger('change_status');	
	    		}
	    	}
	    	else{
	    		console.log("Wrong status "+status);
	    	}
	    },
		
		initEventCallbacks : function(){
			
			var self = this;
			
			this.webrtc.onfile = function(url,metadata){
				
				console.log("On file receive");
				console.log(metadata);
				var index = metadata.index || null;
				self.addNewSlide(url,index, metadata);
			};
			
			this.webrtc.onmessage = function(message, metadata){
				var sender = metadata.sender ||"?";
				self.messageCollection.add({sender:sender,message:message});
			};
		
		},
		
		// REMOTE CALLS
		bindCommunicationEvents : function(){
			var self = this;
			this.webrtc.onrpc = function(remoteCall, parameters){		
				self[remoteCall](parameters);
			};
			
			this.webrtc.onOwnerClose = function(event){
				var event = {message:"Host closed the session"};
				Logger.logEvent(event,Logger.DEBUG);
				self.setStatus(AppStatus.SESSION_ENDED);
			};
			
			
		},
	
		
			
	    close : function(){
	    	var self = this;
	    	this.webrtc.close(function(ev){
	    		self.setStatus(AppStatus.SESSION_ENDED);
	    	});
	    	
	    }
		
	});
		
	return App;
});




