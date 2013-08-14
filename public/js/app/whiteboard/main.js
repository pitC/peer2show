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

var sketchpadLocal = $('#layer0').sketchpad({
    aspectRatio: 1,
    backgroundColor: '#000'
});

var sketchpadRemote = $('#layer1').sketchpad({
    aspectRatio: 1,
    backgroundColor: '#AAA'
});

sketchpadRemote.setLineColor('#fadd00');


    /*
    webrtcClient.onDataRcvCb = function(data){
    	var splits = data.split("&");
    	  
    	  var evType = splits[0];
    	  var x = splits[1];
    	  var y = splits[2];
    	  
    	  
    	  var func = tool[evType];
    	  if (func) {
    		
    	    func(x,y);
    	    
    	  }
    };
    //send data to remote peer
    webrtcClient.sendData(ev.type+"&"+mousePos.x+"&"+mousePos.y);
*/


