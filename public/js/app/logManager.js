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
		
		if (event.message === "[object Event]"){
			Logger.lastMessage = (event.type || "")+" - see console for more details";
		}
		
		lvl = lvl || Logger.DEBUG;

		if (lvl === Logger.ERROR || lvl === Logger.KEEN){
			event = Logger.processEvent(event);	
			$.post("/event",event);
		}
	};
	
	Logger.handleError = function(error, url, lineNumber){
		
		  
		var event = {
				msg:error,
				url:url,
				lineNumber:lineNumber
		};
				
		Logger.logEvent(event, Logger.ERROR);
	};
	
	Logger.getLastMessage = function(){
		console.log(Logger.lastMessage);
		return Logger.lastMessage;
	};
	
	Logger.init = function(){
		Logger.lastMessage = "";
		Logger.sessionRole = "";
	};
	
	Logger.setSessionRole = function(role){
		Logger.sessionRole = role;
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
		
		var extendedAttr = {type:event.type||'',stackString:"",role:Logger.sessionRole};
		
		if (event.message){
			if (event.message.indexOf('Could not connect to peer') !== -1){
				extendedAttr.type = "no-such-session";
			}
		}
		
		if (event.stack){
			extendedAttr.stackString = JSON.stringify(event.stack);
		}
		else{
			var trace = printStackTrace();
			extendedAttr.stackString = trace||'';
		}
		
		$.extend(event,extendedAttr);
		console.log(">>> Processed event");
		console.log(JSON.stringify(event.stack));
		console.log(event);
		return event;
	};
	
	
	return Logger;
});