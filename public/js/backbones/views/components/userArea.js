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
	
	UserElementView = Backbone.View.extend({
		initialize:function () {
			
			this.template = _.template(UserElementTmpl);

        },
        
        render : function(){
        	var modelData = this.model.toJSON();
        	var data = $.extend({},UIComponents,modelData);
            this.$el.html(this.template(data));
            return this;
        }
	});
	
	UserListView = Backbone.View.extend({
		initialize:function (options) {
			this.collection = options.collection;
			this.collection.on('all',this.render,this);
            this.template = _.template(UserListTmpl);
        },
        render : function(){
        	var data = $.extend({},UIComponents,{});
        	this.$el.html(this.template(data));
        	if (this.collection.length > 0){
        		this.collection.each(this.renderUser,this);
        	}
        	else{
        		this.renderUserInvite();
        	}
			return this;
        },
        
        renderUserInvite : function(){
        	
        	var userInvite = _.template(UserInviteTmpl);
        	var data = $.extend({},UIComponents,{});
        	$("#user-list").append(userInvite(data));
        },

		renderUser : function(user){
		
			var userElement = new UserElementView({model : user});
			
			$("#user-list").append(userElement.render().el);
		},
		
		onShow : function(){
			this.collection.each(this.renderUser,this);
			if (this.collection.length <= 1){
				this.renderUserInvite();
        	}
        	
		}
	});
	
	return UserListView;
});