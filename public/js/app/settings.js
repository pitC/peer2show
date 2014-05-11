define([],function () {
	
	var settings =  {
		
		maxWidth : 800,
		maxHeight : 500,
		
		roomName : null, 
		userName : null,
		owner : false, // flag if the user is owner of the session
		
		
		
		previewMaxHeight:100,
		
		init : function(){
			this.calculateMaxDimensions();
		},
		
		reset : function(){
			this.roomName = null;
			this.owner = false;
		},
		
		calculateMaxDimensions : function(){
			this.maxHeight = 1200;
			this.maxWidth = 2000;
		},
		
		generateRoomId : function(){
        	var LENGTH = 5;
    		var rand = function() {
    		    return Math.random().toString(36).substr(2, LENGTH); // remove `0.`
    		};
    		return rand();
    	}
		
	};
	
	return settings;
});