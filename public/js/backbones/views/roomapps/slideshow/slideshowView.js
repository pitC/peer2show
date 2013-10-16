define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshow/slideshowApp',
         'backbones/views/roomapps/basicSubappView',
         'text!templates/slideshowApp/dropArea.html',
         
         
], function($, _, Backbone, SlideshowApp, BasicSubappView, DropAreaTmpl){
	
	
	
	DropAreaView = Backbone.View.extend({
		initialize:function (app) {
            this.template = _.template(DropAreaTmpl);
            this.app = app;
        
        },
        		
        render : function(){
            this.$el.html(this.template());
            
            return this;
        },
        
		
		onShow : function(){
			this.app.initDropArea("drop-area");
			this.app.initPreviewArea("drop-area");
		}
		
		
	});
	
	
	
	SlideshowView = BasicSubappView.extend({
		
		initialize:function (webRTCClient) {
            this.app = new SlideshowApp(webRTCClient);
            
            this.subviews = [];
            
            this.dropArea = new DropAreaView(this.app);
           
			
			
			this.subviews.push(this.dropArea);
           
            
            
            this.title = "Slideshow";
            
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
	
	return SlideshowView;
});