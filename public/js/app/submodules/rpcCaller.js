define([
       
        ],function () {

	var submodule = function(){
		this.init = function(app){
			// PUBLIC NAVIGATION METHODS
			
			
			app.rpcNext = function (){
				app.webrtc.rpc("nextSlide");
			};
			
			app.rpcPrev = function() {
				app.webrtc.rpc("prevSlide");
			};
			
			app.rpcJumpToURL = function (url){
				var remoteCall = "jumpToByURL";
				var options = new Object();
				options.dataURL = url;
				app.webrtc.rpc(remoteCall,options);
			};
			
			app.rpcJumpToIndex = function(index){
				var remoteCall = "jumpToByIndex";
				var options = new Object();
				options.index = index;
				app.webrtc.rpc(remoteCall,options);
			};
			
			app.rpcRemoveImage = function(index){
				var remoteCall = "removeImage";
				var options = new Object();
				options.index = index;
				app.webrtc.rpc(remoteCall,options);
			};
			
			app.rpcTransformImage = function(index, transform, dims){
				var remoteCall = "transformImage";
				var options = new Object();
				options.index = index;
				options.transform = transform;
				options.dims = dims;
				console.log(transform);
				console.log(dims);
				app.webrtc.rpc(remoteCall,options);
			};
			
			app.retransmitFiles = function(destPeer){
				if(destPeer){
					var self = app;
					console.log("Retransmit files!");
					
					app.slideCollection.each(function(slide){
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
							 console.log("To file: "+dataUrl);
							 try{ 
								 file = self.imageProcessor.dataURLtoFile(dataUrl);
							 }
							 catch(err){
								 null;
							 }
						 }
						 // send web links only if owner (to avoid duplicates)
						 else if (src === 'web' && self.webrtc.isOwner()){
							 file = dataUrl;
						 }
						 if (file != null){
							 self.webrtc.sendFile(file,metadata,destPeer);
						 }
					 }, app);
					
					app.rpcJumpToIndex(app.slideCollection.currentSlideIndex);
					
				}
			};
			
			// CHAT
			app.sendMessage = function(message, destPeer){
				app.webrtc.sendMessage(message,{},destPeer);
				app.messageCollection.add({sender:'me',message:message});
			};
		};
	};
		
	return submodule;
});




