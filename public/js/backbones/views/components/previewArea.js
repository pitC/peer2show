define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',
         'text!templates/slideshowApp/slidePreviewArea.html',
         'text!templates/slideshowApp/slidePreview.html'
         
         
], function($, _, Backbone, SlideshowApp,
		SlidePreviewAreaTmpl, SlidePreviewTmpl
){
	
	SlidePreviewView = Backbone.View.extend({
		
		tagName: 'li',
		className: 'slide-preview list-group-item',
		
		initialize:function (options,isCurrent) {
			this.model = options.model;
						
			this.isActive = isCurrent;
			
			this.template = _.template(SlidePreviewTmpl);
        },	
        
        render : function(){
            this.$el.html(this.template(this.model.toJSON()));
        	if (this.isActive){
        		this.$el.addClass('active-slide');
        	}
        	else{
        		this.$el.addClass('inactive-slide');
        	}
            return this;
        }
	});
	
	SlidePreviewAreaView = Backbone.View.extend({
		
		SLIDE_PREVIEW_ID_PREFIX : "slide-preview-",
		
		initialize:function (app) {
			this.app = app;
			this.slideCollection = app.slideCollection;
			this.slideCollection.on('remove sort destroy',this.render,this);
			this.listenTo(this.slideCollection,'add',this.renderAddedSlide);
			this.slideCollection.on('slideChange',this.renderActiveSlide,this);
            this.template = _.template(SlidePreviewAreaTmpl);
        },
        
        renderActiveSlide : function(currentSlide,prevSlide){
        	console.log("render actiev slide! "+currentSlide+" "+prevSlide);
        	var prevId = "#"+this.SLIDE_PREVIEW_ID_PREFIX+prevSlide;
        	var currentId = "#"+this.SLIDE_PREVIEW_ID_PREFIX+currentSlide;
        	$(prevId).removeClass('active-slide').addClass("inactive-slide");
        	$(currentId).removeClass('inactive-slide').addClass("active-slide");
        },
        
        renderAddedSlide : function(slide,collection,options){
        	console.log("Slide added!");
        	
        	var index = collection.indexOf(slide);
        	
        	var collectionSize = this.slideCollection.length;
        	console.log(index+" vs "+collectionSize);
        	// detect if added slide was the last one
        	if (index+1 == collectionSize){
        		// then append only
        		console.log("append slide!");
        		this.renderSlidePreview(slide,index);
        	}
        	else{
        		// else rerender everything
        		console.log("rerender everything!");
        		this.render();
        	}
        },
        
        render : function(){
        	
        	var focused = $(':focus');
			this.$el.html(this.template());
			this.slideCollection.each(this.renderSlidePreview,this);
			
			this.onShow();
			this.scrollTo(this.slideCollection.currentSlideIndex);
			focused.focus();
			return this;
        },

		renderSlidePreview : function(slide,index){
			console.log("Render slide preview");
			
			var isCurrent = this.slideCollection.isCurrent(slide);
//			console.log("Render slide preview! is current? "+isCurrent);
//			var index = slide.get("index");
			if (!index){
				index = this.slideCollection.indexOf(slide);
			}
			
			var indexedModel = slide;
			indexedModel.attributes.index = index;
			var viewId = this.SLIDE_PREVIEW_ID_PREFIX+index;
			
			var slidePreview = new SlidePreviewView({model : indexedModel,id:viewId},isCurrent);
			
	        $("#slide-preview-area").append(slidePreview.render().el);
		},
		
		scrollTo : function scrollto(index){
			var topOffset = (index-1)*100;
			$('#sidebar-panel').scrollTop(topOffset);
		},
		
		events: {
            "click img": "jumpTo",
            "click .btn-remove": "removeImg",
            "mouseover .slide-preview": "onHover",
            "mouseleave .slide-preview": "onLeave",
            "click .slide-preview":"onClick"
        },
        
        onLeave:function(event){
        	$(event.currentTarget).children("button").hide(100);
        },
        
        onClick : function(event){
        	console.log("Click!");
        	$(event.currentTarget).children("button").toggle(100);
        },
        
        onHover : function(event){
        	console.log("Hover!");
        	console.log(event);
        	// show buttons
        	$(event.currentTarget).children("button").show(100);
        	
        },
        
        removeImg : function(event){
        	console.log("Remove!");
        	console.log(event);
        	var index = $(event.currentTarget).attr("data-index");
        	this.app.removeImage({index:index});
        },
        
		jumpTo : function(event){
			console.log("Jump to!");	
			console.log(event);
			var index = $(event.target).attr("data-index");
			//this.app.jumpToByURL({dataURL:dataUrl});
			this.app.jumpToByIndex({index:index});
			
		},
				
		onShow : function(){
			this.app.addClickArea('upload-more-btn');
		}
	});
	
	return SlidePreviewAreaView;
});