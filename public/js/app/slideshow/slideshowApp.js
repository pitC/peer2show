define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel'
],function ($, _, Backbone,SlideCollection,SlideModel) {
 

	var app = function(webRTCClient){
		
		this.webrtc = webRTCClient;
		this.slideCollection = new SlideCollection();
		var self = this;	
		this.RESIZE_IMG = true;
		
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
		};
		
		
		
		this.addDropArea = function(dropAreaId){
			var dropArea = document.getElementById(dropAreaId);
			
			if (dropArea != null){
				dropArea.ondragover = function () {  return false; };
				dropArea.ondragend = function () {  return false; };
				dropArea.ondrop = function(event){
					event.preventDefault();
					setTimeout(readfiles(event.dataTransfer.files),0);
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
		      addNewSlide(event.target.result);
		    };

		    reader.readAsDataURL(file);
		    // execute async
		    self.webrtc.send(file);
		}

		function readfiles(files) {
		   
		    for (var i = 0; i < files.length; i++) {
		      
		      previewfile(files[i]);
		    }
		}
		
		//TODO: resizing. Currently not working
		function resizeImage(srcUrl){
			var image = document.createElement('img');
	        image.src = srcUrl;
			
			var MAX_WIDTH = 400;
			var MAX_HEIGHT = 300;
			var width = image.width;
			var height = image.height;
			 
			if (width > height) {
			  if (width > MAX_WIDTH) {
			    height *= MAX_WIDTH / width;
			    width = MAX_WIDTH;
			  }
			} else {
			  if (height > MAX_HEIGHT) {
			    width *= MAX_HEIGHT / height;
			    height = MAX_HEIGHT;
			  }
			}
			
		
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
	        var ctx = canvas.getContext('2d');
	        ctx.drawImage(image, 0, 0, width, height);
	        var destUrl = canvas.toDataUrl('image/jpeg');
	        return destUrl;
		}
		
		function addNewSlide(url){
			var slide = new SlideModel({dataURL:url});
		    self.slideCollection.add(slide);
		};
		
		
	};
		
	return app;
});




