define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',
         'text!templates/slideshowApp/slidePreviewArea.html',
         'text!templates/slideshowApp/slidePreview.html',
         'text!templates/slideshowApp/activeSlidePreview.html'
         
         
], function($, _, Backbone, SlideshowApp,
		SlidePreviewAreaTmpl, SlidePreviewTmpl,ActiveSlidePreviewTmpl
){
	
	SlidePreviewView = Backbone.View.extend({
		initialize:function (options,isCurrent) {
			this.model = options.model;
			
			
			
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
            "click img": "jumpTo"
        },
		jumpTo : function(event){
			var index = $(event.target).attr("data-index");
		
			//this.app.jumpToByURL({dataURL:dataUrl});
			this.app.jumpToByIndex({index:index});
		},
		onShow : function(){
			
		}
	});
	
	return SlidePreviewAreaView;
});