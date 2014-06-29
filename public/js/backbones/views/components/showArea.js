define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',
         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slideFull.html'
         
], function($, _, Backbone, SlideshowApp, SlideFullAreaTmpl, SlideFullTmpl
){
	Backbone.View.prototype.fadeIn = function(template, wrapper) {
	    wrapper.is(':hidden') ? 
	    wrapper.html(template).show(200) : 
	    wrapper.hide(200, function(){ wrapper.html(template).show(200); }
	    );
	};
	
	SlideShowView = Backbone.View.extend({
		id: "slide-show-img",
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
			
			this.slideCollection.on('all',this.renderCurrentSlide,this);
            this.template = _.template(SlideFullAreaTmpl);
        },
        render : function(){
			this.$el.html('');
	        
	        
			this.$el.html(this.template());
			var slide = this.slideCollection.getCurrentSlide();
			this.renderSlide(slide);
//			this.onShow();
			return this;
        },
        
        renderCurrentSlide : function(){
        	// if the img-zoomer-wrapper does not exist yet, delay setting the zoomable area.
        	// otherwise the picture is not ready yet
        	var delay = (1-$("#img-zoomer-wrapper").length)*500;
        	
        	var slide = this.slideCollection.getCurrentSlide();
        	this.renderSlide(slide);
        	
        	
        	var self = this;
        	setTimeout(function(){
        		self.app.setZoomableArea("#img-zoomer-wrapper");
//        		self.app.setSwipeArea("slide-show-area");
			},delay);
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
	        	$(element).appendTo("#slide-show-area");
        	}
		},
		
        onShow : function(){
        	console.log("Show area onShow!");
        	this.app.addDropArea("slide-show-area");
        	this.app.addDropArea("prev-area");
        	this.app.addDropArea("next-area");
        	this.app.addClickArea("drop-intro-area");
        	this.app.setZoomableArea("#img-zoomer-wrapper");
        	this.app.setSwipeArea("slide-show-area");
		}
	});
	
	
	
	return SlideShowAreaView;
});