define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/sessionEnd.html',
         'text!templates/room/errors/fatalError.html',
         'text!templates/room/errors/browserError.html',
         'text!templates/room/errors/connectionError.html',
         'app/settings',
         'app/globals',
         'app/appStatus',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, SessionEndTmpl, FatalErrorTmpl,BrowserErrorTmpl,ConnectionErrorTmpl, Settings, Globals, AppStatus,UIComponents){

	
	
	SessionViewEnd = Backbone.View.extend({
		initialize:function (options) {
			this.sessionEndTmpl = _.template(SessionEndTmpl);
			this.fatalErrorTmpl = _.template(FatalErrorTmpl);
			this.browserErrorTmpl = _.template(BrowserErrorTmpl);
			this.connectionErrorTmpl = _.template(ConnectionErrorTmpl);
			this.options = options || {};
        },
        render : function(){
        	
        	var messageMain = UIComponents[options.status]||"Session ended";
        	var messageExtended = "";
        	var template = null;
        	        	
        	if (options.status == AppStatus.SESSION_ENDED){
        		
        		messageExtended = UIComponents.closedByUserMsg;
        		template = this.sessionEndTmpl;
        	}
        	else if (options.status == AppStatus.FATAL_ERROR){
        		messageExtended = options.message ||"";
        		// Incompatible browser error
        		if (messageExtended.indexOf("browser") >= 0){
        			template = this.browserErrorTmpl;
        		}
        		// Connection to session problem
        		else if (messageExtended.indexOf("connect") >= 0){
        			template = this.connectionErrorTmpl;
        			
        		}
        		else{
        			template = this.fatalErrorTmpl;
        		}
        	}
        	else{
        		template = this.sessionEntTmpl;
        	}
        	
        	
        	var event = {messageMain:messageMain,messageExtended:messageExtended};
        	
        	var data = $.extend({},UIComponents,event);
        	
        	
        	this.$el.html(template(data));
        	
        	Settings.reset();
        	
        	Globals.switchWindowStyle("session-end-style");
        	
        	
			return this;
        }
	});
	
	return SessionViewEnd;
});