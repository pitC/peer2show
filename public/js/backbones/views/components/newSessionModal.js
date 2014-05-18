define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/newSessionModal.html',
         'app/settings',
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, NewSessionModalTmpl, Settings
){
	
	NewSessionModalView = Backbone.View.extend({
		initialize:function (options) {
			options = options || {};
			this.rootEl = options.rootEl || $("#content");
			this.template = _.template(NewSessionModalTmpl);
			this.modalEl = $('#new-session-modal');
			this.createEvent = false;
        },
        
        events: {
            "click #new-session-bt": "createClick",
        },
        
        createClick : function(event){
        	// set flag
        	this.createEvent = true;
        	// close modal manually
        	//  handle the new session in hide event - otherwise page incorrectly reloaded
        	$('#new-session-modal').modal('hide');
        },
        
        
        
        startNewSession : function(){
        	console.log("start new session from modal! "+$("#username-modal-inp").val());
        	var username = $("#username-modal-inp").val();
        	Settings.userName = username;
        	Settings.owner = true;
        	Settings.roomName = Settings.generateRoomId();
//        	$('#new-session-modal').modal('hide');
        	window.location.hash = Settings.roomName;
//        	window.location = window.location+Settings.roomName;
        },
        
        render : function(){
            this.$el.html(this.template({userName: Settings.userName}));
            return this;
            this.onRender();
        },
        
        onRender :function(){
        	this.createEvent = false;
        	var self = this;
        	$('#new-session-modal').on('hidden.bs.modal', function (e) {
				
				if (self.createEvent){
					self.startNewSession();
				}  
			});
        	
        	$('#new-session-modal').on('shown.bs.modal', function (e) {
				
				self.createEvent = false;
			});
        }
	});
	
	
	
	return NewSessionModalView;
});