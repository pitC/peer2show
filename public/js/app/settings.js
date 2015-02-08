define([],function () {
	
	var settings =  {
		
		supportedLanguages : ['pl','en'],
		
		roomName : null, 
		userName : null,
		owner : false, // flag if the user is owner of the session
		
		imageSettings : null, // take over from user model
		
		useWebWorker:false, // use web worker for reading files
		
		enableConsoleLog:false,
		
		
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