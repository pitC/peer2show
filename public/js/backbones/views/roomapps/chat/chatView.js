define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomapps/basicSubappView',
         'text!templates/chatApp/chatInput.html',
         'text!templates/chatApp/chatOutput.html',
         'text!templates/chatApp/chatMsg.html'
         
], function($, _, Backbone, BasicSubappView, ChatInputTmpl, ChatOutputTmpl, ChatMsgTmpl){
	
	ChatOutputView = Backbone.View.extend({
		initialize:function (app) {
            this.template = _.template(ChatOutputTmpl);
            this.messageTmpl = _.template(ChatMsgTmpl);
            this.chatApp = app;
            this.chatHistory = []
            
            
        },
        		
        render : function(){
            this.$el.html(this.template());
            
            return this;
        },
		
		onShow : function(){
			
        },
        
        appendMessage : function(jsonMsg){
        	var d=new Date();
        	jsonMsg.timestamp = d.toTimeString(); 
        	
        	$("#chat-output-container").append(this.messageTmpl(jsonMsg));
        }
        
		
	});
	
	ChatInputView = Backbone.View.extend({
		initialize:function (app, chatOutput) {
            this.template = _.template(ChatInputTmpl);
            this.chatApp = app;
            this.chatOutput = chatOutput;
        },
        		
        render : function(){
            this.$el.html(this.template());
            
            return this;
        },
        events : {
			
			"click button#chat-input-send": "onBtClick",
			"keypress input[type=text]": "onEnter"
		},
		
		sendMsg : function(event){
			var text = $('#chat-input-msg').val();
			var jsonMsg = {
					user : "me",
					text : text
			};
			this.chatApp.send(text);
			this.chatOutput.appendMessage(jsonMsg);
			$('#chat-input-msg').val('');
		},
		
		onEnter : function(event){
			if (event.keyCode != 13) return;
			this.sendMsg(event);
		},
		
		onBtClick : function(event){
			this.sendMsg(event);
		}
	});
	
	
	
	ChatView = BasicSubappView.extend({
		
		initialize:function (webRTCClient) {
            this.chatClient = webRTCClient;
            
            this.subviews = [];
            
            this.chatOutput = new ChatOutputView(this.chatClient);
            this.chatInput = new ChatInputView(this.chatClient, this.chatOutput);
			
			
			this.subviews.push(this.chatOutput);
            this.subviews.push(this.chatInput);
            
            
            this.title = "Chat";
            
        },

		render : function(){
            this.$el.html('');
         // order must be kept in init part
            for (var index in this.subviews){
            	var subview = this.subviews[index];
            	this.$el.append(subview.render().el);
            }        
            return this;
        },
        
             
        
        	
    
	    onActivate : function(){
	    	var self = this;
			console.log("Bind event");
			this.chatClient.onmessage = function(e){
            	var jsonMsg = {user:e.userid,text:e.data};
            	console.log(JSON.stringify(e));
            	self.chatOutput.appendMessage(jsonMsg);
            };
	    	this.onShow();
	    	
	    	// rebind events
	    	for (var index in this.subviews){
	        	var subview = this.subviews[index];
	        	subview.delegateEvents();
	        }   
	    	
	    },
    
	    onDeactivate : function(){
	    	
	    }
	});
	
	return ChatView;
});