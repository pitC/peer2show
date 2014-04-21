define([],function () {
	
	function Logger()  {
		
		this.ERROR = 'error';
		this.WARNING = 'warning';
		this.DEBUG = 'debug';

	};
	Logger.logEvent = function(event,lvl){
		console.log(event);
		if (lvl === Logger.ERROR){
			$.post("event",event);
		}
	};
	
	Logger.handleError = function(errorMsg, url, lineNumber){
		var event = {
				msg:errorMsg,
				url:url,
				lineNumber:lineNumber
		};
		
		Logger.logEvent(event);
	};
	
	return Logger;
});