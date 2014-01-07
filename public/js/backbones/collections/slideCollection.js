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
//			console.log("next!");
			this.currentSlideIndex += 1;
			if (this.currentSlideIndex >= this.length){
				this.currentSlideIndex = this.length-1;
			}
			else{
				this.trigger('all');
			}
		},
		
		prev : function(){
//			console.log("prev!");
			this.currentSlideIndex -= 1;
			if (this.currentSlideIndex < 0){
				this.currentSlideIndex = 0;
				return;
			}
			else{
				this.trigger('all');
			}
		},
		
		jumpTo : function(index){
			if (index >= 0 && index < this.length && index != this.currentSlideIndex){
				
				this.currentSlideIndex = index;
				this.trigger('all');
			}
			return this.at(index);
		},
		
		jumpToByURL : function(url){
			var slide = this.findWhere({dataURL:url});
			if (slide != null){
				var index = this.indexOf(slide);
				if (this.currentSlideIndex != index)
					this.trigger('all');
			}
		},
		
		urlExists : function (url){
			var slide = this.findWhere({dataURL:url});
			console.log("url exists? "+url);
			if (slide != null)
				return true;
			else
				return false;
		},
		
		getCurrentSlide : function(){
//			console.log("Current slide index? "+this.currentSlideIndex);
			var slideIndex = this.length-1;
			if (this.currentSlideIndex >= 0 && this.currentSlideIndex < this.length){
				slideIndex = this.currentSlideIndex;
			}
			else{
				this.currentSlideIndex = slideIndex;
			}
			
//			console.log("Get current slide! "+slideIndex);
			return this.at(slideIndex);
		},
		
		isCurrent : function(slide){
			var slideIndex = this.indexOf(slide);
			if (this.currentSlideIndex == slideIndex){
				return true;
			}
			else{
				return false;
			}
		}
	});
	return SlideCollection;
});