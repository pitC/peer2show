define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){

	BasicSubappView = Backbone.View.extend({
		initialize : function(){
			this.subviews = [];
		},
		
		renderSidebarExtension : function(el){
			return '';
		},
		
		onShow : function(){
        	for (var i = 0; i<this.subviews.length;i++){
        		if(this.subviews[i].onShow)
        			this.subviews[i].onShow();
        	}
        	
        }
	});
	
	return BasicSubappView;
});