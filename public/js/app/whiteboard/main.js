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
    canvasColor: '#FFF',
    locked: true
});


function clearLocal(){
	sketchpadLocal.clear();
	var obj = new Object();
	obj.remoteCall = "clear";
	var json = JSON.stringify(obj)+"!";
	webrtcClient.sendData(json);
}

function toggleLocal(bt){
	var layer = $('#layer1');
	if ($(bt).hasClass("active")){
		layer.hide();
	}
	else{
		
		layer.show();
	}
}

function toggleRemote(bt){
	var layer = $('#layer0');
	if ($(bt).hasClass("active")){
		layer.hide();
	}
	else{
		
		layer.show();
	}
}
var chunks = [], sending;
sketchpadRemote.setLineColor('#fadd00');
sketchpadLocal.endEventCb = function(){
	var strokeJson = sketchpadLocal.getLastStrokeJson();
	strokeJson += "!";
	chunks = chunks.concat(strokeJson.match(/.{1,1000}/g));
	var chunkId = 0;
	var TIME_INTERVAL = 500;
	console.log("Sending stroke...");
	function sendNextChunk(){
		sending = true;
		webrtcClient.sendData(chunks[chunkId]);
		console.log("Send chunk "+chunkId);
		chunkId++;
		if (chunkId < chunks.length)
			window.setTimeout(sendNextChunk,TIME_INTERVAL);
		else{
			sending = false;
			chunks = [];
		}
	}
	if (!sending){
		sendNextChunk();
	}
};

var totalRcv = ""; 
webrtcClient.onDataRcvCb = function(json){
	totalRcv += json;
	console.log("Total rcv: "+totalRcv);
	if (totalRcv[totalRcv.length-1] == "!"){
		try{
		var finalMsg = JSON.parse(totalRcv.substring(0, totalRcv.length-1));
		console.log("Final msg: "+finalMsg);
		if (finalMsg.remoteCall){
			console.log("Remote call: "+finalMsg.remoteCall);
			var func = sketchpadRemote[finalMsg.remoteCall];
			func();
		}
		else if (finalMsg.stroke){
		
		
			
				sketchpadRemote.addStroke(finalMsg);
			}
		
			
			
		}catch(err){
			console.log(err);
			totalRcv = "";
		}
		totalRcv = "";
	}
};
    



