define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomapps/basicSubappView',
         'text!templates/callApp/videoContainer.html'
         
         
], function($, _, Backbone, BasicSubappView, VideoContainerTmpl){

	
	
	CallView = BasicSubappView.extend({
		
		initialize:function (webRTCClient) {
            this.webrtcClient = webRTCClient;
            this.template = _.template(VideoContainerTmpl);
                   
            this.title = "Call";
            
        },
		
		render : function(){
            this.$el.html('');
            
            this.$el.html(this.template());
            
            return this;
        },
        
        onActivate : function(){
        	var streams = this.webrtcClient.streams;
        	
//        	for (var index in streams){
//        		var streamInfo = streams[index];
//        		console.log(streamInfo);
//        		if (streamInfo.type == "local"){
//        			
//        			console.log("append video!");
//        			var stream = streamInfo.mediaElement;
//        			$("#call-video-container").append(stream);
//                }
//        		
//        		
//        	}
        	var video = $("#sidebar").find("video").clone("true");
        	$("#call-video-container").append(video);
        }
        
	});
	
	return CallView;
});