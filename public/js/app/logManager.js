define([
'lib/stacktrace',
        ],function (printStackTrace) {
	
	function Logger()  {
		
		this.ERROR = 'error';
		this.WARNING = 'warning';
		this.DEBUG = 'debug';
		this.lastMessage = "";

	};
	
	Logger.ERROR = 'error';
	Logger.WARNING = 'warning';
	Logger.DEBUG = 'debug';
	
	
	
	Logger.logEvent = function(event,lvl){
		console.log(event);
		console.log(lvl);
		Logger.lastMessage = event.message || "";
		
		lvl = lvl || Logger.DEBUG;

		if (lvl === Logger.ERROR){
			
			
						
			var trace = printStackTrace();
			console.log(trace);
			event.stack = trace;
			
			$.post("event",event);
		}
	};
	
	Logger.handleError = function(error, url, lineNumber){
		
		  
		var event = {
				msg:error,
				url:url,
				lineNumber:lineNumber,
		};
				
		Logger.logEvent(event, Logger.ERROR);
	};
	
	Logger.getLastMessage = function(){
		console.log(Logger.lastMessage);
		return Logger.lastMessage;
	};
	
	Logger.init = function(){
		Logger.lastMessage = "";
	};
	
	Logger.switchConsoleLogs = function(enable){
		if (enable){
			if (Logger.oldConsoleLog != null){
				window['console']['log'] = Logger.oldConsoleLog;
			}
		}
		else{
			Logger.oldConsoleLog = console.log;
			window['console']['log'] = function() {};
		}
	};
	
	
	
	return Logger;
});