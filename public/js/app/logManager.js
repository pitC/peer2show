define(['jquery',
'lib/stacktrace',
        ],function ($,printStackTrace) {
	
	function Logger()  {
	
	};
	
	Logger.ERROR = 'error';
	Logger.WARNING = 'warning';
	Logger.DEBUG = 'debug';
	Logger.KEEN = 'keen';
	
	
	
	Logger.logEvent = function(event,lvl){
		console.log(event);
		console.log(lvl);
		Logger.lastMessage = event.message || "";
		
		lvl = lvl || Logger.DEBUG;

		if (lvl === Logger.ERROR || lvl === Logger.KEEN){
			event = Logger.processEvent(event);	
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
	
	Logger.processEvent = function(event){
		
		var extendedAttr = {type:event.type||'',stack:event.stack||''};
		
		if (event.message){
			if (event.message.indexOf('Could not connect to peer') !== -1){
				extendedAttr.type = "no-such-session";
			}
		}
		
		var trace = printStackTrace();
		
		extendedAttr.stack = trace;
		$.extend(event,extendedAttr);
		
		return event;
	};
	
	
	return Logger;
});