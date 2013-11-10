define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel',
        'app/imageProcessor',
        'app/appStatus'
],function ($, _, Backbone,SlideCollection,SlideModel,ImageProcessor, AppStatus) {

	App = Backbone.Model.extend({
		
		
		
		initialize:function (options) {	
			
			this.webrtc = options.webRTC;
			this.slideCollection = new SlideCollection();
			this.imageProcessor = new ImageProcessor();
			
			// for debugging purposes
			this.RESIZE_IMG = true;
			this.SEND_IMG = true;
			
			this.currentStatus = AppStatus.READY;
			
			this.initEventCallbacks();
		},
		
		initEventCallbacks : function(){
			
			var self = this;
			
			// ON EVENT CALLBACKS
			this.webrtc.onFileSent = function (e){
				console.log("File sent");
			};
			
			this.webrtc.onFileReceived = function(fileName, data){
				console.log("Received! "+fileName);
				console.log(data);
				self.addNewSlide(data.dataURL);
			};
			
			this.webrtc.onFileProgress = function(packets,uuid){
				// TODO: present progress in GUI
//				console.log(packets,uuid);
				var slide = self.slideCollection.get(uuid);
				if (slide){
					var progress = parseInt((1-packets.remaining/packets.length)*100);
					slide.set("upload",progress);
//					console.log(packets,uuid);
				};
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
			this.webrtc.onmessage = function(e){
				var finalMsg = JSON.parse(e.data);
				if (finalMsg.remoteCall){
					console.log("Slideshow remote call: "+finalMsg.remoteCall);
//					var func = self[finalMsg.remoteCall];
					var options = new Object();
					if (finalMsg.options){
						options = finalMsg.options;
					}
					options.remote = true;
					self[finalMsg.remoteCall](options);
				};
			};
		},
		
		rpcNext : function (){
			var obj = new Object();
			obj.remoteCall = "nextSlide";
			var json = JSON.stringify(obj);
			this.webrtc.send(json);
		},
		
		rpcPrev:function() {
			var obj = new Object();
			obj.remoteCall = "prevSlide";
			var json = JSON.stringify(obj);
			this.webrtc.send(json);
		},
		
		rpcJumpToURL:function (url){
			var obj = new Object();
			obj.remoteCall = "jumpToByURL";
			var options = new Object();
			options.dataURL = url;
			obj.options = options;
			var json = JSON.stringify(obj);
			this.webrtc.send(json);
		},
		
		rpcJumpToIndex : function(index){
			var obj = new Object();
			obj.remoteCall = "jumpToByIndex";
			var options = new Object();
			options.index = index;
			obj.options = options;
			var json = JSON.stringify(obj);
			this.webrtc.send(json);
		},
		
		
		// PRIVATE METHODS
		
		previewfile : function(file) {
			
		    var reader = new FileReader();
		    var self = this;
		    reader.onload = function (event){
		    	var destUrl;
		    	var destFile;
		    	if (self.RESIZE_IMG){
		    		
		    		destUrl = self.imageProcessor.preprocessImage(event.target.result);
		    		destFile = self.imageProcessor.dataURLtoFile(destUrl);
		    	}
		    	// or don not use resize:
		    	else{
		    		destUrl = event.target.result;
		    		destFile = file;
		    	}
		    	console.log(event.target);
		    	console.log(file);
		    	var fileId = self.addNewSlide(destUrl);
		    	if (self.SEND_IMG){
		    		console.log("Send file "+fileId);
			    	self.webrtc.send(destFile, fileId);
			    }
		    };
//		    console.log(file); // file.type - image/jpeg, image/png etc. file.size - size in Bytes
		    reader.readAsDataURL(file);

		    
		},

		readfiles : function (files) {
		   
		    for (var i = 0; i < files.length; i++) {
		      var file = files[i];
		      if (this.imageProcessor.isImage(file)){
		    	  this.previewfile(file);
		      }
		    }
		},
		
		addNewSlide : function (url,_fileId){
			var fileId = _fileId || this.generateFileId();
			var slide = new SlideModel({dataURL:url,id:fileId,upload:0});
		    this.slideCollection.add(slide);
		    return fileId;
		},
		
		generateFileId : function () {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	    },
	});
		
	return App;
});




