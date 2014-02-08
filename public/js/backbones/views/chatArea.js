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
			this.collection.on('all',this.render,this);
            this.template = _.template(MessageListTmpl);
        },
        render : function(){
        	this.$el.html(this.template());
			this.collection.each(this.renderMessage,this);
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