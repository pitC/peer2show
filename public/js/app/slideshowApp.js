define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel',
        'app/imageProcessor',
        'app/appStatus',
        'app/settings'
],function ($, _, Backbone,SlideCollection,SlideModel,ImageProcessor, AppStatus, Settings) {

	App = Backbone.Model.extend({
		
		
		
		initialize:function (options) {	
			
			this.webrtc = options.webRTC;
			this.slideCollection = new SlideCollection();
			this.imageProcessor = new ImageProcessor();
			console.log("Settings after init: "+Settings.maxHeight);
			// for debugging purposes
			
			this.RESIZE_IMG = true;
			this.SEND_IMG = true;
			
			this.status = AppStatus.READY;
			
			this.initEventCallbacks();
			
			this.queueLength = 0;
		
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
				self.addNewSlide(url,index);
//				self.addNewSlide(url);
			};
		
		},
	
		addDropArea : function(dropAreaId){
			var dropArea = document.getElementById(dropAreaId);
			var self = this;
			if (dropArea != null){
				dropArea.ondragover = function () {  return false; };
				dropArea.ondragend = function () {  return false; };
				dropArea.ondrop = function(event){
					event.preventDefault();
					setTimeout(self.readfiles(event.dataTransfer.files),0);
					console.log("dropped");
				};
			};
		},
		
		// PUBLIC NAVIGATION METHODS
		nextSlide : function(options){
			this.slideCollection.next();
			if (!options || !options.remote)
				this.rpcNext();
		},
		
		prevSlide : function(options){
			this.slideCollection.prev();
			if (!options || !options.remote)
				this.rpcPrev();
		},
		
		jumpToByURL : function (options){
			this.slideCollection.jumpToByURL(options.dataURL);
			if (!options || !options.remote){
				this.rpcJumpToURL(options.dataURL);
			}
		},
		
		getIndexFromURL : function(url){
			var index = -1;
			var slide = this.slideCollection.findWhere({dataURL:url});
			if (slide != null){
				index = this.slideCollection.indexOf(slide);
			}
			return index;
		},
		
		jumpToByIndex : function (options){
			this.slideCollection.jumpTo(options.index);
			console.log("Jump to by index "+options.index);
			if (!options || !options.remote){
				this.rpcJumpToIndex(options.index);
			}
		},
		
		// REMOTE CALLS
		bindCommunicationEvents : function(){
			var self = this;
			this.webrtc.onrpc = function(remoteCall, parameters){
				
				self[remoteCall](parameters);
			
			};
			
			
		},
		
		rpcNext : function (){
			this.webrtc.rpc("nextSlide");
		},
		
		rpcPrev:function() {
			this.webrtc.rpc("prevSlide");
		},
		
		rpcJumpToURL:function (url){
			var remoteCall = "jumpToByURL";
			var options = new Object();
			options.dataURL = url;
			this.webrtc.rpc(remoteCall,options);
		},
		
		rpcJumpToIndex : function(index){
			var remoteCall = "jumpToByIndex";
			var options = new Object();
			options.index = index;
			this.webrtc.rpc(remoteCall,options);
		},
		
		
		// PRIVATE METHODS
		
		previewfile : function(file) {
			//this.webrtc.send(file);
						
		    var reader = new FileReader();
		    var self = this;
		    reader.onload = function (event){
		    	var destUrl;
		    	var destFile;
		    	if (self.RESIZE_IMG){
		    		
		    			destUrl = self.imageProcessor.preprocessImage(event.target.result, function(destUrl){
		    			var destFile = self.imageProcessor.dataURLtoFile(destUrl);
		    			var index = self.addNewSlide(destUrl);
				    	if (self.SEND_IMG){
				    		var metadata = {
				    				
				    				index: index
				    		};
					    	self.webrtc.sendFile(destFile,metadata);
					    }
		    		});
		    		
		    	}
		    	// or don not use resize:
		    	else{
		    		destUrl = event.target.result;
		    		destFile = file;
			    	self.addNewSlide(destUrl);
			    	if (self.SEND_IMG){
				    	self.webrtc.send(destFile);
				    }
		    	}
		    	
		    };
		    reader.readAsDataURL(file);
			
		    
		},

		readfiles : function (files) {
//			this.setStatus(AppStatus.UPLOADING_PHOTOS);
			this.queueLength = files.length;
			
		    for (var i = 0; i < files.length; i++) {
		      var file = files[i];
		      console.log("Read file!");
		      console.log(file);
		      if (this.imageProcessor.isImage(file)){
		    	  this.previewfile(file);
		      }
		      else{
		    	  this.queueLength -= 1;
		      }
		    }
//		    this.setStatus(AppStatus.READY);
		},
		
		addNewSlide : function (url,index, fileId){
			var fileId = fileId || this.generateFileId();
			var slide = new SlideModel({dataURL:url,id:fileId,upload:0});
			var assignedIndex = -1;
			
			
			if (index)
				this.slideCollection.add(slide,{at:index});
			else{
				this.slideCollection.add(slide);
				
			}
			assignedIndex = this.slideCollection.indexOf(slide);
		
			console.log("Assigned index is "+assignedIndex);
		    return assignedIndex;
		},
		
		generateFileId : function () {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	    }
	    
	});
		
	return App;
});




