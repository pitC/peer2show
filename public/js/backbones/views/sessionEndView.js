define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/sessionEnd.html',
         'app/settings',
         'app/appStatus',
         'backbones/views/components/newSessionModal'
         
], function($, _, Backbone, SessionEndTmpl, Settings, AppStatus, NewSessionModal){

	
	
	SessionViewEnd = Backbone.View.extend({
		initialize:function (options) {
			this.template = _.template(SessionEndTmpl);
			this.options = options || {};
			this.newSessionModal = new NewSessionModal();
        },
        render : function(){
        	
        	var messageMain = options.status||"Session ended";
        	var messageExtended = "";
        	if (options == AppStatus.SESSION_ENDED){
        		messageExtended = "closed by the user";
        	}
        	else{
        		messageExtended = options.message ||"";
        	}
        	
        	
        	var event = {messageMain:messageMain,messageExtended:messageExtended};
        	
        	this.$el.html(this.template(event));
        	
        	
        	Settings.reset();
        	
			return this;
        }
	});
	
	return SessionViewEnd;
});