define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',
         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slideFull.html',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, SlideshowApp, SlideFullAreaTmpl, SlideFullTmpl, UIComponents
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
	    this.$el.html(this.template(data)).hide().fadeIn(500);
//		this.$el.html(this.template(data));
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
            this.imageMaxHeight = "100%";
            
        },
        render : function(){
			this.$el.html('');
	        
	        var data = $.extend({},UIComponents,{});
			this.$el.html(this.template(data));
			var slide = this.slideCollection.getCurrentSlide();
			if(slide){
				this.renderSlide(slide);
			}
//			this.onShow();
			return this;
        },
        
        renderCurrentSlide : function(){
        	// if the img-zoomer-wrapper does not exist yet, delay setting the zoomable area.
        	// otherwise the picture is not ready yet
        	var delay = (1-$("#img-zoomer-wrapper").length)*500;
        	
        	var slide = this.slideCollection.getCurrentSlide();
        	if(slide){
	        	this.renderSlide(slide);
	        	
	        	
	        	var self = this;
	        	setTimeout(function(){
	        		self.app.setZoomableArea("#img-zoomer-wrapper");
	//        		self.app.setSwipeArea("slide-show-area");
				},delay);
        	}
        	else{
        		this.render();
        	}
        },
        
        renderSlide : function(slide){
        	if (slide!= null){
        		
        		var metadata = {
        				collectionSize : this.slideCollection.length,
        				index : this.slideCollection.indexOf(slide)+1,
        				maxHeight:this.imageMaxHeight
        		};
	        	var slideView = new SlideShowView({model : slide,metadata:metadata});
	        	$("#slide-show-area").empty();
	        	
	        	var element = slideView.render().el;
	        	$(element).appendTo("#slide-show-area");
//	        	$(element).css("max-height",this.imageMaxHeight).appendTo("#slide-show-area");
//	        	$(element);
//	        	
//	        	$("#slide-show-area").css("max-height",this.imageMaxHeight);
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
//        	this.bindFullscreenEvents();
        	this.bindWindowResize();
        	this.setImageMaxHeight();
		},
		
		bindWindowResize : function(){
			console.log("[Show Area] bind window resize")
			var self = this;
			$(window).bind('resize', function(){
				console.log("[Show Area] On window resize!")
				self.setImageMaxHeight();
				self.renderCurrentSlide();
			});
		},
		
		setImageMaxHeight : function(){
			var windowHeight = $(window).height();
			var documentHeight = $(document).height();
			var position = $("#slide-show-area").offset();
			console.log("[Show Area] Preferred height: "+windowHeight+" "+documentHeight+" "+position.top);
			var preferredHeight = windowHeight-position.top;
			this.imageMaxHeight = preferredHeight+"px";
		}
//		,
//		
//		bindFullscreenEvents : function(){
//        	var self = this;
//        	document.addEventListener("webkitfullscreenchange", function () {
//        		self.renderCurrentSlide();
//        	}, false);
//        }
	});
	
	
	
	return SlideShowAreaView;
});