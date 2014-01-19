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
		
		tagName: 'div',
		className: 'slide-preview',
		
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
		initialize:function (app) {
			this.app = app;
			this.slideCollection = app.slideCollection;
			this.slideCollection.on('all',this.render,this);
            this.template = _.template(SlidePreviewAreaTmpl);
        },
        render : function(){
			this.$el.html(this.template());
			this.slideCollection.each(this.renderSlidePreview,this);
			
			this.onShow();
			this.scrollTo(this.slideCollection.currentSlideIndex);
			return this;
        },

		renderSlidePreview : function(slide){
			
			var isCurrent = this.slideCollection.isCurrent(slide);
//			console.log("Render slide preview! is current? "+isCurrent);
			var index = this.slideCollection.indexOf(slide);
			
			var indexedModel = slide;
			indexedModel.attributes.index = index;
			
			var slidePreview = new SlidePreviewView({model : indexedModel},isCurrent);
			
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
            "mouseleave .slide-preview": "onLeave"
            
        },
        
        onLeave:function(event){
        	$(event.currentTarget).children("button").hide(100);
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
			
		}
	});
	
	return SlidePreviewAreaView;
});