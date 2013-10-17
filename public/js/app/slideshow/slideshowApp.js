define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel'
],function ($, _, Backbone,SlideCollection,SlideModel) {
 

	var app = function(webRTCClient, slideCollection){
		
		this.webrtc = webRTCClient;
		this.slideCollection = slideCollection;
		var self = this;	
		
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
			console.log(packets,uuid);
		};
		
		
		
		this.addDropArea = function(dropAreaId){
			var dropArea = document.getElementById(dropAreaId);
			
			if (dropArea != null){
				dropArea.ondragover = function () {  return false; };
				dropArea.ondragend = function () {  return false; };
				dropArea.ondrop = function(event){
					event.preventDefault();
					readfiles(event.dataTransfer.files);
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
				rpcJumpTo(options.dataURL);
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
		
		function rpcJumpTo(url){
			var obj = new Object();
			obj.remoteCall = "jumpToByURL";
			var options = new Object();
			options.dataURL = url;
			obj.options = options;
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		};
		
		
		// PRIVATE METHODS
		
		function previewfile(file) {
			  
		    var reader = new FileReader();
		    reader.onload = function (event) {
		      addNewSlide(event.target.result);
		    };

		    reader.readAsDataURL(file);
		    // execute async
		    setTimeout(self.webrtc.send(file),0);
		}

		function readfiles(files) {
		   
		    for (var i = 0; i < files.length; i++) {
		      
		      previewfile(files[i]);
		    }
		}
		
		function addNewSlide(url){
			var slide = new SlideModel({dataURL:url});
		    self.slideCollection.add(slide);
		};
		
		
	};
		
	return app;
});




