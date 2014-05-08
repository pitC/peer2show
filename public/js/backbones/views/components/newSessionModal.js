define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/newSessionModal.html',
         'app/settings'
         
], function($, _, Backbone,
		NewSessionModalTmpl, Settings
){
	
	NewSessionModalView = Backbone.View.extend({
		initialize:function () {
			
			this.template = _.template(NewSessionModalTmpl);

        },
        
        events: {
          
            "click #new-session-bt": "startNewSession",
          
        },
        
        startNewSession : function(event){
        	console.log("start new session from modal! "+$("#username-modal-inp").val());
        },
        
        render : function(){
            this.$el.html(this.template({userName: Settings.userName}));
            return this;
        }
	});
	
	
	
	return NewSessionModalView;
});