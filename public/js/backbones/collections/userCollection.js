define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){
	UserCollection = Backbone.Collection.extend({
		
		removeUser : function(username){
			var user = this.findWhere({username:username});
			console.log("COLLECTION: Remove user!");
			console.log(user);
			if (user){
				this.remove(user);
				return true;
			}
			return false;
		}
	});
	
	
	
	return UserCollection;
});