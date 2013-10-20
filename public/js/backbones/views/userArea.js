define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/userList.html',
         'text!templates/slideshowApp/userElement.html'
         
         
], function($, _, Backbone,
		UserListTmpl, UserElementTmpl
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
			this.collection.each(this.renderUser,this);
			return this;
        },

		renderUser : function(user){
		
			var userElement = new UserElementView({model : user});
			
			$("#userList").append(userElement.render().el);
		}
	});
	
	return UserListView;
});