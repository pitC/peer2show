define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/slideshowApp',

         'text!templates/slideshowApp/slideFullArea.html',
         'text!templates/slideshowApp/slideFull.html'
         
         
], function($, _, Backbone, SlideshowApp, SlideFullAreaTmpl, SlideFullTmpl
){
	
	SlidePreviewView = Backbone.View.extend({
	        initialize:function () {
	    this.template = _.template(SlideFullTmpl);
	},
	
	render : function(){
	    this.$el.html(this.template(this.model.toJSON()));
	    return this;
	},
	
	dataURL : function(){
	    return this.model.get('dataURL');
	}
	});
	
	SlideShowAreaView = Backbone.View.extend({
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
        	var slidePreview = new SlidePreviewView({model : slide});
        	$("#slide-show-area").empty();
        	var element = slidePreview.render().el;
        	$(element).hide().appendTo("#slide-show-area").fadeIn();
//		    $().append(element);
        	}
		}
        ,
		
        onShow : function(){
        	this.app.addDropArea("slide-show-area");
        	this.app.addDropArea("prev-area");
        	this.app.addDropArea("next-area");
		}
	});
	
	
	
	return SlideShowAreaView;
});