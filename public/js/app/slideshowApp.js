define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel',
        'app/imageProcessor'
],function ($, _, Backbone,SlideCollection,SlideModel,ImageProcessor) {

	var app = function(webRTCClient){
		
		this.webrtc = webRTCClient;
		this.slideCollection = new SlideCollection();
		this.imageProcessor = new ImageProcessor();
		var self = this;
		// for debugging purposes
		this.RESIZE_IMG = true;
		this.SEND_IMG = true;
		
		// ON EVENT CALLBACKS
		this.webrtc.onFileSent = function (e){
			console.log("File sent");
		};
		
		this.webrtc.onFileReceived = function(fileName, data){
			console.log("Received! "+fileName);
			console.log(data);
			addNewSlide(data.dataURL);
		};
		
		this.webrtc.onFileProgress = function(packets,uuid){
			// TODO: present progress in GUI
			console.log(packets,uuid);
			var slide = self.slideCollection.get(uuid);
			if (slide){
				var progress = parseInt((1-packets.remaining/packets.length)*100);
				slide.set("upload",progress);
				console.log(packets,uuid);
			}
		};
		
		
		
		this.addDropArea = function(dropAreaId){
			var dropArea = document.getElementById(dropAreaId);
			
			if (dropArea != null){
				dropArea.ondragover = function () {  return false; };
				dropArea.ondragend = function () {  return false; };
				dropArea.ondrop = function(event){
					event.preventDefault();
					setTimeout(readfiles(event.dataTransfer.files),0);
					console.log("dropped");
				};
			}
		};
		
		// PUBLIC NAVIGATION METHODS
		this.nextSlide = function(options){
			self.slideCollection.next();
			if (!options || !options.remote)
				rpcNext();
		};
		
		this.prevSlide = function(options){
			self.slideCollection.prev();
			if (!options || !options.remote)
				rpcPrev();
		};
		
		this.jumpToByURL = function (options){
			self.slideCollection.jumpToByURL(options.dataURL);
			if (!options || !options.remote){
				rpcJumpToURL(options.dataURL);
			}
		};
		
		this.getIndexFromURL = function(url){
			var index = -1;
			var slide = self.slideCollection.findWhere({dataURL:url});
			if (slide != null){
				index = self.slideCollection.indexOf(slide);
			}
			return index;
		};
		
		this.jumpToByIndex = function (options){
			self.slideCollection.jumpTo(options.index);
			console.log("Jump to by index "+options.index);
			if (!options || !options.remote){
				rpcJumpToIndex(options.index);
			}
		};
		
		// REMOTE CALLS
		this.bindCommunicationEvents = function(){
			this.webrtc.onmessage = function(e){
				var finalMsg = JSON.parse(e.data);
				if (finalMsg.remoteCall){
					console.log("Slideshow remote call: "+finalMsg.remoteCall);
					var func = self[finalMsg.remoteCall];
					var options = new Object();
					if (finalMsg.options){
						options = finalMsg.options;
					}
					options.remote = true;
					func(options);
				}
			};
		};
		
		function rpcNext(){
			var obj = new Object();
			obj.remoteCall = "nextSlide";
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		};
		
		function rpcPrev(){
			var obj = new Object();
			obj.remoteCall = "prevSlide";
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		};
		
		function rpcJumpToURL(url){
			var obj = new Object();
			obj.remoteCall = "jumpToByURL";
			var options = new Object();
			options.dataURL = url;
			obj.options = options;
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		};
		
		function rpcJumpToIndex(index){
			var obj = new Object();
			obj.remoteCall = "jumpToByIndex";
			var options = new Object();
			options.index = index;
			obj.options = options;
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		}
		
		
		// PRIVATE METHODS
		
		function previewfile(file) {
			
		    var reader = new FileReader();
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
		    	var fileId = addNewSlide(destUrl);
		    	if (self.SEND_IMG){
		    		console.log("Send file "+fileId);
			    	self.webrtc.send(destFile, fileId);
			    }
		    };
//		    console.log(file); // file.type - image/jpeg, image/png etc. file.size - size in Bytes
		    reader.readAsDataURL(file);

		    
		}

		function readfiles(files) {
		   
		    for (var i = 0; i < files.length; i++) {
		      var file = files[i];
		      if (self.imageProcessor.isImage(file)){
		    	  previewfile(file);
		      }
		    }
		}
		
		function addNewSlide(url,_fileId){
			var fileId = _fileId || generateFileId();
			var slide = new SlideModel({dataURL:url,id:fileId,upload:0});
		    self.slideCollection.add(slide);
		    return fileId;
		};
		
		function generateFileId() {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	    };
		
		
	};
		
	return app;
});




