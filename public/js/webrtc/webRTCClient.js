define([ 
	'peerjs',
	'socketio',
	'webrtc/roomStatus'
], function(PeerJS, io, RoomStatus){

	var connection = function(){
		
		this.ownerPeerId = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
		
		this.peerJSOptions = {
			key: '7673s5yzjupzxgvi',
			debug: 3, // all logs
			// host - for now use peer.js host
			// port
			config: {'iceServers': [
			                        { url: 'stun:stun.l.google.com:19302' },
			                        { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
			                      ]}
		};
		
		this.dataChannelOptions = {
			reliable: true
		};
		
		this.ownPeer = null;
		
		this.ownerConnection = null;
		this.peerConnections = {};
		this.ongoingTransfers = {};
		
		var self = this;
		
		this.onopen;
		this.onclose;
		
		this.onrpc;
		this.onfile;
		this.onTransferFinish;
		
		this.rpc = function(funcName, parameters){
			var obj = new Object();
			obj.remoteCall = funcName;
			obj.parameters = parameters || {};
			var json = JSON.stringify(obj);
			this.send(json);
		};
		
		this.sendFile = function(file,metadata){
			var data =metadata || {};
			data.file = file;
			this.send(data);
		};
		
		this.send = function(data){
			console.log("Send data");
			console.log(data);
			// For now only broadcast!
			for (var peerId in self.peerConnections){
				console.log("Send to "+peerId);
				var peerConnection= self.peerConnections[peerId];
				peerConnection.send(data);
			}
			if (this.ownerConnection){
				console.log("Send to session owner");
				this.ownerConnection.send(data);
			}
		};
		
		this._isOwner = function(){
			if (this.ownerPeerId == this.ownPeer.id){
				return true;
			}
			else{
				return false;
			}
		};
		
		this._onData = function(data){
			console.log("Received data!");
			console.log(data);
			if (data.file != null){
				  var file = data.file;
				  delete data.file;
				  var metadata = data;
				  var dataView = new Uint8Array(file);
			      var dataBlob = new Blob([dataView]);
			      var url = window.URL.createObjectURL(dataBlob);
			      console.log(url);
			      if(self.onfile){
			    	  self.onfile(url,metadata);
			      }
			}
			else{
				var finalMsg = JSON.parse(data);
				// remote call
				if (finalMsg.remoteCall){
					var options = finalMsg.parameters || {};
					
					options.remote = true;
					if (self.onrpc){
						self.onrpc(finalMsg.remoteCall,options);
					}
				}
				// internal
				else{
					
				}
			}
		};
		
		this._onPeerConnection = function(conn) {
			console.log("Peer connection!");
			console.log(conn);
			
			// Add event callbacks
			conn.on('data', self._onData);
			conn.on('close',self._onPeerConnectionClose);
			
			// Add peer to associated array
			self.peerConnections[conn.peer] = conn;
			
			// Propagate event
			if(self.onopen){
				// TODO: transmit usernames
				var eventData = {username:conn.metadata.username||"Guest"};
				self.onopen(eventData);
			};
		};
		
		this._onPeerConnectionClose = function(){
			console.log("peer connection close!");
			console.log(this);
			
			// remove peer from associated array
			delete self.peerConnections[this.peer];
			
			// propagate event
			if(self.onclose){
				var eventData = {};
				self.onclose(eventData);
			}
		};
		

		this.create = function(options,callback, caller){
			console.log("Create!");
			
			this.ownPeer = new Peer(this.ownerPeerId,this.peerJSOptions);
			
			this.ownPeer.on('connection',this._onPeerConnection);
			this.ownPeer.on('open', function(id) {
				  console.log('My peer ID is: ' + id);
				 
				  if (callback){
						callback(caller,RoomStatus.NEW_ROOM);
				  }
			});
		};
		
		this.join = function(options,callback,caller){
			console.log("Join!");
			this.ownPeer = new Peer(this.peerJSOptions);
			var self = this;
			
			var metadata = {username:options.userName};
			this.dataChannelOptions.metadata = metadata;
			
			this.ownPeer.on('open', function(id) {
				// on connection to broker
				// 1. set ID
				  console.log('My peer ID is: ' + id);
				  this.peerId = id;
				  if (callback){
						callback(caller,RoomStatus.JOINING);
				 }
				
				 // 2. create peer connection to owner
				 var ownerId = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
				 self.ownerConnection = self.ownPeer.connect(ownerId, self.dataChannelOptions);
				 
				 // 3. Add callback on connection open
				 self.ownerConnection.on('open', function() {
					 console.log("Connection to owner establiished!");
					 console.log(self.ownerConnection);
					 // Propagate event
					 if(self.onopen){
						 	// TODO transmit real usernames
							var eventData = {username:"Presenter"};
							
							self.onopen(eventData);
					 }
				 });
				 
				 self.ownerConnection.on('data',self._onData);
				 self.ownerConnection.on('close',self._onPeerConnectionClose);
			});
	
		};
		
	};
	
	return connection;
});

