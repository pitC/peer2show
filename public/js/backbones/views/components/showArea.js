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
        	// Transition is optional because when loading large amount of pictures Firefox was hanging
        	// without transition seems to be fine
        	if (options.transition == null){
        		this.transition = true;
        	}
        	else{
        		this.transition = options.transition;
        	}
        	
        	this.template = _.template(SlideFullTmpl);
	    },
	
		render : function(){
			console.log("Render image");
			var data = $.extend({}, this.model.toJSON(), this.metadata);
			console.log(data);
			console.log("[Show Area] render with transition?"+this.transition);
			if (this.transition){
				
			    this.$el.html(this.template(data)).hide().fadeIn(200);
			}
			else{
				this.$el.html(this.template(data));
			}

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
			
			this.slideCollection.on('remove slideChange',this.renderCurrentSlide,this);
			this.listenTo(this.slideCollection,"add",this.renderAddesSlide);
//			this.slideCollection.on('add',this.renderAddedSlide,this);
            this.template = _.template(SlideFullAreaTmpl);
            this.imageMaxHeight = "100%";
        },
        
        renderAddesSlide : function(){
        	var metadataContainer = $("#img-metadata");
        	// just update metadata container
        	if ($(metadataContainer).length > 0){
        		console.log("[Show Area] Render only metadata");
        		var metadataTxt = this.getMetadataDescription();
        		$(metadataContainer).text(metadataTxt);
        	}
        	// render everything only if empty
        	else{
        		console.log("[Show Area] Rerender all!");
        		// render slide without transition effect
        		this.renderCurrentSlide(false);
        	}
        },
        
        render : function(){
			this.$el.html('');
	        
	        var data = $.extend({},UIComponents,{});
			this.$el.html(this.template(data));
			var slide = this.slideCollection.getCurrentSlide();
			if(slide){
				this.renderSlide(slide);
			}
			// no slides to render
			else{
				this.app.addClickArea("drop-intro-area");
			}
			
			return this;
        },
        
        renderCurrentSlide : function(transition){
        	// if the img-zoomer-wrapper does not exist yet, delay setting the zoomable area.
        	// otherwise the picture is not ready yet
        	
        	var delay = (1-$("#img-zoomer-wrapper").length)*500;
        	
        	var slide = this.slideCollection.getCurrentSlide();
        	if(slide){
	        	this.renderSlide(slide,transition);
	        	
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
        
        renderSlide : function(slide, transition){
        	if (slide!= null){
        		
        		var metadata = {
        				description: this.getMetadataDescription(slide),
        				maxHeight:this.imageMaxHeight
        		};
	        	var slideView = new SlideShowView({model : slide,metadata:metadata,transition:transition});
	        	$("#slide-show-area").empty();
	        	
	        	var element = slideView.render().el;
	        	$(element).appendTo("#slide-show-area");
        	}
		},
		
		getMetadataDescription : function(slide){
			return  (this.slideCollection.currentSlideIndex+1)+"/"+this.slideCollection.length;
		},
		
        onShow : function(){
        	console.log("Show area onShow!");
        	this.app.addDropArea("slide-show-area");
        	this.app.addDropArea("prev-area");
        	this.app.addDropArea("next-area");
        	this.app.addClickArea("drop-intro-area");
        	this.app.setZoomableArea("#img-zoomer-wrapper");
        	this.app.setSwipeArea("slide-show-area");
        	this.bindWindowResize();
        	this.setImageMaxHeight();
		},
		
		bindWindowResize : function(){
			console.log("[Show Area] bind window resize");
			var self = this;
			$(window).bind('resize', function(){
				console.log("[Show Area] On window resize!");
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

	});
	
	
	
	return SlideShowAreaView;
});