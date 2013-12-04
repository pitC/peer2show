define(
		[ 'webrtc/WebrtcUtils' ],
		function(WebrtcUtils) {
			var RTCMultiSession = function(root) {
				this.config = root.config;
				var session = root.session;

				var self = {};
				var socketObjects = {};
				var sockets = [];

				self.userid = root.userid = root.userid || root.token();
				self.sessionid = root.channel;

				console.log("User id: " + self.userid);
				var participants = {}, isbroadcaster, isAcceptNewSession = true;

				function newPrivateSocket(_config) {
					var socketConfig = {
						channel : _config.channel,
						onmessage : socketResponse,
						onopen : function() {
							if (isofferer && !peer)
								initPeer();

							_config.socketIndex = socket.index = sockets.length;
							socketObjects[socketConfig.channel] = socket;
							sockets[_config.socketIndex] = socket;
						}
					};

					socketConfig.callback = function(_socket) {
						socket = _socket;
						socketConfig.onopen();
					};

					var socket = root.openSignalingChannel(socketConfig), isofferer = _config.isofferer, peer;

					var peerConfig = {
						onopen : onChannelOpened,
						onICE : function(candidate) {
							socket
									&& socket
											.send({
												userid : self.userid,
												candidate : {
													sdpMLineIndex : candidate.sdpMLineIndex,
													candidate : JSON
															.stringify(candidate.candidate)
												}
											});
						},
						onmessage : function(event) {
							config.onmessage({
								data : event.data,
								userid : _config.userid,
								extra : _config.extra
							});
						},
						onstream : function(stream) {
							var mediaElement = getMediaElement(stream, session);

							_config.stream = stream;
							if (mediaElement.tagName.toLowerCase() == 'audio')
								mediaElement
										.addEventListener(
												'play',
												function() {
													setTimeout(
															function() {
																mediaElement.muted = false;
																afterRemoteStreamStartedFlowing(mediaElement);
															}, 3000);
												}, false);
							else
								afterRemoteStreamStartedFlowing(mediaElement);
						},

						onclose : function(e) {
							e.extra = _config.extra;
							e.userid = _config.userid;
							root.onclose(e);

							// suggested in #71 by "efaj"
							if (root.channels[e.userid])
								delete root.channels[e.userid];
						},
						onerror : function(e) {
							e.extra = _config.extra;
							e.userid = _config.userid;
							root.onerror(e);
						},

						attachStreams : root.attachStreams,
						iceServers : root.iceServers,
						bandwidth : root.bandwidth,
						sdpConstraints : root.sdpConstraints || {},
						disableDtlsSrtp : root.disableDtlsSrtp
					};

					function initPeer(offerSDP) {
						if (!offerSDP)
							peerConfig.onOfferSDP = function(sdp) {
								sendsdp({
									sdp : sdp,
									socket : socket
								});
							};
						else {
							peerConfig.offerSDP = offerSDP;
							peerConfig.onAnswerSDP = function(sdp) {
								sendsdp({
									sdp : sdp,
									socket : socket
								});
							};
						}

						if (!session.data)
							peerConfig.onmessage = null;
						peerConfig.session = session;
						peer = new RTCPeerConnection(peerConfig);
					}

					function afterRemoteStreamStartedFlowing(mediaElement) {
						setTimeout(function() {
							mediaElement.volume = 1;
						}, 3000);

						var stream = _config.stream;
						stream.onended = function() {
							root.onstreamended(streamedObject);
						};

						stream.onended = function() {
							if (root.onstreamended)
								root.onstreamended(streamedObject);
						};

						var streamedObject = {
							mediaElement : mediaElement,

							stream : stream,
							streamid : stream.label,
							session : session,

							blobURL : mediaElement.mozSrcObject
									|| mediaElement.src,
							type : 'remote',

							extra : _config.extra,
							userid : _config.userid
						};
						root.onstream(streamedObject);

						// connection.streams['stream-id'].mute({audio:true})
						root.streams[stream.label] = root._getStream({
							stream : stream,
							userid : _config.userid,
							socket : socket,
							type : 'remote'
						});

						onSessionOpened();
					}

					function onChannelOpened(channel) {
						_config.channel = channel;

						// connection.channels['user-id'].send(data);
						root.channels[_config.userid] = {
							channel : _config.channel,
							send : function(data) {
								root.send(data, this.channel);
							}
						};

						root.onopen({
							extra : _config.extra,
							userid : _config.userid
						});

						if (isData(session))
							onSessionOpened();
					}

					function updateSocket() {
						if (socket.userid == _config.userid)
							return;

						socket.userid = _config.userid;
						sockets[_config.socketIndex] = socket;

						// connection.peers['user-id'].addStream({audio:true})
						root.peers[_config.userid] = {
							socket : socket,
							peer : peer,
							userid : _config.userid,
							addStream : function(session) {
								root.addStream(session, this.socket);
							}
						};
					}

					function onSessionOpened() {
						// admin/guest is one-to-one relationship
						if (root.userType && !root.session['many-to-many'])
							return;

						// original conferencing infrastructure!
						if (!session.oneway
								&& !session.broadcast
								&& isbroadcaster
								&& WebrtcUtils.getLength(participants) > 1
								&& WebrtcUtils.getLength(participants) <= root.maxParticipantsAllowed) {
							defaultSocket.send({
								newParticipant : socket.channel,
								userid : self.userid,
								extra : _config.extra || {}
							});
						}
					}

					function socketResponse(response) {
						if (response.userid == self.userid)
							return;

						if (response.sdp) {
							_config.userid = response.userid;
							_config.extra = response.extra;
							_config.renegotiate = response.renegotiate;

							// to make sure user-id for socket object is set
							// even if one-way streaming
							updateSocket();

							sdpInvoker(response.sdp, response.labels);
						}

						if (response.candidate) {
							peer
									&& peer
											.addICE({
												sdpMLineIndex : response.candidate.sdpMLineIndex,
												candidate : JSON
														.parse(response.candidate.candidate)
											});
						}

						if (response.mute || response.unmute) {
							log(response);
						}

						if (response.left) {
							if (peer && peer.connection) {
								peer.connection.close();
								peer.connection = null;
							}

							if (response.closeEntireSession)
								clearSession();
							else if (socket) {
								socket.send({
									left : true,
									extra : root.extra,
									userid : self.userid
								});

								if (sockets[_config.socketIndex])
									delete sockets[_config.socketIndex];
								if (socketObjects[socket.channel])
									delete socketObjects[socket.channel];

								socket = null;
							}

							if (participants[response.userid])
								delete participants[response.userid];

							root.onleave({
								userid : response.userid,
								extra : response.extra
							});

							if (root.userType)
								root.busy = false;
						}

						// keeping session active even if initiator leaves
						if (response.playRoleOfBroadcaster)
							setTimeout(function() {
								root.dontAttachStream = true;
								self.userid = response.userid;
								root.open({
									extra : root.extra
								});
								sockets = swap(sockets);
								root.dontAttachStream = false;
							}, 600);

						// if renegotiation process initiated by answerer
						if (response.suggestRenegotiation) {
							renegotiate = response.renegotiate;

							// detaching old streams
							detachMediaStream(root.detachStreams,
									peer.connection);

							if (isData(renegotiate))
								createOffer();
							else
								root.captureUserMedia(function(stream) {
									peer.connection.addStream(stream);
									createOffer();
								}, renegotiate);

							function createOffer() {
								peer.recreateOffer(renegotiate, function(sdp) {
									sendsdp({
										sdp : sdp,
										socket : socket,
										renegotiate : response.renegotiate,
										labels : root.detachStreams
									});
									root.detachStreams = [];
								});
							}
						}
					}

					function sdpInvoker(sdp, labels) {
						log(sdp.sdp);

						if (isofferer)
							return peer.addAnswerSDP(sdp);
						if (!_config.renegotiate)
							return initPeer(sdp);

						session = _config.renegotiate;
						// detach streams
						detachMediaStream(labels, peer.connection);

						if (session.oneway || isData(session)) {
							createAnswer();
						} else {
							if (_config.capturing)
								return;

							_config.capturing = true;

							root.captureUserMedia(function(stream) {
								_config.capturing = false;

								peer.connection.addStream(stream);
								createAnswer();
							}, _config.renegotiate);
						}

						delete _config.renegotiate;

						function createAnswer() {
							peer.recreateAnswer(sdp, session, function(_sdp) {
								sendsdp({
									sdp : _sdp,
									socket : socket
								});
							});
						}
					}
				}

				function detachMediaStream(labels, peer) {
					for ( var i = 0; i < labels.length; i++) {
						var label = labels[i];
						if (root.streams[label]) {
							var stream = root.streams[label].stream;
							stream.stop();
							peer.removeStream(stream);
						}
					}
				}

				// for PHP-based socket.io; split SDP in parts here

				function sendsdp(e) {
					e.socket.send({
						userid : self.userid,
						sdp : e.sdp,
						extra : root.extra,
						renegotiate : e.renegotiate ? e.renegotiate : false,
						labels : e.labels || []
					});
				}

				// sharing new user with existing participants

				function onNewParticipant(channel, extra) {
					if (!channel || !!participants[channel]
							|| channel == self.userid)
						return;

					participants[channel] = channel;

					var new_channel = root.token();
					newPrivateSocket({
						channel : new_channel,
						extra : extra || {}
					});

					defaultSocket.send({
						participant : true,
						userid : self.userid,
						targetUser : channel,
						channel : new_channel,
						extra : root.extra
					});
				}

				// if a user leaves

				function clearSession(channel) {
					var alert = {
						left : true,
						extra : root.extra,
						userid : self.userid
					};

					if (isbroadcaster) {
						if (root.autoCloseEntireSession) {
							alert.closeEntireSession = true;
						} else if (sockets[0]) {
							sockets[0].send({
								playRoleOfBroadcaster : true,
								userid : self.userid
							});
						}
					}

					if (!channel) {
						var length = sockets.length;
						for ( var i = 0; i < length; i++) {
							socket = sockets[i];
							if (socket) {
								socket.send(alert);
								if (socketObjects[socket.channel])
									delete socketObjects[socket.channel];
								delete sockets[i];
							}
						}
					}

					// eject a specific user!
					if (channel) {
						socket = socketObjects[channel];
						if (socket) {
							socket.send(alert);
							if (sockets[socket.index])
								delete sockets[socket.index];
							delete socketObjects[channel];
						}
					}

					sockets = swap(sockets);
				}

				window.onbeforeunload = function() {
					clearSession();
				};

				window.onkeyup = function(e) {
					if (e.keyCode == 116)
						clearSession();
				};

				var that = this, 
				defaultSocket = root
						.openSignalingChannel({
							onmessage : function(response) {
								if (response.userid == self.userid)
									return;
								if (isAcceptNewSession && response.sessionid
										&& response.userid) {
									root.session = session = response.session;
									root.onNewSession(response);
								}
								if (response.newParticipant
										&& self.joinedARoom
										&& self.broadcasterid === response.userid)
									onNewParticipant(response.newParticipant,
											response.extra);

								if (WebrtcUtils.getLength(participants) < root.maxParticipantsAllowed
										&& response.userid
										&& response.targetUser == self.userid
										&& response.participant
										&& !participants[response.userid]) {
									acceptRequest(response.channel
											|| response.userid, response.extra);
								}

								if (response.userType
										&& response.userType != root.userType) {
									if (!root.busy) {
										if (response.userType == 'admin') {
											if (root.onAdmin)
												root.onAdmin(response);
											else
												root.accept(response.userid);
										}
										if (response.userType == 'guest') {
											if (root.onGuest)
												root.onGuest(response);
											else
												root.accept(response.userid);
										}
									} else {
										if (response.userType != root.userType) {
											defaultSocket
													.send({
														rejectedRequestOf : response.userid,
														userid : self.userid,
														extra : root.extra
																|| {}
													});
										}
									}
								}

								if (response.acceptedRequestOf == self.userid) {
									if (root.onstats)
										root.onstats('accepted', response);
								}

								if (response.rejectedRequestOf == self.userid) {
									if (root.onstats)
										root.onstats('busy', response);
									sendRequest();
								}
							},
							callback : function(socket) {
								defaultSocket = socket;
								if (root.userType)
									sendRequest();
							}
						});

				function sendRequest() {
					defaultSocket.send({
						userType : root.userType,
						userid : root.userid,
						extra : root.extra || {}
					});
				}

				// open new session
				this.initSession = function() {
					isbroadcaster = true;
					session = root.session;
					this.isOwnerLeaving = isAcceptNewSession = false;
					(function transmit() {
						if (WebrtcUtils.getLength(participants) < root.maxParticipantsAllowed) {
							defaultSocket && defaultSocket.send({
								sessionid : self.sessionid,
								userid : self.userid,
								session : session,
								extra : root.extra
							});
						}

						if (!root.transmitRoomOnce && !that.isOwnerLeaving)
							setTimeout(transmit, root.interval || 3000);
					})();
				};

				// join existing session
				this.joinSession = function(_config) {
					_config = _config || {};

					session = _config.session;

					self.joinedARoom = true;

					if (_config.sessionid)
						self.sessionid = _config.sessionid;

					isAcceptNewSession = false;

					newPrivateSocket({
						channel : self.userid,
						extra : root.extra
					});

					defaultSocket.send({
						participant : true,
						userid : self.userid,
						targetUser : _config.userid,
						extra : root.extra
					});

					self.broadcasterid = _config.userid;
				};

				// send file/data or text message
				this.send = function(message, _channel) {
					message = JSON.stringify(message);

					if (_channel) {
						if (_channel.readyState == 'open') {
							_channel.send(message);
						}
						return;
					}

					for ( var dataChannel in root.channels) {
						var channel = root.channels[dataChannel].channel;
						if (channel.readyState == 'open') {
							channel.send(message);
						}
					}
				};

				// leave session
				this.leave = function(userid) {
					clearSession(userid);

					if (!userid) {
						self.userid = root.userid = root.token();
						root.joinedARoom = self.joinedARoom = isbroadcaster = false;
						isAcceptNewSession = true;
					}

					if (isbroadcaster) {
						this.isOwnerLeaving = true;
						root.isInitiator = false;
					}

					root.busy = false;
				};

				// renegotiate new stream
				this.addStream = function(e) {
					session = e.renegotiate;

					if (e.socket)
						addStream(e.socket);
					else
						for ( var i = 0; i < sockets.length; i++)
							addStream(sockets[i]);

					function addStream(socket) {
						peer = root.peers[socket.userid];

						if (!peer)
							throw 'No such peer exists.';

						peer = peer.peer;

						// if offerer; renegotiate
						if (peer
								&& peer.connection.localDescription.type == 'offer') {
							// detaching old streams
							detachMediaStream(root.detachStreams,
									peer.connection);

							if (session.audio || session.video)
								peer.connection.addStream(e.stream);

							peer.recreateOffer(session, function(sdp) {
								sendsdp({
									sdp : sdp,
									socket : socket,
									renegotiate : session,
									labels : root.detachStreams
								});
								root.detachStreams = [];
							});
						} else {
							// otherwise; suggest other user to play role of
							// renegotiator
							socket.send({
								userid : self.userid,
								renegotiate : session,
								suggestRenegotiation : true
							});
						}
					}
				};

				root.request = function(userid) {
					if (!root.session['many-to-many'])
						root.busy = true;

					root.captureUserMedia(function() {
						// open private socket that will be used to receive
						// offer-sdp
						newPrivateSocket({
							channel : self.userid,
							extra : root.extra || {}
						});

						// ask other user to create offer-sdp
						defaultSocket.send({
							participant : true,
							userid : self.userid,
							extra : root.extra || {},
							targetUser : userid
						});
					});
				};

				function acceptRequest(userid, extra) {
					if (root.userType && !root.busy) {
						if (root.onRequest)
							root.onRequest(userid, extra);
						else
							_accept(userid, extra);
					}

					if (!root.userType)
						_accept(userid, extra);
				}

				function _accept(userid, extra) {
					if (root.userType) {
						if (!root.session['many-to-many'])
							root.busy = true;
						defaultSocket.send({
							acceptedRequestOf : userid,
							userid : self.userid,
							extra : root.extra || {}
						});
					}

					participants[userid] = userid;
					newPrivateSocket({
						isofferer : true,
						channel : userid,
						extra : extra || {}
					});
				}

				root.accept = function(userid, extra) {
					root.captureUserMedia(function() {
						_accept(userid, extra);
					});
				};
			};
			return RTCMultiSession;
		});