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
$(".pick-a-color").pickAColor({
	showHexInput: false
});

$(".slider").slider({
	min: 1,
	max: 100,
	step: 1,
	value: 20
}).on('slide', function(ev){
	sketchpadLocal.setLineSize(ev.value);
});

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
	var json = JSON.stringify(obj);
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
		sketchpadLocal.setBackground("#FFF");
	}
	else{
		
		layer.show();
		sketchpadLocal.setBackground('rgba(255, 0, 0, 0)');
	}
}
var chunks = [], sending;
sketchpadRemote.setLineColor('#fadd00');
sketchpadLocal.endEventCb = function(){
	var strokeJson = sketchpadLocal.getLastStrokeJson();
	webrtcClient.sendData(strokeJson);
};

var totalRcv = ""; 
webrtcClient.onDataRcvCb = function(json){
	
		try{
		var finalMsg = JSON.parse(json);
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
			
		}
};
    



