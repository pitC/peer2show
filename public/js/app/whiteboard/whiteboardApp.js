define(
['app/whiteboard/responsive-sketchpad'],		
function (sketchpad) {
 

	var app = function(webRTCClient){
		this.sketchpadLocal = null;
		this.sketchpadRemotes = {};
		this.webrtc = webRTCClient;
		var self = this;
		
		var DEFAULT_REMOTE_ID = "remote";
		
		this.webrtc.onmessage = function(e){
			
			var sketchpadRemote = self.sketchpadRemotes[e.userid] ||self.sketchpadRemotes[DEFAULT_REMOTE_ID];
			try{
				console.log(e.data);
				var finalMsg = JSON.parse(e.data);
				console.log("Reveived data: "+finalMsg);
				if (finalMsg.remoteCall){
					console.log("Remote call: "+finalMsg.remoteCall);
					var func = sketchpadRemote[finalMsg.remoteCall];
					func();
				}
				else if (finalMsg.stroke){
						sketchpadRemote.addStroke(finalMsg);
				}
				else if (finalMsg.strokes){
					
					sketchpadRemote.addStrokes(finalMsg);
				}
			}catch(err){
				console.log(err);
				
			}
		};
		
		this.initLocalSketpchad = function(canvas){
			
			this.sketchpadLocal = $(canvas).sketchpad({
			    aspectRatio: 1,
			    canvasColor: 'rgba(255, 0,0,0)'
			});
		
			this.sketchpadLocal.endEventCb = function(){
				var strokeJson = self.sketchpadLocal.getLastStrokeJson();
				
				self.webrtc.send(strokeJson);
			};
		};
		
		this.initRemoteSketchpad = function(canvas,userid){
			
			var id = userid || DEFAULT_REMOTE_ID;
			if (this.sketchpadRemotes[id] == null){
				var sketchpadRemote = $(canvas).sketchpad({
				    aspectRatio: 1,
				    canvasColor: '#FFF',
				    locked: true
				});

				this.sketchpadRemotes[id] = sketchpadRemote;
				
			}
			// push local content to the new peer
			
			var localStrokes = self.sketchpadLocal.json();
			self.webrtc.send(localStrokes);
		};
		
		this.clearLocal = function(){
			self.sketchpadLocal.clear();
			var obj = new Object();
			obj.remoteCall = "clear";
			var json = JSON.stringify(obj);
			self.webrtc.send(json);
		};

		function toggleLocal(enable){
			var layer = self.sketchpadLocal.canvas;
			if (enable){
				layer.hide();				
			}
			else{
				layer.show();
			}
		}

		function toggleRemote(enable,userid){
			var id = userid || DEFAULT_REMOTE_ID;
			var layer = self.sketchpadRemotes[id].canvas;
			if (enable){
				layer.hide();
			}
			else{
				layer.show();
			}
		};
	};
		
	return app;
});




