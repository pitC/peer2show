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
            this.streamMediaElements = {};
        },
		
		render : function(){
            this.$el.html('');
            
            this.$el.html(this.template());
            
            return this;
        },
        
        addVideoElement : function(stream){
        	var session = {audio:false,video:true};
        	var element = this.webrtcClient.createMediaElement(session, stream);
			
			$("#call-video-container").append(element);
			$(element).attr('id',stream.id);
        },
        
        onActivate : function(){
        	var streams = this.webrtcClient.streams;
        	
        	for (var index in streams){
        		
        		var streamInfo = streams[index];
        		if (streamInfo.stream){
        			console.log(streamInfo);
        			var stream = streamInfo.stream;
        			this.addVideoElement(stream);
        			
        		}
	
        	}
        	
        },
        
        onStream : function(e){
        	console.log("On new stream!");
        	console.log(e);
        	if (e.stream)
        		this.addVideoElement(e.stream);
        },
        onStreamEnd : function(e){
        	console.log("On stream end!");
        	console.log(e);
        	var elementId = e.stream.id;
        	$("#"+elementId).remove();
        }
        
	});
	
	return CallView;
});