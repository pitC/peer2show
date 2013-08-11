'use strict';

function WebRTCClient(roomId){

	
	var that = this;
	var room = roomId;
	var localVideo = null;
	var remoteVideo = null;
	
	var dataChannel = null;

		
	var isChannelReady = false;
	var isInitiator = false;
	var isStarted = false;
	var localStream, remoteStream;
	var pc = null;
	
	var pc_config,pc_constraints,sdpConstraints;
	var socket = null;
	
	var DEFAULT_CONSTRAINTS = {video:true, audio:true};
	var TURN_SERVER = 'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913';
	
	initConnectionConfig();
	initSocket();
	
	window.onbeforeunload = function(e){
		sendMessage('bye');
	};
	
	// callbacks
	this.onDataChStateChangeCb = null;
	this.onDataRcvCb = null;
	
	function launchCallback(callback, event){
		var ev = event || null;
		if (callback != null){
			callback(ev);
		}
	}
	
	
	function initConnectionConfig(){
	
	
		pc_config = webrtcDetectedBrowser === 'firefox' ?
		  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
		  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
		
		pc_constraints = {
		  'optional': [
		    //{'DtlsSrtpKeyAgreement': true},
		    {'RtpDataChannels': true}
		  ]};
		
		// Set up audio and video regardless of what devices are present.
		sdpConstraints = {'mandatory': {
		  'OfferToReceiveAudio':true,
		  'OfferToReceiveVideo':true }};
	}
	/////////////////////////////////////////////
	
	function initSocket(){
		socket = io.connect();
		
		
		
		console.log(room);
		
		if (room !== '') {
		  console.log('Create or join room', room);
		  socket.emit('create or join', room);
		}
		
		socket.on('created', function (room){
		  console.log('Created room ' + room);
		  isInitiator = true;
		});
		
		socket.on('full', function (room){
		  console.log('Room ' + room + ' is full');
		});
		
		socket.on('join', function (room){
		  console.log('Another peer made a request to join room ' + room);
		  console.log('This peer is the initiator of room ' + room + '!');
		  isChannelReady = true;
		});
		
		socket.on('joined', function (room){
		  console.log('This peer has joined room ' + room);
		  isChannelReady = true;
		});
		
		socket.on('log', function (array){
		  console.log.apply(console, array);
		});
		
		socket.on('message', function (message){
			  console.log('Received message:', message);
			  if (message === 'got user media' || message === 'start data') {
			  	maybeStart();
			  } else if (message.type === 'offer') {
			    if (!isInitiator && !isStarted) {
			      maybeStart();
			    }
			    pc.setRemoteDescription(new RTCSessionDescription(message));
			    doAnswer();
			  } else if (message.type === 'answer' && isStarted) {
			    pc.setRemoteDescription(new RTCSessionDescription(message));
			  } else if (message.type === 'candidate' && isStarted) {
			    var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
			      candidate:message.candidate});
			    pc.addIceCandidate(candidate);
			  } else if (message === 'bye' && isStarted) {
			    handleRemoteHangup();
			  }
		});
	}
	
	////////////////////////////////////////////////
	
	function sendMessage(message){
		console.log('Sending message: ', message);
	  socket.emit('message', message);
	}
	
	
	
	
	
	function handleUserMedia(stream) {
	  localStream = stream;
	  attachMediaStream(localVideo, stream);
	  console.log('Adding local stream.');
	  sendMessage('got user media');
	  if (isInitiator) {
	    maybeStart();
	  }
	}
	
	function handleUserMediaError(error){
	  console.log('navigator.getUserMedia error: ', error);
	}
	
	
	
	
	this.startUserMedia = function(constraints, localVideoContainer, remoteVideoContainer){
		var finalConstraints = constraints || DEFAULT_CONSTRAINTS;
		
		localVideo = localVideoContainer;
		remoteVideo = remoteVideoContainer;
		
		getUserMedia(finalConstraints, handleUserMedia, handleUserMediaError);
		console.log('Getting user media with constraints', constraints);
		
		requestTurn(TURN_SERVER);
		
	};
	
	this.startData = function(){
			  
		  sendMessage('start data');
		  if (isInitiator) {
		    maybeStart();
		  }
		
		  requestTurn(TURN_SERVER);
		
	};
	
	
	function maybeStart() {
	  if (!isStarted && isChannelReady) {
	    createPeerConnection();
	    if (localStream){
	    	pc.addStream(localStream);
	    }
	    isStarted = true;
	    if (isInitiator) {
	      doCall();
	    }
	  }
	}
	
	
	
	/////////////////////////////////////////////////////////
	
	function createPeerConnection() {
	  try {
	    pc = new RTCPeerConnection(pc_config, pc_constraints);
	    pc.onicecandidate = handleIceCandidate;
	    console.log('Created RTCPeerConnnection with:\n' +
	      '  config: \'' + JSON.stringify(pc_config) + '\';\n' +
	      '  constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
	  } catch (e) {
	    console.log('Failed to create PeerConnection, exception: ' + e.message);
	    alert('Cannot create RTCPeerConnection object.');
	      return;
	  }
	  pc.onaddstream = handleRemoteStreamAdded;
	  pc.onremovestream = handleRemoteStreamRemoved;
	
	  if (isInitiator){
	    try {
	      // Reliable Data Channels not yet supported in Chrome
	      dataChannel = pc.createDataChannel("sendDataChannel",
	        {reliable: false});
	      console.log('Created send data channel');
	    } catch (e) {
	      alert('Failed to create data channel. ' +
	            'You need Chrome M25 or later with RtpDataChannel enabled');
	      console.log('createDataChannel() failed with exception: ' + e.message);
	    }
	    attachDataEvents();
	  }
	  else{
	    pc.ondatachannel = gotDataChannel;
	  }
	}
	
	this.sendData = function (data) {
	  if (isChannelReady && dataChannel != null){
		  dataChannel.send(data);
		  console.log('Sent data: ' + data);
	  }
	  else{
		  console.log('Data not sent!' + data);
	  }
	};
	
	
	function handleMessage(event) {
	  console.log('Received message: ' + event.data);
	  launchCallback(that.onDataRcvCb, event.data);
	}
	
	function attachDataEvents(){
		dataChannel.onmessage = handleMessage;
		dataChannel.onopen = handleDataChannelStateChange;
		dataChannel.onclose = handleDataChannelStateChange;
	}
	
	function gotDataChannel(event){
		dataChannel = event.channel;
		attachDataEvents();
	}
	
	function handleDataChannelStateChange(){
		var readyState = dataChannel.readyState;
		console.log('Data channel state is: ' + readyState);
		launchCallback(that.onDataChStateChangeCb, readyState);
	}
	
	function handleIceCandidate(event) {
	  console.log('handleIceCandidate event: ', event);
	  if (event.candidate) {
	    sendMessage({
	      type: 'candidate',
	      label: event.candidate.sdpMLineIndex,
	      id: event.candidate.sdpMid,
	      candidate: event.candidate.candidate});
	  } else {
	    console.log('End of candidates.');
	  }
	}
	
	function handleRemoteStreamAdded(event) {
	  console.log('Remote stream added.');
	  attachMediaStream(remoteVideo, event.stream);
	  remoteStream = event.stream;
	}
	
	function doCall() {
	 // var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
		var constraints = {'optional':[],'mandatory':{}};
	  // temporary measure to remove Moz* constraints in Chrome
	  if (webrtcDetectedBrowser === 'chrome') {
	    for (var prop in constraints.mandatory) {
	      if (prop.indexOf('Moz') !== -1) {
	        delete constraints.mandatory[prop];
	      }
	     }
	   }
	  constraints = mergeConstraints(constraints, sdpConstraints);
	  console.log('Sending offer to peer, with constraints: \n' +
	    '  \'' + JSON.stringify(constraints) + '\'.');
	  pc.createOffer(setLocalAndSendMessage, null, constraints);
	}
	
	function doAnswer() {
	  console.log('Sending answer to peer.');
	  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
	}
	
	function mergeConstraints(cons1, cons2) {
	  var merged = cons1;
	  for (var name in cons2.mandatory) {
	    merged.mandatory[name] = cons2.mandatory[name];
	  }
	  merged.optional.concat(cons2.optional);
	  return merged;
	}
	
	function setLocalAndSendMessage(sessionDescription) {
	  // Set Opus as the preferred codec in SDP if Opus is present.
	  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
	  pc.setLocalDescription(sessionDescription);
	  sendMessage(sessionDescription);
	}
	
	function requestTurn(turn_url) {
	  var turnExists = false;
	  for (var i in pc_config.iceServers) {
	    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
	      turnExists = true;
	      break;
	    }
	  }
	  if (!turnExists) {
	    console.log('Getting TURN server from ', turn_url);
	    // No TURN server. Get one from computeengineondemand.appspot.com:
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function(){
	      if (xhr.readyState === 4 && xhr.status === 200) {
	        var turnServer = JSON.parse(xhr.responseText);
	      	console.log('Got TURN server: ', turnServer);
	        pc_config.iceServers.push({
	          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
	          'credential': turnServer.password
	        });
	  
	      }
	    };
	    xhr.open('GET', turn_url, true);
	    xhr.send();
	  }
	}
	
	function handleRemoteStreamAdded(event) {
	  console.log('Remote stream added.');
	  attachMediaStream(remoteVideo, event.stream);
	  remoteStream = event.stream;
	}
	function handleRemoteStreamRemoved(event) {
	  console.log('Remote stream removed. Event: ', event);
	}
	
	this.hangup = function() {
	  console.log('Hanging up.');
	  stop();
	  sendMessage('bye');
	}
	
	function handleRemoteHangup() {
	  console.log('Session terminated.');
	  stop();
	  isInitiator = false;
	}
	
	function stop() {
	  isStarted = false;
	  // isAudioMuted = false;
	  // isVideoMuted = false;
	  pc.close();
	  pc = null;
	}
	
	///////////////////////////////////////////
	
	// Set Opus as the default audio codec if it's present.
	function preferOpus(sdp) {
	  var sdpLines = sdp.split('\r\n');
	  var mLineIndex;
	  // Search for m line.
	  for (var i = 0; i < sdpLines.length; i++) {
	      if (sdpLines[i].search('m=audio') !== -1) {
	        mLineIndex = i;
	        break;
	      }
	  }
	  if (mLineIndex === null) {
	    return sdp;
	  }
	
	  // If Opus is available, set it as the default in m line.
	  for (i = 0; i < sdpLines.length; i++) {
	    if (sdpLines[i].search('opus/48000') !== -1) {
	      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
	      if (opusPayload) {
	        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
	      }
	      break;
	    }
	  }
	
	  // Remove CN in m line and sdp.
	  sdpLines = removeCN(sdpLines, mLineIndex);
	
	  sdp = sdpLines.join('\r\n');
	  return sdp;
	}
	
	function extractSdp(sdpLine, pattern) {
	  var result = sdpLine.match(pattern);
	  return result && result.length === 2 ? result[1] : null;
	}
	
	// Set the selected codec to the first in m line.
	function setDefaultCodec(mLine, payload) {
	  var elements = mLine.split(' ');
	  var newLine = [];
	  var index = 0;
	  for (var i = 0; i < elements.length; i++) {
	    if (index === 3) { // Format of media starts from the fourth.
	      newLine[index++] = payload; // Put target payload to the first.
	    }
	    if (elements[i] !== payload) {
	      newLine[index++] = elements[i];
	    }
	  }
	  return newLine.join(' ');
	}
	
	// Strip CN from sdp before CN constraints is ready.
	function removeCN(sdpLines, mLineIndex) {
	  var mLineElements = sdpLines[mLineIndex].split(' ');
	  // Scan from end for the convenience of removing an item.
	  for (var i = sdpLines.length-1; i >= 0; i--) {
	    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
	    if (payload) {
	      var cnPos = mLineElements.indexOf(payload);
	      if (cnPos !== -1) {
	        // Remove CN payload from m line.
	        mLineElements.splice(cnPos, 1);
	      }
	      // Remove CN line in sdp
	      sdpLines.splice(i, 1);
	    }
	  }
	
	  sdpLines[mLineIndex] = mLineElements.join(' ');
	  return sdpLines;
	}

}