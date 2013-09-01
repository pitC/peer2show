define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){

	BasicSubappView = Backbone.View.extend({
		initialize : function(){
			this.subviews = [];
			this.title = "unknown";
		},
		
		renderSidebarExtension : function(el){
			return '';
		},
		
		onShow : function(){
			
        	for (var i = 0; i<this.subviews.length;i++){
        		if(this.subviews[i].onShow)
        			this.subviews[i].onShow();
        	}
        	
        },
        
		onNewPeer : function(e){
        	
        	for (var i = 0; i<this.subviews.length;i++){
				if(this.subviews[i].onNewPeer)
					this.subviews[i].onNewPeer(e);
			}
        },
        
        onPeerLeave : function(e){
        	
        	for (var i = 0; i<this.subviews.length;i++){
				if(this.subviews[i].onPeerLeave)
					this.subviews[i].onPeerLeave(e);
			}
        },
        
        onActivate : function(e){
        	
        },
        
        onDeactivate : function(e){
        	
        }
        
        
        
        
	});
	
	return BasicSubappView;
});