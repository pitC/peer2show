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
        	
        	for (var index in streams){
        		
        		var streamInfo = streams[index];
        		if (streamInfo.stream){
        			console.log(streamInfo);
        			session = {audio:false,video:true};
        			
        			
//        			var element = document.getElementById("remote-video");
        			var stream = streamInfo.stream;
        			var element = this.webrtcClient.createMediaElement(session, stream);
        			$("#call-video-container").append(element);
//       			 	if (typeof element.srcObject !== 'undefined') {
//       			      element.srcObject = stream;
//       			    } else if (typeof element.mozSrcObject !== 'undefined') {
//       			      element.mozSrcObject = stream;
//       			    } else if (typeof element.src !== 'undefined') {
//       			      element.src = URL.createObjectURL(stream);
//       			    } else {
//       			      console.log('Error attaching stream to element.');
//       			    }
        			
        			
        			
        		}
        		
        			
    			
    			
    			
        		
        		
        	}
        	
        }
        
	});
	
	return CallView;
});