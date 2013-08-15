/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
var canvas, context, tool;

var urlPath=window.location.pathname; 
var room = urlPath.split('/').pop();
var webrtcClient = new WebRTCClient(room);
webrtcClient.onDataChStateChangeCb = function(data){ alert(data);};
webrtcClient.startUserMedia(null,document.getElementById('localVideo'),document.getElementById('remoteVideo'));
//webrtcClient.startData();

var sketchpadLocal = $('#layer1').sketchpad({
    aspectRatio: 1,
    canvasColor: 'rgba(255, 0, 0, 0)'
});

var sketchpadRemote = $('#layer0').sketchpad({
    aspectRatio: 1,
    canvasColor: '#FFF'
});

sketchpadRemote.setLineColor('#fadd00');
sketchpadLocal.endEventCb = function(){
	var strokeJson = sketchpadLocal.getLastStrokeJson();
	strokeJson += "!";
	var chunks = strokeJson.match(/.{1,500}/g);
	
	
	for (var i = 0; i < chunks.length; i++){
		window.setTimeout(webrtcClient.sendData(chunks[i]),100);
		
	}
};

var totalRcv = ""; 
webrtcClient.onDataRcvCb = function(json){
	totalRcv += json;
	if (totalRcv[totalRcv.length-1] == "!"){
		try{
		var finalStroke = totalRcv.substring(0, totalRcv.length-1);
		console.log("Stroke: "+finalStroke);
		sketchpadRemote.addStroke(finalStroke);
		}
		catch(err){
			console.log(err);
			totalRcv = "";
		}
		totalRcv = "";
	}
};
    



