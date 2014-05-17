define([],function () {
	
	function Logger()  {
		
		this.ERROR = 'error';
		this.WARNING = 'warning';
		this.DEBUG = 'debug';
		this.lastMessage = "";

	};
	Logger.logEvent = function(event,lvl){
		console.log(event);
		Logger.lastMessage = event.message || "";
		

		if (lvl === Logger.ERROR){
			$.post("event",event);
		}
	};
	
	Logger.handleError = function(error, url, lineNumber){
		var event = {
				msg:error,
				url:url,
				lineNumber:lineNumber
		};
		
		
		
				
		Logger.logEvent(event);
	};
	
	Logger.getLastMessage = function(){
		console.log(Logger.lastMessage);
		return Logger.lastMessage;
	};
	
	Logger.init = function(){
		Logger.lastMessage = "";
	};
	
	
	return Logger;
});