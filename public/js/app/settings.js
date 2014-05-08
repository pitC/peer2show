define([],function () {
	
	var settings =  {
		
		maxWidth : 800,
		maxHeight : 500,
		
		roomName : "Anonymous room", 
		userName : "Anonymous user",
		owner : false, // flag if the user is owner of the session
		
		
		previewMaxHeight:100,
		
		init : function(){
			this.calculateMaxDimensions();
		},
		
		calculateMaxDimensions : function(){
			this.maxHeight = 1200;
			this.maxWidth = 2000;
		}
	};
	
	return settings;
});