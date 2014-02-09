define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/userList.html',
         'text!templates/slideshowApp/userElement.html',
         'text!templates/slideshowApp/userInvite.html'
         
         
], function($, _, Backbone,
		UserListTmpl, UserElementTmpl,UserInviteTmpl
){
	
	UserElementView = Backbone.View.extend({
		initialize:function () {
			
			this.template = _.template(UserElementTmpl);

        },
        
        render : function(){
            this.$el.html(this.template(this.model.toJSON()));
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
        	this.$el.html(this.template());
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
        	$("#user-list").append(userInvite());
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