define([],function () {

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
 
		
		this.preprocessImage = function(srcUrl, callback){
			var options = {};
			var format = self.getFormat(srcUrl);
			console.log("Format: "+format);
			options.format = self.getOutputFormat(format);
			self.resizeImage(srcUrl, options,callback);
		};
		
		this.isImage = function(file){
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
			var MAX_WIDTH = options.maxWidth || 800;
			var MAX_HEIGHT = options.maxHeight || 500;
			var JPEG_QUALITY = options.quality || 0.9;
			var DEST_FORMAT = options.format || "image/jpeg";
			
			image.onload = function(evt){
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
			};
			
	        image.src = srcUrl;

		};
		
		this.generateFileId = function() {
	        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	    };
		
		
	};
		
	return imageProcessor;
});




