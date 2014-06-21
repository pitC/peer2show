self.addEventListener('message', function(e) { 
	    var file=e.data; 
 
	        var reader = new FileReaderSync();
	        var url = reader.readAsDataURL(file);
	        
//	        if (false){
//    			var options = Settings.imageSettings;
//    			
//    			destUrl = imageProcessor.processImage(url, options, function(destUrl){
//    					destFile = imageProcessor.dataURLtoFile(destUrl);
//    					var msg = {url : destUrl, file: destFile};
//    					postMessage(msg);
//    			});
//    		
//	        }
	// or don not use resize:
//	        else{
    		destUrl = url;
    		destFile = file;
    		var msg = {url : destUrl, file: destFile};
			postMessage(msg);
//	        }
});
