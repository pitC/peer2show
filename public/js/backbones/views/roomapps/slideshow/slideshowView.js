define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshow/slideshowApp',
         'backbones/views/roomapps/basicSubappView',
         'backbones/collections/slideCollection',
         'backbones/models/slideModel',
         'text!templates/slideshowApp/slidePreviewArea.html',
         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slidePreview.html',
         'text!templates/slideshowApp/activeSlidePreview.html',
         'text!templates/slideshowApp/slideFull.html'
         
         
], function($, _, Backbone, SlideshowApp, BasicSubappView, SlideCollection, SlideModel,
		SlidePreviewAreaTmpl, SlideFullAreaTmpl, SlidePreviewTmpl,ActiveSlidePreviewTmpl, SlideFullTmpl
){
	
	SlideShowView = Backbone.View.extend({
		initialize:function (slideCollection, app) {
			this.slideCollection = slideCollection;
			this.app = app;
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
        	var slidePreview = new SlidePreviewView({model : slide});
        	$("#slide-show-area").empty();
        	var element = slidePreview.render().el;
        	$(element).hide().appendTo("#slide-show-area").fadeIn(500);
//		    $().append(element);
        	}
		}
        ,
		events: {
            "click #prev": "prev",
            "click #next": "next"
        },
        
        prev : function(e){
        	this.app.prevSlide();
        },
        next : function(e){
        	this.app.nextSlide();
        },
        onShow : function(){
			this.app.addDropArea("slide-show-area");
		}
	});
	
	SlidePreviewView = Backbone.View.extend({
		initialize:function (options,isCurrent) {
			this.model = options.model;
			
			console.log("Is current? "+this.isCurrent);
			if (isCurrent)
				this.template = _.template(ActiveSlidePreviewTmpl);
			else
				this.template = _.template(SlidePreviewTmpl);
        },
        
        render : function(){
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
	});
	
	SlidePreviewAreaView = Backbone.View.extend({
		initialize:function (slideCollection, app) {
			this.app = app;
			this.slideCollection = slideCollection;
			this.slideCollection.on('all',this.render,this);
            this.template = _.template(SlidePreviewAreaTmpl);
        },
        render : function(){
			this.$el.html('');
	        
	        
			this.$el.append("<div id='slide-preview-area' />");
			this.slideCollection.each(this.renderSlidePreview,this);
			this.onShow();
			return this;
        },

		renderSlidePreview : function(slide){
			
			var isCurrent = this.slideCollection.isCurrent(slide);
			console.log("Render slide preview! is current? "+isCurrent);
		
			
			var slidePreview = new SlidePreviewView({model : slide},isCurrent);
			
	        $("#slide-preview-area").append(slidePreview.render().el);
		},
		events: {
            "click img": "jumpTo"
        },
		jumpTo : function(event){
			var dataUrl = $(event.target).attr("src");
			var index = this.app.getIndexFromURL(dataUrl);
			//this.app.jumpToByURL({dataURL:dataUrl});
			this.app.jumpToByIndex({index:index});
		},
		onShow : function(){
			this.app.addDropArea("slide-preview-area");
		}
	});
		
	
	SlideshowView = BasicSubappView.extend({
		
		initialize:function (webRTCClient) {
			this.slideCollection = new SlideCollection();
			this.app = new SlideshowApp(webRTCClient, this.slideCollection);
            
            
            this.subviews = [];
            
            this.showArea  = new SlideShowView(this.slideCollection, this.app);
            
            this.previewArea = new SlidePreviewAreaView(this.slideCollection, this.app);
			
			this.subviews.push(this.showArea);
           this.subviews.push(this.previewArea);
            
            
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
			this.app.bindCommunicationEvents();
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