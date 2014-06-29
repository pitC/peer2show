define([ 
        'jquery', 
        'underscore', 
        'backbone',
        'backbones/collections/slideCollection',
        'backbones/models/slideModel',
        'backbones/collections/messageCollection',
        'app/imageProcessor',
        'app/appStatus',
        'app/settings',
        'app/logManager',
        'zoomer',
        'hammer'
],function ($, _, Backbone,SlideCollection, SlideModel,MessageCollection,ImageProcessor, AppStatus, Settings,Logger, SmartZoom, Hammer) {

	App = Backbone.Model.extend({
		
		
		
		initialize:function (options) {	
			
			this.webrtc = options.webRTC;
			this.slideCollection = new SlideCollection();
			this.messageCollection = new MessageCollection();
			this.imageProcessor = new ImageProcessor();
			console.log("Settings after init: "+Settings.maxHeight);
			// for debugging purposes
			
			this.RESIZE_IMG = true;
			this.SEND_IMG = true;
			
			this.status = AppStatus.READY;
			
			this.initEventCallbacks();
			
			this.queueLength = 0;
			this.zoomableArea = null;
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
		
		// CHAT
		sendMessage : function(message, destPeer){
			this.webrtc.sendMessage(message,{},destPeer);
			this.messageCollection.add({sender:'me',message:message});
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
	
		addDropArea : function(dropAreaId){
			var dropArea = document.getElementById(dropAreaId);
			var self = this;
			if (dropArea != null){
				dropArea.ondragover = function () {  return false; };
				dropArea.ondragend = function () {  return false; };
				dropArea.ondrop = function(event){
					event.preventDefault();
					// read files
					if(event.dataTransfer.files.length > 0){;
					
						setTimeout(self.readfiles(event.dataTransfer.files),0);
					}
					// try to read url
					else if (event.dataTransfer.items){
						event.dataTransfer.items[0].getAsString(function(url){
							if(url!=null){
								self.readurl(url);
							}
						});	
					}
					console.log("dropped");
				};
			};
		},
		
		addClickArea : function(clickAreaId){
			var clickArea = document.getElementById(clickAreaId);
			$(clickArea).attr("onclick","$('#file-input').click();");
			$(clickArea).addClass("click-area");
		},
		
		setZoomableArea : function(zoomableAreaId){
			var elemRect = $(zoomableAreaId);
			var self = this;
			if (elemRect.length > 0){
				$(elemRect).smartZoom();
				$(elemRect).off('SmartZoom_ZOOM_END SmartZoom_PAN_END').on('SmartZoom_ZOOM_END SmartZoom_PAN_END',function(event){
					self.rpcTransformImage(null,self.getTransform(elemRect));
				});
			}
			this.zoomableArea = elemRect;
		},
		
		getTransform : function(object){
			// TODO: use other transform value
			var webkitTransform = object.css('-webkit-transform');
			var transform = object.css('transform');
			var finalTransform = webkitTransform || transform;
			return finalTransform;
		},
		
		isImageZoomed : function(){
			var transformString = this.getTransform(this.zoomableArea);
			// assumes the transform string has following format : (scaleX,0,0,scaleY,panX,panY)
			
			var values = transformString.split('(')[1];
		    values = values.split(')')[0];
		    values = values.split(',');
		    console.log(values);
		    var scaleX = values[0];
		    var scaleY = values[3];
		    if (scaleX == 1 && scaleY == 1){
		    	return false;
		    }
		    else{
		    	return true;
		    }
		},
		
		setSwipeArea : function(swipeAreaId){
			var elemRect =  document.getElementById(swipeAreaId);
			var self = this;
			if (elemRect != null){
				var hammertime = Hammer(elemRect).on('swipe, dragend', function(event){
					console.log("Hammer swipe!");
					console.log(event);
					if (!self.isImageZoomed()){						
						if (event.gesture.direction == 'left'){
							self.nextSlide();
						}
						else if (event.gesture.direction == 'right'){
							self.prevSlide();
						}
					}
				});
				console.log("Swipe area set!");
			}
			this.zoomableArea = elemRect;
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
		
		removeImage : function(options){
			console.log("remove image at "+options.index);
			var slide = this.slideCollection.at(options.index);
			console.log(slide);
			this.slideCollection.remove(slide);
			if (!options || !options.remote){
				this.rpcRemoveImage(options.index);
			}
		},
		
		transformImage : function(options){

			this.zoomableArea.css('-webkit-transform',options.transform);
			this.zoomableArea.css('transform',options.transform);
			
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
		
		rpcRemoveImage : function(index){
			var remoteCall = "removeImage";
			var options = new Object();
			options.index = index;
			this.webrtc.rpc(remoteCall,options);
		},
		
		rpcTransformImage : function(index, transform){
			var remoteCall = "transformImage";
			var options = new Object();
			options.index = index;
			options.transform = transform;
			this.webrtc.rpc(remoteCall,options);
		},
		
		retransmitFiles : function(destPeer){
			if(destPeer){
				var self = this;
				console.log("Retransmit files!");
				 this.slideCollection.each(function(slide){
					 var index = self.slideCollection.indexOf(slide);
					 var src = slide.get("src");
					 var metadata = {
							 index:index,
							 src:src
					 };
					 console.log(slide);
					 var dataUrl = slide.get("dataURL");
					 var file = null;
					 if (src === 'local'){
						 file = self.imageProcessor.dataURLtoFile(dataUrl);
					 }
					 else if (src === 'web'){
						 file = dataUrl;
					 }
					 self.webrtc.sendFile(file,metadata,destPeer);
					 
				 }, this);
			}
		},
		
		
		// PRIVATE METHODS
		
		readImage : function(file) {
						
		    var reader = new FileReader();
		    var self = this;
		    reader.onload = function (event){
		    	var destUrl;
		    	var destFile;
		    	if (Settings.imageSettings.processImage){
		    			var options = Settings.imageSettings;
		    			var url = event.target.result;
		    			destUrl = self.imageProcessor.processImage(url, options, function(destUrl){
		    			var destFile = self.imageProcessor.dataURLtoFile(destUrl);
		    			var metadata = {
			    				src:'local'
			    		};
		    			var index = self.addNewSlide(destUrl,null,metadata);
		    			metadata.index = index;
				    	if (self.SEND_IMG){
				    		
					    	self.webrtc.sendFile(destFile,metadata);
					    }
				    	
		    		});
		    		
		    	}
		    	// or don not use resize:
		    	else{
		    		destUrl = event.target.result;
		    		destFile = file;
		    		var metadata = {
		    				src:'local'
		    		};
		    		var index = self.addNewSlide(destUrl,null,metadata);
	    			metadata.index = index;
			    	if (self.SEND_IMG){
				    	self.webrtc.send(destFile,metadata);
				    }
		    	}
		    	
		    };
		    reader.readAsDataURL(file);
			
		    
		},
		
		readurl : function(url){
			console.log("Read url "+url);
			var self = this;
			// first check if under url a valid image is available
			$("<img>", {
			        src: url,
			        error: function() { alert('Not a valid image! url: '+url); },
			        load: function() { 
			        	// on success, add the slide and send to peers
			        	var metadata = {
			    				src: 'web'
			    		};
			        	var index = self.addNewSlide(url,null,metadata);
			        	metadata.index = index;
				    	if (self.SEND_IMG){
				    		
					    	self.webrtc.sendFile(url,metadata);
					    }
			        }
			 });
			
	    	
		},

		readfiles : function (files) {
			
			this.queueLength = files.length;
			
			var noImages = true;
			
			if (this.queueLength > 0){
				this.setStatus(AppStatus.LOADING_PHOTO);
			}
			var self = this;
			var worker = new	Worker('/js/app/imageReader.js');
			 worker.onmessage = function(e) {
   			  self.onWorkerRead(e);
   		  	};
   		  	
			Array.prototype.forEach.call(files, function(file){
				
			      console.log("Read file!");
			      console.log(file);
			      
			      if (self.imageProcessor.isImage(file)){
			    	  noImages = false;
			    	  if (Settings.useWebWorker){
			    		  console.log("Start worker!");  
			    		  worker.postMessage(file);
			    	  }
			    	  else{
			    		  self.readImage(file);
			    	  }
			      }
			      else{
			    	  this.queueLength -= 1;
			      }
			});
			
		    if (noImages){
		    	this.setStatus(AppStatus.READY);
		    }
		},
		
		onWorkerRead : function(e){
			console.log("Message from worker!");
			  console.log(e);
			  var url = e.data.url;
			  var file = e.data.file;
			  var metadata = {
	    				src:'local'
			  };
			  var index = this.addNewSlide(url,null,metadata);
			  metadata.index = index;
			  if (this.SEND_IMG){
		    		
				  this.webrtc.sendFile(file,metadata);
			  }
		},
		
		addNewSlide : function (url,index, metadata){
			fileId = this.generateFileId();
			var modelData =  metadata||{};
			modelData.dataURL = url;
			modelData.id = fileId;
			modelData.upload = 0;
			var slide = new SlideModel(modelData);
			var assignedIndex = -1;
			
			console.log("Add slide url "+url);
			
			if (index)
				this.slideCollection.add(slide,{at:index});
			else{
				this.slideCollection.add(slide);
			}
			assignedIndex = this.slideCollection.indexOf(slide);
		
			console.log("Assigned index is "+assignedIndex);
			this.queueLength -= 1;
			if (this.queueLength <= 0){
				this.setStatus(AppStatus.READY);
			}
		    return assignedIndex;
		},
		
		generateFileId : function () {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
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




