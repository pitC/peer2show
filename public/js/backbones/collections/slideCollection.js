define([ 
         'jquery', 
         'underscore', 
         'backbone'
], function($, _, Backbone){
	SlideCollection = Backbone.Collection.extend({
		initialize:function () {
			this.currentSlideIndex = -1;
		},
		
		next : function(){
			console.log("next!");
			this.currentSlideIndex += 1;
			if (this.currentSlideIndex >= this.length){
				this.currentSlideIndex = this.length-1;
			}
			this.trigger('all');
		},
		
		prev : function(){
			console.log("prev!");
			this.currentSlideIndex -= 1;
			if (this.currentSlideIndex < 0){
				this.currentSlideIndex = 0;
			}
			this.trigger('all');
		},
		
		jumpTo : function(index){
			if (index >= 0 && index < this.length){
				this.currentSlideIndex = index;
			}
			return this.at(index);
		},
		
		jumpToByURL : function(url){
			var slide = this.findWhere({dataURL:url});
			if (slide != null){
				this.currentSlideIndex = this.indexOf(slide);
				this.trigger('all');
			}
			
		},
		
		getCurrentSlide : function(){
			console.log("Current slide index? "+this.currentSlideIndex);
			var slideIndex = this.length-1;
			if (this.currentSlideIndex >= 0 && this.currentSlideIndex < this.length){
				slideIndex = this.currentSlideIndex;
			}
			else{
				this.currentSlideIndex = slideIndex;
			}
			
			console.log("Get current slide! "+slideIndex);
			return this.at(slideIndex);
		}
	});
	return SlideCollection;
});