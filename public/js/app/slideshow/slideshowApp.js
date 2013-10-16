define(
		
function () {
 

	var app = function(webRTCClient){
		
		this.webrtc = webRTCClient;
		var self = this;
		this.dropArea = null;
		this.previewArea = null;
		
		this.webrtc.onFileSent = function (e){
			console.log("File sent");
		};
		
		this.webrtc.onFileReceived = function(fileName, data){
			console.log("Received! "+fileName);
			console.log(data);
			var image = new Image();
		      image.src = data.dataURL;
		      image.width = 250; // a fake resize
		      self.previewArea.appendChild(image);
		};
		
		this.webrtc.onFileProgress = function(packets,uuid){
			console.log(packets,uuid);
		};
		
		this.bindCommunicationEvents = function(){
			this.webrtc.onmessage = function(e){
				
				
				
			};
		};
		
		this.initDropArea = function(dropAreaId){
			this.dropArea = document.getElementById(dropAreaId);
			
			
			this.dropArea.ondragover = function () {  return false; };
			this.dropArea.ondragend = function () {  return false; };
			this.dropArea.ondrop = function(event){
				event.preventDefault();
				readfiles(event.dataTransfer.files);
				alert("Droped!");
			};
		};
		
		this.initPreviewArea = function(previewAreaId){
			this.previewArea = document.getElementById(previewAreaId);
		};
		
		function previewfile(file) {
			  
		    var reader = new FileReader();
		    reader.onload = function (event) {
		      var image = new Image();
		      image.src = event.target.result;
		      image.width = 250; // a fake resize
		      self.previewArea.appendChild(image);
		      
		    };

		    reader.readAsDataURL(file);
		    self.webrtc.send(file);
		}

		function readfiles(files) {
		   
		    for (var i = 0; i < files.length; i++) {
		      
		      previewfile(files[i]);
		    }
		}
		
		
		
		
	};
		
	return app;
});




