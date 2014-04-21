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
        	
        	
        	this.$el.html(this.template());
        	
			return this;
        }
	});
	
	return SessionViewEnd;
});