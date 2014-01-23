define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',

         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slideFull.html'
         
         
], function($, _, Backbone, SlideshowApp, SlideFullAreaTmpl, SlideFullTmpl
){
	
	SlideShowView = Backbone.View.extend({
	        initialize:function (options) {
	        	this.model = options.model;
	        	this.metadata = options.metadata;
	    this.template = _.template(SlideFullTmpl);
	},
	
	render : function(){
		
		console.log("Render image");
		var data = $.extend({}, this.model.toJSON(), this.metadata);
		console.log(data);
	    this.$el.html(this.template(data));
	    return this;
	},
	
	dataURL : function(){
	    return this.model.get('dataURL');
	}
	});
	
	SlideShowAreaView = Backbone.View.extend({
		
		tagName: "div",
		id: "slide-show-area",
		className: "well",
	
		
		initialize:function (app) {
			this.app = app;
			this.slideCollection = app.slideCollection;
			
			this.slideCollection.on('all',this.render,this);
            this.template = _.template(SlideFullAreaTmpl);
        },
        render : function(){
			this.$el.html('');
	        
	        
			this.$el.html(this.template());
			var slide = this.slideCollection.getCurrentSlide();
			this.renderSlide(slide);
			this.onShow();
			return this;
        },
        
        renderSlide : function(slide){
        	if (slide!= null){
        		
        		var metadata = {
        				collectionSize : this.slideCollection.length,
        				index : this.slideCollection.indexOf(slide)+1
        		};
	        	var slidePreview = new SlideShowView({model : slide,metadata:metadata});
	        	$("#slide-show-area").empty();
	        	var element = slidePreview.render().el;
	        	$(element).hide().appendTo("#slide-show-area").fadeIn();
        	}
		},
		
		
        onShow : function(){
        	this.app.addDropArea("slide-show-area");
        	this.app.addDropArea("prev-area");
        	this.app.addDropArea("next-area");
        	this.app.addClickArea("slide-show-area");
		}
	});
	
	
	
	return SlideShowAreaView;
});