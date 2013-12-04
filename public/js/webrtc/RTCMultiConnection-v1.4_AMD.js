// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection
// =======================
// RTCMultiConnection-v1.4
define(
		[ 'webrtc/RTCPeerConnection', 'webrtc/RTCMultiSession',
				'webrtc/FileReceiver', 'webrtc/FileSender',
				'webrtc/TextReceiver', 'webrtc/TextSender',
				'webrtc/FileConverter', 'webrtc/FileSaver'

		],
		function(RTCPeerConnection, RTCMultiSession, FileReceiver, FileSender,
				TextReceiver, TextSender, FileConverter, FileSaver) {
			var RTCMultiConnection = function(channel) {
				this.channel = channel
						|| location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

				this.open = function(_channel) {
					self.joinedARoom = true;

					if (_channel)
						self.channel = _channel;

					// if firebase && if session initiator
					if (self.socket && self.socket.onDisconnect)
						self.socket.onDisconnect().remove();

					self.isInitiator = true;

					init();
					captureUserMedia(self.rtcSession.initSession);

				};

				// check pre-opened connections
				this.connect = function(_channel) {
					if (_channel)
						self.channel = _channel;

					init();
				};

				// join a session
				this.join = joinSession;
				this.config = null;
				var self = this;

				this.token = function() {
					return (Math.random() * new Date().getTime()).toString(36)
							.replace(/\./g, '');
				};

				this.openSignalingChannel = function() {
					console.log("Open signalling channel!");
				}; // must be overriden
				
				this.rtcSession = null;
				console.log("Create file/text senders/receivers");
				fileReceiver = new FileReceiver();
				textReceiver = new TextReceiver();
				fileSender = new FileSender();
				textSender = new TextSender();

				// send file/data or /text
				this.send = function(data, fileId, _channel) {
					if (!data)
						throw 'No file, data or text message to share.';

					if (data.size) {
						console.log("WebRTC send:" + fileId);
						fileSender.send({
							file : data,
							fileId : fileId,
							channel : self.rtcSession,
							onFileSent : self.onFileSent,
							onFileProgress : self.onFileProgress,
							_channel : _channel
						});
					} else
						textSender.send({
							text : data,
							channel : self.rtcSession,
							_channel : _channel
						});
				};

				this.createMediaElement = function(session, stream) {
					return getMediaElement(stream, session);
				};

				// set config passed over RTCMultiSession

				function init() {
					if (self.config)
						return;
					console.log("Create rtc session object");
					self.rtcSession = new RTCMultiSession(self);
					self.config = {
						onNewSession : function(session) {
							if (self.channel !== session.sessionid)
								return false;

							if (!self.rtcSession) {
								self._session = session;
								return;
							}

							if (self.onNewSession)
								return self.onNewSession(session);

							if (self.joinedARoom)
								return false;
							self.joinedARoom = true;

							return joinSession(session);
						},
						onmessage : function(e) {
							if (!e.data.size)
								e.data = JSON.parse(e.data);

							if (e.data.type === 'text')
								textReceiver.receive(e.data, self.onmessage,
										e.userid, e.extra);

							else if (e.data.size || e.data.type === 'file')
								fileReceiver.receive(e.data, self);
							else
								self.onmessage(e);
						}
					};

					if (self._session)
						self.config.onNewSession(self._session);
				}

				function joinSession(session) {
					if (!session || !session.userid || !session.sessionid)
						throw 'invalid data passed.';

					self.session = session.session;

					extra = self.extra || session.extra || {};

					if (session.oneway || session.data)
						self.rtcSession.joinSession(session, extra);
					else
						captureUserMedia(function() {
							self.rtcSession.joinSession(session, extra);
						});
				}

				// capture user's media resources

				function captureUserMedia(callback, _session) {
					var session = _session || self.session;

					if (self.dontAttachStream)
						return callback();

					if (isData(session)
							|| (!self.isInitiator && session.oneway)) {
						self.attachStreams = [];
						return callback();
					}

					var constraints = {
						audio : !!session.audio,
						video : !!session.video
					};
					var screen_constraints = {
						audio : false,
						video : {
							mandatory : {
								chromeMediaSource : 'screen'
							},
							optional : []
						}
					};

					if (session.screen) {
						_captureUserMedia(screen_constraints, constraints.audio
								|| constraints.video ? function() {
							_captureUserMedia(constraints, callback);
						} : callback);
					} else
						_captureUserMedia(constraints, callback, session.audio
								&& !session.video);

					function _captureUserMedia(forcedConstraints,
							forcedCallback, isRemoveVideoTracks) {
						var mediaConfig = {
							onsuccess : function(stream, returnBack) {
								if (returnBack)
									return forcedCallback
											&& forcedCallback(stream);

								if (isRemoveVideoTracks && !moz) {
									stream = new window.webkitMediaStream(
											stream.getAudioTracks());
								}

								var mediaElement = getMediaElement(stream,
										session);
								mediaElement.muted = true;

								stream.onended = function() {
									if (self.onstreamended)
										self.onstreamended(streamedObject);
								};

								self.attachStreams.push(stream);

								var streamedObject = {
									stream : stream,
									streamid : stream.label,
									mediaElement : mediaElement,
									blobURL : mediaElement.mozSrcObject
											|| mediaElement.src,
									type : 'local',
									userid : self.userid || 'self',
									extra : self.extra
								};

								self.onstream(streamedObject);

								self.streams[stream.label] = self._getStream({
									stream : stream,
									userid : self.userid,
									type : 'local'
								});

								if (forcedCallback)
									forcedCallback(stream);
							},
							onerror : function() {
								if (session.audio && !session.video)
									throw 'Microphone access is denied.';
								else if (session.screen) {
									if (location.protocol === 'http:')
										throw '<https> is mandatory to capture screen.';
									else
										throw 'Multi-capturing of screen is not allowed. Capturing process is denied. Are you enabled flag: "Enable screen capture support in getUserMedia"?';
								} else
									throw 'Webcam access is denied.';
							},
							mediaConstraints : self.mediaConstraints || {}
						};

						mediaConfig.constraints = forcedConstraints
								|| constraints;
						getUserMedia(mediaConfig);
					}
				}

				this.captureUserMedia = captureUserMedia;

				// eject a user; or leave the session
				this.leave = this.eject = function(userid) {
					self.rtcSession.leave(userid);

					if (!userid) {
						var streams = self.attachStreams;
						for ( var i = 0; i < streams.length; i++) {
							streams[i].stop();
						}
						currentUserMediaRequest.streams = [];
						self.attachStreams = [];
					}

					// if firebase; remove data from firebase servers
					if (self.isInitiator && !!self.socket
							&& !!self.socket.remove) {
						self.socket.remove();
					}
				};

				// close entire session
				this.close = function() {
					self.autoCloseEntireSession = true;
					self.rtcSession.leave();
				};

				// renegotiate new media stream
				this.addStream = function(session, socket) {
					captureUserMedia(function(stream) {
						self.rtcSession.addStream({
							stream : stream,
							renegotiate : session,
							socket : socket
						});
					}, session);
				};

				// detach pre-attached streams
				this.removeStream = function(streamid) {
					if (!this.streams[streamid])
						return console.warn(
								'No such stream exists. Stream-id:', streamid);
					this.detachStreams.push(streamid);
				};

				// set RTCMultiConnection defaults on constructor invocation
				this.setDefaults();
			};

			function getRandomString() {
				return (Math.random() * new Date().getTime()).toString(36)
						.toUpperCase().replace(/\./g, '-');
			}

			window.MediaStream = window.MediaStream || window.webkitMediaStream;

			window.moz = !!navigator.mozGetUserMedia;

			var video_constraints = {
				mandatory : {},
				optional : []
			};

			/* by @FreCap pull request #41 */
			var currentUserMediaRequest = {
				streams : [],
				mutex : false,
				queueRequests : []
			};

			function getUserMedia(options) {
				if (currentUserMediaRequest.mutex === true) {
					currentUserMediaRequest.queueRequests.push(options);
					return;
				}
				currentUserMediaRequest.mutex = true;

				// http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
				var mediaConstraints = options.mediaConstraints || {};
				var n = navigator, resourcesNeeded = options.constraints || {
					audio : true,
					video : video_constraints
				};

				if (resourcesNeeded.video == true)
					resourcesNeeded.video = video_constraints;

				// connection.mediaConstraints.audio = false;
				if (typeof mediaConstraints.audio != 'undefined')
					resourcesNeeded.audio = mediaConstraints.audio;

				// connection.mediaConstraints.mandatory = {minFrameRate:10}
				if (mediaConstraints.mandatory)
					resourcesNeeded.video.mandatory = merge(
							resourcesNeeded.video.mandatory,
							mediaConstraints.mandatory);

				// mediaConstraints.optional.bandwidth = 1638400;
				if (mediaConstraints.optional)
					resourcesNeeded.video.optional[0] = merge({},
							mediaConstraints.optional);

				log('get-user-media:', JSON.stringify(resourcesNeeded, null,
						'\t'));

				// easy way to match
				var idInstance = JSON.stringify(resourcesNeeded);

				function streaming(stream, returnBack) {
					var video = options.video;
					if (video) {
						video[moz ? 'mozSrcObject' : 'src'] = moz ? stream
								: window.webkitURL.createObjectURL(stream);
						video.play();
					}

					options.onsuccess(stream, returnBack);
					currentUserMediaRequest.streams[idInstance] = stream;
					currentUserMediaRequest.mutex = false;
					if (currentUserMediaRequest.queueRequests.length)
						getUserMedia(currentUserMediaRequest.queueRequests
								.shift());
				}

				if (currentUserMediaRequest.streams[idInstance]) {
					streaming(currentUserMediaRequest.streams[idInstance], true);
				} else {
					n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
					n.getMedia(resourcesNeeded, streaming, options.onerror
							|| function(e) {
								console.error(e);
							});
				}
			}

			function isData(session) {
				return !session.audio && !session.video && !session.screen
						&& session.data;
			}

			function swap(arr) {
				var swapped = [], length = arr.length;
				for ( var i = 0; i < length; i++)
					if (arr[i] && arr[i] !== true)
						swapped.push(arr[i]);
				return swapped;
			}

			function log(a, b, c, d, e, f) {
				if (window.skipRTCMultiConnectionLogs)
					return;
				if (f)
					console.log(a, b, c, d, e, f);
				else if (e)
					console.log(a, b, c, d, e);
				else if (d)
					console.log(a, b, c, d);
				else if (c)
					console.log(a, b, c);
				else if (b)
					console.log(a, b);
				else if (a)
					console.log(a);
			}

			RTCMultiConnection.prototype.setDefaults = DefaultSettings;

			function DefaultSettings() {
				this.onmessage = function(e) {
					log(e.userid, 'posted', e.data);
				};

				this.onopen = function(e) {
					log('Data connection is opened between you and', e.userid);
				};

				this.onerror = function(e) {
					console.error('Error in data connection between you and',
							e.userid, e);
				};

				this.onclose = function(e) {
					console.warn('Data connection between you and', e.userid,
							'is closed.', e);
				};

				this.onFileReceived = function(fileName) {
					log('File <', fileName, '> received successfully.');
				};

				this.onFileSent = function(file) {
					log('File <', file.name, '> sent successfully.');
				};

				this.onFileProgress = function(packets) {
					log('<', packets.remaining, '> items remaining.');
				};

				this.onstream = function(e) {
					log('on:add:stream', e.stream);
				};

				this.onleave = function(e) {
					log(e.userid, 'left!');
				};

				this.onstreamended = function(e) {
					log('on:stream:ended', e.stream);
				};

				this.peers = {};

				this.streams = {
					mute : function(session) {
						this._private(session, true);
					},
					unmute : function(session) {
						this._private(session, false);
					},
					_private : function(session, enabled) {
						// implementation from #68
						for ( var stream in this) {
							if (stream != 'mute' && stream != 'unmute'
									&& stream != '_private') {
								var root = this[stream];
								muteOrUnmute({
									root : root,
									session : session,
									stream : root.stream,
									enabled : enabled
								});
							}
						}
					}
				};
				this.channels = {};
				this.extra = {};

				this.session = {
					audio : true,
					video : true,
					data : true
				};

				this.bandwidth = {
					audio : 50,
					video : 256,
					data : 1638400
				};

				this.mediaConstraints = {};
				this.sdpConstraints = {};

				this.attachStreams = [];
				this.detachStreams = [];

				this.maxParticipantsAllowed = 256;
				this.autoSaveToDisk = true;

				this._getStream = function(e) {
					return {
						stream : e.stream,
						userid : e.userid,
						socket : e.socket,
						type : e.type,
						stop : function() {
							var stream = this.stream;
							if (stream && stream.stop)
								stream.stop();
						},
						mute : function(session) {
							this._private(session, true);
						},
						unmute : function(session) {
							this._private(session, false);
						},
						_private : function(session, enabled) {
							muteOrUnmute({
								root : this,
								session : session,
								enabled : enabled,
								stream : this.stream
							});
						}
					};
				};

			}

			function muteOrUnmute(e) {
				var stream = e.stream, root = e.root, session = e.session || {}, enabled = e.enabled;

				if (!session.audio && !session.video) {
					session = merge(session, {
						audio : true,
						video : true
					});
				}

				// implementation from #68
				if (session.type) {
					if (session.type == 'remote' && root.type != 'remote')
						return;
					if (session.type == 'local' && root.type != 'local')
						return;
				}

				log('session', JSON.stringify(session, null, '\t'));

				// enable/disable audio/video tracks

				if (session.audio) {
					var audioTracks = stream.getAudioTracks()[0];
					if (audioTracks)
						audioTracks.enabled = !enabled;
				}

				if (session.video) {
					var videoTracks = stream.getVideoTracks()[0];
					if (videoTracks)
						videoTracks.enabled = !enabled;
				}

				// socket message to change media element look
				if (root.socket)
					root.socket.send({
						userid : root.userid,
						mute : !!enabled,
						unmute : !enabled
					});
			}

			// Get HTMLAudioElement/HTMLVideoElement accordingly

			function getMediaElement(stream, session) {
				var isAudio = session.audio && !session.video
						&& !session.screen;
				if (!moz && stream.getAudioTracks && stream.getVideoTracks) {
					isAudio = stream.getAudioTracks().length
							&& !stream.getVideoTracks().length;
				}

				var mediaElement = document.createElement(isAudio ? 'audio'
						: 'video');
				mediaElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream
						: window.webkitURL.createObjectURL(stream);
				mediaElement.autoplay = true;
				mediaElement.controls = true;
				mediaElement.volume = 0;
				mediaElement.play();
				return mediaElement;
			}

			function merge(mergein, mergeto) {
				for ( var item in mergeto) {
					mergein[item] = mergeto[item];
				}
				return mergein;
			}

			return RTCMultiConnection;
		});
