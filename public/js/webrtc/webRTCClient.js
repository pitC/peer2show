define([ 
	'peerjs',
	'webrtc/roomStatus'
], function(PeerJS, RoomStatus,SyncMonitor){

	var webrtcClient = function(){
		
		this.syncMonitor = null;
		
		this.ownerPeerId = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
		this.ownUsername = "?";
		
		this.peerJSOptions = {
			// Cloud peerjs
			key: '7673s5yzjupzxgvi',
			debug: 3, // all logs
			// Local server
//			host: 'localhost', 
//			port: 9000,
			// Own server on Heroku
			host:'peershowserver.herokuapp.com',
			secure:true, 
			port:443,
			key:'peerjs',
			path: '/',
			config: {'iceServers': [
			                        { url: 'stun:stun.l.google.com:19302' },
			                        // for firefox do not use notation username@hostname! 
			                        // Use username as separate attribute instead
			                        { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo'  }
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
		
		this.onOwnerClose;
		
		this.onrpc;
		this.onfile;
		this.onmessage;
		this.onTransferFinish;
		
		this.onerror;
		
		
		
		this.rpc = function(funcName, parameters){
			var obj = new Object();
			obj.remoteCall = funcName;
			obj.parameters = parameters || {};
			var json = JSON.stringify(obj);
			this.send(json);
		};
		
		this.sendFile = function(file,metadata, destPeer){
			var data =metadata || {};
			data.file = file;
			if (this.syncMonitor){
				data.actionId = this.syncMonitor.produceActionId();
			}
			this.send(data, destPeer);
		};
		
		this.sendMessage = function(message, metadata, destPeer){
			var data = metadata || {};
			data.message = message;
			data.sender = this.ownUsername;
			var json = JSON.stringify(data);
			this.send(json, destPeer);
		};
		
		this.send = function(data, destPeer){
			console.log("Send data");
			console.log(data);
			
			if (destPeer){
				console.log("Unicast!");
				console.log(destPeer);
				var peerConnection;
				
				if(destPeer == self.ownerPeerId){
					peerConnection = self.ownerConnection;
				}
				else{
					
					peerConnection = self.peerConnections[destPeer];
					
				}
				if (peerConnection){
					console.log("Peer found, send now!");
					if (data.actionId != null){
						this.syncMonitor.incrCounter(destPeer,data.actionId);
					}
					peerConnection.send(data);
				}
			}
			else{
				for (var peerId in self.peerConnections){
					console.log("Send to "+peerId);
					var peerConnection= self.peerConnections[peerId];
					if (data.actionId != null){
						this.syncMonitor.incrCounter(peerId,data.actionId);
					}
					peerConnection.send(data);
				}
				if (this.ownerConnection){
					console.log("Send to session owner");
					if (data.actionId != null){
						this.syncMonitor.incrCounter(this.ownerPeerId,data.actionId);
					}
					this.ownerConnection.send(data);
				}
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
		
		this._confirmReception = function(peerConnection,actionId){
			var data = {confirm:actionId};
			var json = JSON.stringify(data);
			console.log(">> Confirm reception!");
			console.log(data);
			peerConnection.send(json);
		},
		
		this._onData = function(data){
			console.log("Received data!");
			console.log(data);
			console.log(this);
			// if actionId exists, send confirmation
			if (data.actionId != null){
				self._confirmReception(this,data.actionId);
			}
			
			if (data.file != null){
				  var file = data.file;
				  delete data.file;
				  var metadata = data;
				  if (metadata.src === 'local'){
					  self._handleFile(file, metadata);
				  }
				  else if (metadata.src === 'web'){
					  self._handleWebUrl(file, metadata);
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
				else if (finalMsg.message){
					if(self.onmessage){
						var message = finalMsg.message;
						delete finalMsg.file;
						var metadata = finalMsg;
						
						self.onmessage(message,metadata);
					}
				}
				// internal
				else{
					console.log("Internal!");
					console.log(finalMsg);
					self._handleInternalData(finalMsg,this);
				}
			}
		};
		
		this._handleFile = function(file,metadata){
			var dataView = new Uint8Array(file);
		    var dataBlob = new Blob([dataView]);
		    var url = window.URL.createObjectURL(dataBlob);
		    console.log(url);
		    if(self.onfile){
		    	self.onfile(url,metadata);
		    }
		};
		
		this._handleWebUrl = function(url,metadata){
		    console.log(url);
		    if(self.onfile){
		    	self.onfile(url,metadata);
		    }
		};
		
		this._handleInternalData = function(data,sender){
			if (data.confirm){
				console.log("!! CONFIRM !!");
//				console.log(sender);
				if (this.syncMonitor){
					this.syncMonitor.decrCounter(sender.peer,data.confirm);
				}
			}
			else if (data.peers){
				for (var index in data.peers){
					var peer = data.peers[index];
					// for now peer == peerId, later also name 
					var peerId = peer.peerId;
					var peerName = peer.peerName;
					console.log("Open connection to "+peerId);
					this.joinOtherPeer(peerId,peerName);
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
				var eventData = {
						username:conn.metadata.username||"Guest",
						peerId: conn.peer
				};
				self.onopen(eventData);
			};
		};
		
		this._onPeerConnectionClose = function(){
			console.log("peer connection close!");
			console.log(this);
			
			// remove peer from associated array
			delete self.peerConnections[this.peer];
			self.syncMonitor.removePeer(this.peer);
			// propagate event
			if(self.onclose){
				var eventData = {username:this.metadata.username};
				self.onclose(eventData);
			}
		};
		
		this._onOwnerConnectionClose = function(){
			// remove peer from associated array
			delete self.peerConnections[this.peer];
			if (self.onOwnerClose){
				var eventData = {};
				self.onOwnerClose(eventData);
			}
		};
		
		// function to propagate 
		this.sendOtherPeers = function(destPeer){
			if (this._isOwner()){
				var peers = [];
				for (var peerId in this.peerConnections){
					console.log("Send to "+peerId);
					if (peerId != destPeer){
						var peerConnection= self.peerConnections[peerId];
						var peername = peerConnection.metadata.username;
						peers.push({peerId:peerId,peerName:peername});
					}	
				}
				var data = {peers:peers};
				var json = JSON.stringify(data);
				this.send(json, destPeer);
			}
		};
		// TODO:refactor
		this.joinOtherPeer = function(peerId, peerName){
			 var newPeerConnection = this.ownPeer.connect(peerId, this.dataChannelOptions);
			 var self = this;
			 newPeerConnection.on('data',this._onData);
			 newPeerConnection.on('close',this._onPeerConnectionClose);
			 
			 // 3. Add callback on connection open
			 newPeerConnection.on('open', function() {
				 console.log("Connection to peer establiished!");
				 console.log(self.newPeerConnection);
				 // Propagate event
				 if(self.onopen){
					 	// TODO transmit real usernames
						var eventData = {username:peerName||"Peer"};
						// Add peer to associated array
						self.peerConnections[peerId] = newPeerConnection;
						self.onopen(eventData);
				 }
			 });
		};
		
		this.setIceConfig = function(){

			// This object will take in an array of STUN / TURN servers
			// and override the original config object
			var customConfig;
			var self = this;
			// Call XirSys ICE servers
			$.ajax({
			  type: "POST",
			  dataType: "json",
			  url: "/ice",
			  success: function (data, status) {
				customConfig = data;
			    console.log("ICE obtained!");
			    console.log(customConfig);
			    self.peerJSOptions.config = customConfig;
			  },
			  async: false
			});
		};

		this.create = function(options,callback, caller){
			console.log("Create!");
			this.setIceConfig();
			this.ownUsername = options.username;
			
			this.ownPeer = new Peer(this.ownerPeerId,this.peerJSOptions);
			
			this.ownPeer.on('error',this.onerror);
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
			this.setIceConfig();
			this.ownPeer = new Peer(this.peerJSOptions);
			var self = this;
			
			var metadata = {username:options.username};
			this.ownUsername = options.username;
			this.dataChannelOptions.metadata = metadata;
			
			this.ownPeer.on('error',this.onerror);
			this.ownPeer.on('connection',this._onPeerConnection);
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
				 
				 self.ownerConnection.on('data',self._onData);
				 self.ownerConnection.on('close',self._onOwnerConnectionClose);
				 
				 // 3. Add callback on connection open
				 self.ownerConnection.on('open', function() {
					 console.log("Connection to owner establiished!");
					 console.log(self.ownerConnection);
					 // Propagate event
					 if(self.onopen){
						 	// TODO transmit real username
							var eventData = {username:"Host"};
							
							self.onopen(eventData);
					 }
				 });
				 
				 
			});
	
		};
		
		this.close = function(callback){
			if (this.ownerConnection != null){
				this.ownerConnection.close();
			}
			for (var peerId in self.peerConnections){
				console.log("Send to "+peerId);
				var peerConnection= self.peerConnections[peerId];
				peerConnection.close();
			}
			this.ownPeer.disconnect();
			// for now empty event object
			var ev = {};
			if (callback){
				callback(ev);
			}
		};
				
	};
	
	return webrtcClient;
});

