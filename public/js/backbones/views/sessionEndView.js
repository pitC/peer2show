define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/room/sessionEnd.html',
         
], function($, _, Backbone, SessionEndTmpl){

	
	SessionViewEnd = Backbone.View.extend({
		initialize:function (options) {
			this.template = _.template(SessionEndTmpl);
        },
        render : function(){
        	
        	var event = {messageExtended:"Test"};
        	
        	this.$el.html(this.template(event));
        	
			return this;
        }
	});
	
	return SessionViewEnd;
});