define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/appStatus'
], function($, _, Backbone,AppStatus){
	LoaderLogModel = Backbone.Model.extend({
		// error types in the sequence of possible:
		// 1. on file array iteration
		UNSUPPORTED_FILETYPE : "unsupportedFile",
		// 2. on FileReader.onload
		FILE_LOADING_ERROR :"fileLoadingError",
		// 3. on image.onload
		IMAGE_LOADING_ERROR : "imageLoadingError",
		// else??
		UNKNOWN_ERROR :"unknownError",
		
		URL_INVALID : "invalidUrlError",
		
		
		initialize:function (options) {	
			this.setStatusCallback = options.callback;
			this.loaded = 0;
			this.queueLength = 0;
			this.errorLog = [];
		},
		
		reset:function(queueLength){
			this.loaded = 0;
			this.queueLength = queueLength || 0;
			console.log("[LOADER LOG] reset:"+queueLength);
//			this.trigger("change");
			this.errorLog = [];
		},
		
		isLoaded : function(){
			console.log("[LOADER LOG] is loaded?:"+this.loaded+"/"+this.queueLength);
			// in case of web no queue is needed, therefore equal OR greater then
			if (this.loaded >= this.queueLength){
//				this.setStatusCallback(AppStatus.READY);
				console.log("[LOADER LOG] finished with following errors:");
				console.log(this.errorLog);
				this.trigger("finished",this.errorLog);
				return true;
			}
			else{
				return false;
			}
		},
		
		addSuccess:function(){
			this.loaded = this.loaded + 1;
			this.trigger("change",this.getProgress());
			return this.isLoaded();
		},
		
		addError:function(errorMsgType,msg){
			var log = {msgType:errorMsgType,msg:msg};
			
			this.errorLog.push(log);
			this.loaded = this.loaded + 1;
			this.trigger("change",this.getProgress());
			return this.isLoaded();
		},
		
		updateTrigger : function(){
			this.trigger("change",this.getProgress());
		},
		
		getProgress:function(){
			return this.loaded+"/"+this.queueLength;
		}
	});
	
	
	
	return LoaderLogModel;
});