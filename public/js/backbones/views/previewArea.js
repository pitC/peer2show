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
		initialize:function (app) {
			this.app = app;
			this.slideCollection = app.slideCollection;
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
	
	return SlidePreviewAreaView;
});