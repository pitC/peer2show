define([
        'lib/resize',
        'lib/resizeWorker'
        ],function (Resize, ResizeWorker) {

	var imageProcessor = function(){
		
		var self = this;
	
		this.dataURLtoFile = function(dataURI){
			var binary = atob(dataURI.split(',')[1]);
		    var array = [];
		    for(var i = 0; i < binary.length; i++) {
		        array.push(binary.charCodeAt(i));
		    }
		    var options = {type: self.getFormat(dataURI)};
		    return new Blob([new Uint8Array(array)], options );
		};
 
		
		this.processImage = function(srcUrl, options, callback){
			options = options || {};
			var format = self.getFormat(srcUrl);
			console.log("Format: "+format);
			options.format = self.getOutputFormat(format);
			var settings = $.extend( {
				'useWebWroker':false,
				'maxWidth':800,
				'maxHeight':500,
				'quality' : 0.9,
				'format' : "image/jpeg"
			}, options);
			
			
			self.resizeImage(srcUrl, settings,callback);
			
		};
		
		this.isSupported = function(file){
			var isImage = false;
			if (file.type){
				if (file.type.indexOf("image") != -1){
					isImage = true;
				}
			}
			console.log("Is image? "+isImage);
			return isImage;
		};
		
		this.getFormat = function(url){
			
			// function assumes url has following format: data:image/png;base64,iVBORw0KG...
			// fetch format 
			console.log(url);
			var str = url.toString() || "";
			
			var patt = /image.*;/;
			var output = str.match(patt)[0]; // match returns array, first object is output
			var format = output.substr(0,output.length-1); //remove ; at the end
			return format;
		};
		
		this.getOutputFormat = function(inputFormat){
			var outputFormat = inputFormat;
			var FORMAT_MATRIX = {"image/jpeg":"image/jpeg","image/png":"image/png","image/gif":"image/png"};
			var DEFAULT_FORMAT = "image/jpeg";
			
			if (inputFormat){
				if (inputFormat in FORMAT_MATRIX){
					outputFormat = FORMAT_MATRIX[inputFormat];
				}
				else{
					outputFormat = DEFAULT_FORMAT;
				}	
				
			}
			return outputFormat;
		};
		
		this.resizeImage = function(srcUrl,options, callback){
//			var image = document.createElement('img');
			var image = new Image();
			var MAX_WIDTH = options.maxWidth;
			var MAX_HEIGHT = options.maxHeight;
			var JPEG_QUALITY = options.quality;
			var DEST_FORMAT = options.format;
			
			image.onload = function(evt){
				var srcWidth = image.width;
				var srcHeight = image.height;
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
				
				
				// context2d resize
				console.log("Create canvas");
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
		        var ctx = canvas.getContext('2d');
		        console.log("draw image");
		        ctx.drawImage(image, 0, 0, width, height);
		        console.log("get data url");
		        var destUrl = canvas.toDataURL(DEST_FORMAT,JPEG_QUALITY);
		        console.log("url: "+destUrl);
		        callback(destUrl);
				
				// Resize.js
				// false - do not use WebWorker
//				var resized = new Resize(srcWidth, srcHeight, width, height, true, true, false, function(buffer){
//					// TODO: callback
//				});
		        // start resize - pass data from context
//				var canvas = document.createElement('canvas');
//				canvas.width = srcWidth;
//				canvas.height = srcHeight;
//		        var ctx = canvas.getContext('2d');
//				ctx.drawImage(image, 0, 0, srcWidth, srcHeight);
//				var dataToScale = ctx.getImageData(0, 0, srcWidth, srcHeight).data;
//				resized.resize(dataToScale);
			};
			
			image.onerror = function(evt){
				console.log("loading error!");
				console.log(evt);
				callback(null);
			};
			
	        image.src = srcUrl;

		};
		
		this.generateFileId = function() {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	    };
		
		
	};
		
	return imageProcessor;
});




