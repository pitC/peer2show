define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',
         
         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slideFull.html',
         'lib/hammer.min'
         
], function($, _, Backbone, SlideshowApp, SlideFullAreaTmpl, SlideFullTmpl, Hammer
){
	
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
	        	this.setupMultitouch();
        	}
		},
		
		setupMultitouch : function(){
			var self = this;
			this.lastPosX = 0;
			this.lastPosY = 0;
			this.lastScale = 1;
			this.multitouchElement = document.getElementById('slide-show-img');
			var zoomIn = function(event){
				var lstScale = self.lastScale || 1;
				console.log("Zoom in! "+lstScale);
				console.log(event);
				var scale = lstScale;
				if (event.type == 'doubletap'){
					scale = lstScale + 0.2;
					self.lastScale = scale;
				}
				else{
					scale = Math.max(1, Math.min(lstScale * event.gesture.scale, 10));
				};
				var transform = "scale3d("+scale+","+scale+", 0)";
				self.transformImage(transform);
				
			};
			if (this.multitouchElement != null){
				var multitouch = Hammer(this.multitouchElement);
		
				
				multitouch.on("doubletap pinchin", zoomIn);
				multitouch.on("pinchout", self.zoomOut);
				multitouch.on("drag dragend",self.pan);
			}
			
		},
		
		transformImage : function(transform){
			var elemRect = this.multitouchElement;
			console.log(elemRect);
			elemRect.style.transform = transform;
	        elemRect.style.oTransform = transform;
	        elemRect.style.msTransform = transform;
	        elemRect.style.mozTransform = transform;
	        elemRect.style.webkitTransform = transform;
		},
		
		
		
		
		
		zoomOut : function(event){
			console.log("Zoom out!");
			console.log(event);
		},
		
		pan : function(event){
			console.log("Pan");
			console.log(event);
			if (event.type = "drag") {
				
			}
			else if (event.type = "dragend"){
				
			}
		},
		
        onShow : function(){
        	this.app.addDropArea("slide-show-area");
        	this.app.addDropArea("prev-area");
        	this.app.addDropArea("next-area");
//        	this.app.addClickArea("slide-show-area");
        	this.setupMultitouch();
		}
	});
	
	
	
	return SlideShowAreaView;
});