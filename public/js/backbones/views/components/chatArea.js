define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/messageList.html',
         'text!templates/slideshowApp/messageElement.html'
         
         
], function($, _, Backbone,
		MessageListTmpl, MessageElementTmpl
){
	
	MessageElementView = Backbone.View.extend({
		initialize:function () {
			
			this.template = _.template(MessageElementTmpl);

        },
        
        render : function(){
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
	});
	
	MessageListView = Backbone.View.extend({
		initialize:function (app) {
			this.app = app;
			this.collection = app.messageCollection;
			this.collection.on('all',this.onCollectionEvent,this);
            this.template = _.template(MessageListTmpl);
        },
        

        onCollectionEvent : function(eventName){
        	this.render();
        	// enable blink. It get's enabled from the roomView level, on panel expand
        	var enableBlink = (eventName == 'add' && !$('#message-list').is(':visible'));
        	this.toggleBlink(enableBlink);
        },
        
        toggleBlink : function(enable){
        	// enable blinker on new message and if the message list is not visible
        	var sidebarOffElement = $('#sidebar-toggle');
        	var sidebarOnElement = $('#msg-icon');
        	if (enable){
        		console.log("Is this root visible?"+this.$el.is(':visible'));
        		// if the root element is visible it means the sidebar is visible as well
        		// so set the blinker on the sidebar element
        		if ($("#sidebar-panel").is(":visible")){
        			sidebarOnElement.addClass('blink-me');
        		}
        		// otherwise go up up to the sidebar toggle button
        		else{
        			sidebarOnElement.addClass('blink-me');
        			// for now commented out as it's not perfect
//        			sidebarOffElement.addClass('blink-me');
        		}
        	
        	}
        	else{
        		sidebarOnElement.removeClass('blink-me');
        		sidebarOffElement.removeClass('blink-me');
        	}
        },
        
        render : function(){
        	
        	this.$el.html(this.template());
			this.collection.each(this.renderMessage,this);
			
			// temporary solution for issue #27
			$('#message-inp').focus();	
			return this;
        },
        
        events: {
            "click #apply-bt": "setUserName",
            "keypress #message-inp": "onEnter"
        },
        
        
        onEnter: function(event){
        	if (event.keyCode != 13) return;
        	this.sendMessage();
        },
        
        sendMessage : function(){
        	var msg = $("#message-inp").val();
        	this.app.sendMessage(msg);
        	$('#message-inp').focus();
        },
        

		renderMessage : function(user){
		
			var messageElement = new MessageElementView({model : user});
			
			$("#message-list").append(messageElement.render().el);
		}
	});
	
	return MessageListView;
});