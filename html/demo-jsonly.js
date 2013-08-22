
                // Muaz Khan     - https://github.com/muaz-khan
                // MIT License   - https://www.webrtc-experiment.com/licence/
                // Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection



                var connection = new RTCMultiConnection();
                connection.session = {
                    audio: true,
                    video: true
                };

                connection.openSignalingChannel = function(config) {
                    var channel = config.channel || this.channel || location.hash.substr(1) || 'RTCMultiConnection-v1.4-Demos';
                    var SIGNALING_SERVER = '/';
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

                var roomsList = document.getElementById('rooms-list'), sessions = { };
                connection.onNewSession = function(session) {
                    if (sessions[session.sessionid]) return;
                    sessions[session.sessionid] = session;

                    var tr = document.createElement('tr');
                    tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is an active session.</td>' +
                        '<td><button class="join">Join</button></td>';
                    roomsList.insertBefore(tr, roomsList.firstChild);

                    tr.querySelector('.join').setAttribute('data-sessionid', session.sessionid);
                    tr.querySelector('.join').onclick = function() {
                        this.disabled = true;

                        session = sessions[this.getAttribute('data-sessionid')];
                        if (!session) alert('No room to join.');

                        connection.join(session);
                    };
                };

                var videosContainer = document.getElementById('videos-container') || document.body;
                connection.onstream = function(e) {
                    videosContainer.insertBefore(e.mediaElement, videosContainer.firstChild);
            
                };

                connection.onstreamended = function(e) {
                    if (e.mediaElement.parentNode) {
                        e.mediaElement.parentNode.removeChild(e.mediaElement);
                        
                    }
                };

                var setupNewSession = document.getElementById('setup-new-session');
                var newSessionInputBox = document.getElementById('session-name');

                setupNewSession.onclick = function() {
                    setupNewSession.disabled = true;
                    newSessionInputBox.disabled = true;

                    var direction = document.getElementById('direction').value;
                    
                    
                    /*
                     * Gets value from input box, splits it and creates javascript object
                     * e.g. audio+video -> {audio : true, video : true}
                     */ 
                    var _session = document.getElementById('session').value;
                    var splittedSession = _session.split('+');

                    var session = { };
                    for (var i = 0; i < splittedSession.length; i++) {
                        session[splittedSession[i]] = true;
                    }

                    var maxParticipantsAllowed = 256;

                    if (direction == 'one-to-one') maxParticipantsAllowed = 1;
                    if (direction == 'one-to-many') session.broadcast = true;
                    if (direction == 'one-way') session.oneway = true;

                    var sessionName = document.getElementById('session-name').value;
                    connection.extra = {
                        'session-name': sessionName || 'Anonymous'
                    };

                    connection.session = session;
                    connection.maxParticipantsAllowed = maxParticipantsAllowed;
                    connection.open(newSessionInputBox.value);
                };


                
                connection.onmessage = function(e) {
                    appendDIV(e.data);

                    console.debug(e.userid, 'posted', e.data);
                    console.log('latency:', e.latency, 'ms');
                };

                // on data connection gets open
                connection.onopen = function() {
                    if (document.getElementById('chat-input')) document.getElementById('chat-input').disabled = false;
                    if (document.getElementById('file')) document.getElementById('file').disabled = false;
                    if (document.getElementById('open-new-session')) document.getElementById('open-new-session').disabled = true;
                };

                // sending/receiving file(s)
                // connection.autoSaveToDisk = false;
                connection.onFileProgress = function(packets, uuid) {
                    appendDIV(uuid + ': ' + packets.remaining + '..', 'file', fileProgress);
                };

                connection.onFileSent = function(file) {
                    appendDIV(file.name + ' sent.', fileProgress);
                };

                connection.onFileReceived = function(fileName) {
                    appendDIV(fileName + ' received.', fileProgress);
                };

                document.getElementById('file').onchange = function() {
                    connection.send(this.files[0]);
                };

                var chatOutput = document.getElementById('chat-output'),
                    fileProgress = document.getElementById('file-progress');

                function appendDIV(data, parent) {
                    var div = document.createElement('div');
                    div.innerHTML = data;

                    if (!parent) chatOutput.insertBefore(div, chatOutput.firstChild);
                    else fileProgress.insertBefore(div, fileProgress.firstChild);

                    div.tabIndex = 0;
                    div.focus();

                    chatInput.focus();
                }

                var chatInput = document.getElementById('chat-input');
                chatInput.onkeypress = function(e) {
                    if (e.keyCode !== 13 || !this.value) return;
                    appendDIV(this.value);

                    // sending text message
                    connection.send(this.value);

                    this.value = '';
                    this.focus();
                };

                connection.connect();
            
// https://www.webrtc-experiment.com/RTCMultiConnection-v1.4.js
/*
var connection = new RTCMultiConnection();

// easiest way to customize what you need!
connection.session = {
    audio: true,
    video: true
};

// on getting local or remote media stream
connection.onstream = function(e) {
    document.body.appendChild(e.mediaElement);
};

// remove video if someone leaves
connection.onstreamended = function(e) {
    if(e.mediaElement.parentNode) {
        e.mediaElement.parentNode.removeChild(e.mediaElement);
    }
};

// check existing sessions
connection.connect();

// open new session
document.getElementById('open-new-session').onclick = function() {
    connection.open();
};
*/
