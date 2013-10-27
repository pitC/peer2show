define([ 
	'RTCMulticonnector',
	'socketio'
], function(RTCMultiConnection, io){

	var connection = new RTCMultiConnection();
	connection.session = {
	    audio: false,
	    video: false,
	    data: true,
	    // Screensharing needs https so comment out for now
	    // screen : true 
	};
	var MAX_PARTICIPANTS_ALLOWED = 256;
	var DEFAULT_SESSION_NAME = "Anonymous";
	var DEFAULT_USER_NAME = "Guest";
	var SIGNALING_SERVER = '/';
	
	// connection.setupNewSession
	// connection.onNewSession = function(session) {}
	// connection.join(session)
	// connection.onstream = function(e) {} e.mediaElement
	// connection.onstreamended = function(e) {} e.mediaElement
	// connection.onmessage = function(e) {} e.data, e.userid, e.latency
	// connection.onopen = function()
    // connection.onFileProgress = function(packets, uuid)
	// connection.onFileSent = function(file)
	// connection.onFileReceived = function(fileName)
	// connection.send(data/file)
	
	connection.openSignalingChannel = function(config) {
		console.log("open sginaling channel!"+config.channel+" or "+this.channel+" or "+location.hash.substr(1));
	    var channel = config.channel || this.channel || location.hash.substr(1) || 'RTCMultiConnection-v1.4-Demos';
	    
	    var sender = Math.round(Math.random() * 999999999) + 999999999;
	
	    io.connect(SIGNALING_SERVER).emit('new-channel', {
	        channel: channel,
	        sender: sender
	    });
	
	    var socket = io.connect(SIGNALING_SERVER + channel);
	    socket.channel = channel;
	    socket.on('connect', function() {
	        if (config.callback) config.callback(socket);
	    });
	
	    socket.send = function(message) {
	        socket.emit('message', {
	            sender: sender,
	            data: message
	        });
	    };
	
	    socket.on('message', config.onmessage);
	    return socket;
	};
		
	connection.setupNewSession = function(options) {
		//options.sessionName
		//options.direction
		//options
		var sessionName =  options.sessionName || DEFAULT_SESSION_NAME;
		var maxParticipantsAllowed = options.maxParticipantsAllowed || MAX_PARTICIPANTS_ALLOWED;
	
	    if (options.direction){
		    if (options.direction == 'one-to-one') maxParticipantsAllowed = 1;
		    if (options.direction == 'one-to-many') session.broadcast = true;
		    if (options.direction == 'one-way') session.oneway = true;
		};
	    
	    
	    connection.extra = {
	        'session-name': sessionName,
	        'user-name':options.userName
	    };
	
	    connection.maxParticipantsAllowed = maxParticipantsAllowed;
	    //console.log("Setup new session! "+sessionName);
	    connection.open(sessionName);
	};
	
	connection.testSessionPresence = function(session, callback) {
	    var socket = io.connect('/');

	    socket.on('presence', function(isChannelPresent){
	    	if (callback)
	    		callback(isChannelPresent);
	    });

	    socket.emit('presence', session);
	};
	
	connection.joinOrCreate = function(options){
		var roomName = options.roomName || DEFAULT_SESSION_NAME;
		var userName = options.userName || DEFAULT_USER_NAME;
		connection.testSessionPresence(roomName,function(isPresent){
			if (isPresent){
				console.log("Room exists!");
				
				connection.onNewSession = function(session) {
					console.log("On new session join!");
					connection.extra = {'user-name':userName};
					console.log(session);
					connection.join(session);
				};
				console.log("connecting...");
				connection.connect(roomName);
			}
			else{
				connection.connect(roomName);
				console.log("Create new room");
				connection.setupNewSession({sessionName:roomName,userName:userName});
			};
		});
	};
	
	return connection;
});

