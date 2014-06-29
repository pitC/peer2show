define([
        'app/imageProcessor',
        'app/appStatus',
        'app/settings'
        ],function (ImageProcessor, AppStatus, Settings) {

	var submodule = function(){
		this.init = function(app){
			app.imageProcessor = new ImageProcessor();
			app.queueLength = 0;
			
			app.readImage = function(file) {
				
			    var reader = new FileReader();
			    var self = app;
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
					    		
						    self.webrtc.sendFile(destFile,metadata);
						    
					    	
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
				    	
					    self.webrtc.send(destFile,metadata);
					    
			    	}
			    	
			    };
			    reader.readAsDataURL(file);
				
			    
			};
			
			app.readurl = function(url){
				console.log("Read url "+url);
				var self = app;
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
					    	
						    self.webrtc.sendFile(url,metadata);
						    
				        }
				 });
				
		    	
			};

			app.readfiles = function (files) {
				
				app.queueLength = files.length;
				
				var noImages = true;
				
				if (app.queueLength > 0){
					app.setStatus(AppStatus.LOADING_PHOTO);
				}
				var self = app;
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
				    	  app.queueLength -= 1;
				      }
				});
				
			    if (noImages){
			    	app.setStatus(AppStatus.READY);
			    }
			};
			
			app.onWorkerRead = function(e){
				console.log("Message from worker!");
				  console.log(e);
				  var url = e.data.url;
				  var file = e.data.file;
				  var metadata = {
		    				src:'local'
				  };
				  var index = app.addNewSlide(url,null,metadata);
				  metadata.index = index;
				 	
				  app.webrtc.sendFile(file,metadata);
				  
			};
			
			app.addNewSlide = function (url,index, metadata){
				fileId = app.generateFileId();
				var modelData =  metadata||{};
				modelData.dataURL = url;
				modelData.id = fileId;
				modelData.upload = 0;
				var slide = new SlideModel(modelData);
				var assignedIndex = -1;
				
				console.log("Add slide url "+url);
				
				if (index)
					app.slideCollection.add(slide,{at:index});
				else{
					app.slideCollection.add(slide);
				}
				assignedIndex = app.slideCollection.indexOf(slide);
			
				console.log("Assigned index is "+assignedIndex);
				app.queueLength -= 1;
				if (app.queueLength <= 0){
					app.setStatus(AppStatus.READY);
				}
			    return assignedIndex;
			};
			
			app.generateFileId = function () {
		        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
		    };
		};
	};
		
	return submodule;
});




