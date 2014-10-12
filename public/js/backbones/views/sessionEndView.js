define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/sessionEnd.html',
         'text!templates/room/errors/fatalError.html',
         'text!templates/room/errors/browserError.html',
         'text!templates/room/errors/connectionError.html',
         'app/settings',
         'app/appStatus',
         'backbones/views/components/newSessionModal',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, SessionEndTmpl, FatalErrorTmpl,BrowserErrorTmpl,ConnectionErrorTmpl, Settings, AppStatus, NewSessionModal,UIComponents){

	
	
	SessionViewEnd = Backbone.View.extend({
		initialize:function (options) {
			this.sessionEndTmpl = _.template(SessionEndTmpl);
			this.fatalErrorTmpl = _.template(FatalErrorTmpl);
			this.browserErrorTmpl = _.template(BrowserErrorTmpl);
			this.connectionErrorTmpl = _.template(ConnectionErrorTmpl);
			this.options = options || {};
			this.newSessionModal = new NewSessionModal();
        },
        render : function(){
        	
        	var messageMain = options.status||"Session ended";
        	var messageExtended = "";
        	var template = null;
        	        	
        	if (options.status == AppStatus.SESSION_ENDED){
        		
        		messageExtended = "closed by the user";
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
        	
        	$(".session-style").removeClass("session-style").addClass("session-end-style");
        	
        	
			return this;
        }
	});
	
	return SessionViewEnd;
});