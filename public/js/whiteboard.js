/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
var canvas, context, tool;

var urlPath=window.location.pathname; 
var room = urlPath.split('/').pop();
var webrtcClient = new WebRTCClient(room);
webrtcClient.onDataChStateChangeCb = function(data){ alert(data);};
//webrtcClient.startUserMedia(null,document.getElementById('localVideo'),document.getElementById('remoteVideo'));
//webrtcClient.startData();

$(".videoContainer").draggable().resizable({
aspectRatio: 4 / 3
});


if(window.addEventListener) {
window.addEventListener('load', function () {
  

  function init () {
    // Find the canvas element.
    canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }

    // Pencil tool instance.
    tool = new tool_pencil();

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
    canvas.addEventListener('touchstart', ev_canvas, false);
    canvas.addEventListener('touchmove', ev_canvas, false);
    canvas.addEventListener('touchend',   ev_canvas, false);
    
    webrtcClient.onDataRcvCb = function(data){
    	var splits = data.split("#");
    	  
    	  var evType = splits[0];
    	  var x = splits[1];
    	  var y = splits[2];
    	  
    	  var func = tool[evType];
    	  if (func) {
    	    func(x,y);
    	    
    	  }
    };
  }

  // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (x, y) {
        context.beginPath();
        context.moveTo(x,y);
        tool.started = true;
    };

    this.touchstart = this.mousedown;
    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    
    this.touchmove = function (x,y) {
    
      if (tool.started) {
        context.lineTo(x,y);
        context.strokeStyle = '#FFFFFF';
        context.stroke();
        console.log("draw!");
      }
    };
    
    this.mousemove = this.touchmove;

    // This is called when you release the mouse button.
    this.mouseup = function (x,y) {
      if (tool.started) {
        tool.mousemove(x,y);
        tool.started = false;
      }
    };
    
    this.touchend = this.mouseup;
  }
  function getPos(canvas, evt) {
      var coordinates = {};
	  if(evt.type.indexOf("touch") != -1) {
		  coordinates = 
			  {
				  x: evt.targetTouches[0].pageX - canvas.offsetLeft,
				  y: evt.targetTouches[0].pagey - canvas.offsetTop
			  };
		  
		  
	  }
	  else{
		  coordinates = 
       {
    	  x: evt.pageX - canvas.offsetLeft,
    	  y: evt.pageY - canvas.offsetTop
      };
	  }
	  return coordinates;
  }
  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
	
    console.log(ev);
	 var mousePos = getPos(canvas, ev);
    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(mousePos.x,mousePos.y);
      
    }
    console.log(ev.type+" "+mousePos.x+" "+mousePos.y);
    //send data to remote peer
    webrtcClient.sendData(ev.type+"#"+mousePos.x+"#"+mousePos.y);
    
  }

  init();

}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

