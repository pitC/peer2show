define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){
	RoomCollection = Backbone.Collection.extend({
            url:"api/rooms"
	});
	return RoomCollection;
});