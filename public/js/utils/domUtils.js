define([],function () {
	
	var domUtils =  {
		
		
		
		adjustInputWidths : function(sectionId){
			console.log("Adjust input Widths!");
			console.log(sectionId);
	    	var maxWidthFound = 0;
	    	var currentWidth = 0;
	    	$(sectionId).find('.input-group-addon').each(function(){
	    		currentWidth = $(this).outerWidth();
	    		console.log("Current width: "+currentWidth);
	    		console.log($(this));
	    		if (currentWidth > maxWidthFound){
	    			
	    			maxWidthFound = currentWidth;
	    		}
	    	});
	    	console.log("max width found:"+maxWidthFound);
	    	// apply to all
	    	if (maxWidthFound > 0){
	    		$(sectionId).find('.input-group-addon').css({"min-width":maxWidthFound,'text-align':'left'});
	    	}
		}
		
	};
	
	return domUtils;
});