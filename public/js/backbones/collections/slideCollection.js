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
			var prevSlideIndex = this.currentSlideIndex;
			this.currentSlideIndex += 1;
			console.log("next! "+this.currentSlideIndex);
			if (this.currentSlideIndex >= this.length){
				this.currentSlideIndex = this.length-1;
			}
			this.trigger('slideChange',this.currentSlideIndex,prevSlideIndex);
		},
		
		prev : function(){
			var prevSlideIndex = this.currentSlideIndex;
			this.currentSlideIndex -= 1;
			console.log("prev! "+this.currentSlideIndex);
			if (this.currentSlideIndex < 0){
				this.currentSlideIndex = 0;
			}
			this.trigger('slideChange',this.currentSlideIndex,prevSlideIndex);
		},
		
		jumpTo : function(index){
			var prevSlideIndex = this.currentSlideIndex;
			if (index >= 0 && index < this.length && index != this.currentSlideIndex){
				console.log("Jump to "+index);
				this.currentSlideIndex = parseInt(index);
				this.trigger('slideChange',this.currentSlideIndex,prevSlideIndex);
			}
			return this.at(index);
		},
		
//		jumpToByURL : function(url){
//			var slide = this.findWhere({dataURL:url});
//			if (slide != null){
//				var index = this.indexOf(slide);
//				if (this.currentSlideIndex != index)
//					this.trigger('all');
//			}
//		},
		
		urlExists : function (url){
			var slide = this.findWhere({dataURL:url});
			console.log("url exists? "+url);
			if (slide != null)
				return true;
			else
				return false;
		},
		
		getCurrentSlide : function(){
			console.log("Current slide index? "+this.currentSlideIndex);
			var slideIndex = this.length-1;
			if (this.currentSlideIndex >= 0 && this.currentSlideIndex < this.length){
				slideIndex = this.currentSlideIndex;
				console.log("within range");
			}
			else{
				this.currentSlideIndex = slideIndex;
				console.log("Outside range");
			}
			
			console.log("Get current slide! "+slideIndex);
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