define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/userList.html',
         'text!templates/slideshowApp/userElement.html',
         'text!templates/slideshowApp/userInvite.html',
         "i18n!nls/uiComponents"
         
         
], function($, _, Backbone,
		UserListTmpl, UserElementTmpl,UserInviteTmpl,UIComponents
){
	
	var getUserElementId = function(peerId){
		return "usr-"+peerId;
	};
	
	var getPeerId = function(userElementId){
		// remove "usr-" part
		return userElementId.substring(4);
	};
	
	UserElementView = Backbone.View.extend({
		
		className: 'user-element',
		
		initialize:function () {
			this.template = _.template(UserElementTmpl);
        },
        
        render : function(){
        	var modelData = this.model.toJSON();
        	var data = $.extend({},UIComponents,modelData);
        	this.el.id = getUserElementId(this.model.get("id"));
            this.$el.html(this.template(data));
            
            return this;
        }
	});
	
	UserListView = Backbone.View.extend({
		initialize:function (options) {
			this.collection = options.collection;
			this.app = options.app;
			
			this.collection.on('destroy',this.render,this);
			this.collection.on('remove',this.renderRemovedUser,this);
			this.collection.on('add',this.renderAddedUser,this);
			this.app.syncMonitor.on("syncProgress",this.renderUserStatus,this);
            this.template = _.template(UserListTmpl);
        },
        
        renderUserStatus : function(data){
        	if (data.peer != null){
        		var elementId = "#"+getUserElementId(data.peer.peerId);
        		var progress = data.peer.progress/100;
        		var progressTitle = "Sync: "+data.peer.progress+"%";
        		var dgr = progress*360;
        		var dgrUnder50 = dgr+90;
        		var dgrMore50 = dgr-90;
        		var styleUnder50 = "linear-gradient("+dgrUnder50+"deg, transparent 50%, white 50%), linear-gradient(90deg, white 50%, transparent 50%)";
        		
        		var styleMore50 = "linear-gradient("+dgrMore50+"deg, transparent 50%, rgb(188, 188, 188) 50%), linear-gradient(90deg, white 50%, transparent 50%)";
        		var style = {};
        		var progressElement = $(elementId).find(".user-status > span");
//        		if (progress == 0){
//        			style = {"background-color":"rgb(168, 10, 14)"};
//        			$(progressElement).addClass("blink-me");
//        			
//        		}
//        		else 
        			if (progress <= 0.5){
        			style = {"background-image":styleUnder50/*,"background-color":"rgb(188, 188, 188)"*/};
//        			$(progressElement).removeClass("blink-me");
        		}
        		else{
        			style = {"background-image":styleMore50/*,"background-color":"rgb(188, 188, 188)"*/};
//        			$(progressElement).removeClass("blink-me");
        		}
        		$(progressElement).show().attr("title",progressTitle).css(style);
        	}
        },
        
        renderAddedUser : function(user,collection,options){
        	// remove user invite first
        	this.renderUser(user);
        	this.renderUserInvite();
        },
        
        renderRemovedUser : function(user,collection,options){
        	console.log("--- RENDER REMOVED USER");
        	console.log(user);
        	var elementId = "#"+getUserElementId(user.get("id"));
        	$(elementId).remove();
        	this.renderUserInvite();
        },
        
        render : function(){
        	var data = $.extend({},UIComponents,{});
        	this.$el.html(this.template(data));
        	if (this.collection.length > 0){
        		this.collection.each(this.renderUser,this);
        	}
        	this.renderUserInvite();
			return this;
        },
        
        renderUserInvite : function(){
        	$("#user-invite").remove();
        	if (this.collection.length <= 1){
	        	var userInvite = _.template(UserInviteTmpl);
	        	var data = $.extend({},UIComponents,{});
	        	$("#user-list").append(userInvite(data));
        	}
        },

		renderUser : function(user){
		
			var userElement = new UserElementView({model : user});
			
			$("#user-list").append(userElement.render().el);
		},
		
		onShow : function(){
			this.collection.each(this.renderUser,this);
			
			this.renderUserInvite();
        	
		}
	});
	
	return UserListView;
});