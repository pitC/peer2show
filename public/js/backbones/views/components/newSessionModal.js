define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/newSessionModal.html',
         'app/settings',
         'app/globals',
         "i18n!nls/uiComponents"
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, NewSessionModalTmpl, Settings,Globals,UIComponents
){
	
	NewSessionModalView = Backbone.View.extend({
		initialize:function (options) {
			options = options || {};
			this.rootEl = options.rootEl || $("#content");
			this.template = _.template(NewSessionModalTmpl);
			this.modalEl = $('#new-session-modal');
			this.createEvent = false;
			this.listenTo(Globals.user,"change:username",this.onUsernameChange);
        },
        
        events: {
            "click #new-session-bt": "createClick",
            "keypress #username-modal-inp": "onEnter"
        },
        
        onEnter : function(event){
        	if (event.keyCode != 13) return;
        	// set flag
        	this.createEvent = true;
        	// close modal manually
        	//  handle the new session in hide event - otherwise page incorrectly reloaded
        	$('#new-session-modal').modal('hide');
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
        	Globals.router.navigate("s/"+Settings.roomName,{trigger:true,replace: true});
        },
        
        render : function(){
        	console.log("Render new session modal");
        	console.log(UIComponents);
        	var data = $.extend({},UIComponents,{userName: Settings.userName});
        	
            this.$el.html(this.template(data));
            return this;
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
        },
        
        onUsernameChange : function(model){
        	$("#username-modal-inp").val(model.get('username'));
        }
	});
	
	
	
	return NewSessionModalView;
});