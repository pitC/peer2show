define([ 
	'peerjs',
	'socketio',
	'webrtc/roomStatus'
], function(PeerJS, io, RoomStatus){

	var connection = function(){
		this.peerId = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
		this.peerJSOptions = {
			key: '7673s5yzjupzxgvi',
			debug: 3 // all logs
			// host - for now use peer.js host
			// port
		};
		
		this.peer = null;
		
		this.ownerConnection = null;
		this.peerConnections = [];
		
		var self = this;
		
		this.onConnection = function(conn) {
			console.log("Peer connection!");
			console.log(conn);
			self.peerConnections.push(conn);
		};

		this.create = function(options,callback, caller){
			console.log("Create!");
			
			this.peer = new Peer(this.peerId,this.peerJSOptions);
			
			this.peer.on('connection',this.onConnection);
			this.peer.on('open', function(id) {
				  console.log('My peer ID is: ' + id);
				  this.peerId = id;
				  if (callback){
						callback(caller,RoomStatus.NEW_ROOM);
				  }
			});
		};
		
		this.join = function(options,callback,caller){
			console.log("Join!");
			this.peer = new Peer(this.peerJSOptions);
			var self = this;
			
			this.peer.on('open', function(id) {
				// on connection to broker
				// 1. set ID
				  console.log('My peer ID is: ' + id);
				  this.peerId = id;
				  if (callback){
						callback(caller,RoomStatus.JOINING);
				 }
				
				 // 2. create peer connection to owner
				 var ownerId = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
				 self.ownerConnection = self.peer.connect(ownerId);
				 
				 self.ownerConnection.on('open', function() {
					 console.log("Connection to owner establiished!");
				 });
			});
	
		};
		
//		this.webRTCClient.onopen;
//		this.webRTCClient.onend;
		
	};
	
	return connection;
});

