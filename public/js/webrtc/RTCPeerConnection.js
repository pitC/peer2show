define(
		function(){
			var RTCPeerConnection = function(options) {
			        var w = window,
			            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
			            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
			            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;
			
			        if (moz) console.warn('Should we use "stun:stun.services.mozilla.com"?');
			
			        var STUN = {
			            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
			        };
			
			        var TURN = {
			            //url: 'turn:homeo@turn.bistri.com:80',
			        	//credential: 'homeo'
			        	url: 'turn:41784574@computeengineondemand.appspot.com/turn',
			            credential: '4080218913'
			        };
			
			        var iceServers = {
			            iceServers: options.iceServers || [STUN]
			        };
			
			        if (!moz && !options.iceServers) {
			            if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
			                TURN = {
			//                    url: 'turn:turn.bistri.com:80',
			//                    credential: 'homeo',
			//                    username: 'homeo'
			            		url: 'turn:https://computeengineondemand.appspot.com/turn',
			                    credential: '4080218913',
			                    username: '41784574'
			                };
			
			            iceServers.iceServers = [STUN, TURN];
			        }
			
			        var optional = {
			            optional: []
			        };
			
			        if (!moz) {
			            optional.optional = [{
			                DtlsSrtpKeyAgreement: true
			            }];
			
			            if (options.disableDtlsSrtp)
			                optional = {
			                    optional: []
			                };
			
			            if (options.onmessage)
			                optional.optional = [{
			                    RtpDataChannels: true
			                }];
			        }
			
			        if (!navigator.onLine) {
			            iceServers = null;
			            console.warn('No internet connection detected. No STUN/TURN server is used to make sure local/host candidates are used for peers connection.');
			        }
					else log('iceServers', JSON.stringify(iceServers, null, '\t'));
			
			        var peer = new PeerConnection(iceServers, optional);
			
			        openOffererChannel();
			
			        peer.onicecandidate = function(event) {
			            if (event.candidate && !options.renegotiate)
			                options.onICE(event.candidate);
			        };
			
			        if (options.attachStreams && options.attachStreams.length) {
			            var streams = options.attachStreams;
			            for (var i = 0; i < streams.length; i++) {
			                peer.addStream(streams[i]);
			            }
			        }
			
			        peer.onaddstream = function(event) {
			            log('on:add:stream', event.stream);
			
			            if (!event || !options.onstream) return;
			
			            options.onstream(event.stream);
			            options.renegotiate = false;
			        };
			
			        var constraints;
			
			        function setConstraints() {
			            var session = options.session;
			
			            var sdpConstraints = options.sdpConstraints;
			            constraints = options.constraints || {
			                optional: [],
			                mandatory: {
			                    OfferToReceiveAudio: !!session.audio,
			                    OfferToReceiveVideo: !!session.video || !!session.screen
			                }
			            };
			
			            if (sdpConstraints.mandatory)
			                constraints.mandatory = merge(constraints.mandatory, sdpConstraints.mandatory);
			
			            if (sdpConstraints.optional)
			                constraints.optional[0] = merge({ }, sdpConstraints.optional);
			
			            log('sdp constraints', JSON.stringify(constraints, null, '\t'));
			        }
			
			        setConstraints();
			
			        function createOffer() {
			            if (!options.onOfferSDP)
			                return;
			
			            peer.createOffer(function(sessionDescription) {
			                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
			                peer.setLocalDescription(sessionDescription);
			                options.onOfferSDP(sessionDescription);
			            }, null, constraints);
			        }
			
			        function createAnswer() {
			            if (!options.onAnswerSDP)
			                return;
			
			            options.offerSDP = new SessionDescription(options.offerSDP);
			            peer.setRemoteDescription(options.offerSDP);
			
			            peer.createAnswer(function(sessionDescription) {
			                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
			                peer.setLocalDescription(sessionDescription);
			                options.onAnswerSDP(sessionDescription);
			            }, null, constraints);
			        }
			
			        if ((options.onmessage && !moz) || !options.onmessage) {
			            createOffer();
			            createAnswer();
			        }
			
			        var bandwidth = options.bandwidth || { };
			
			        function setBandwidth(sdp) {
			            // remove existing bandwidth lines
			            sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');
			
			            sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
			            sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
			            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 102400) + '\r\n'); // 100 Mbps
			
			            return sdp;
			        }
			
			        // var bitrate = options.bitrate || {};
			
			        function setBitrate(sdp) {
			            // sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
			            return sdp;
			        }
			
			        var framerate = options.framerate || { };
			
			        function setFramerate(sdp) {
			            sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (framerate.minptime || 10));
			            sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (framerate.maxptime || 60));
			            return sdp;
			        }
			
			        function getInteropSDP(sdp) {
			            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
			                extractedChars = '';
			
			            function getChars() {
			                extractedChars += chars[parseInt(Math.random() * 40)] || '';
			                if (extractedChars.length < 40)
			                    getChars();
			
			                return extractedChars;
			            }
			
			            // for audio-only streaming: multiple-crypto lines are not allowed
			            if (options.onAnswerSDP)
			                sdp = sdp.replace( /(a=crypto:0 AES_CM_128_HMAC_SHA1_32)(.*?)(\r\n)/g , '');
			
			            var inline = getChars() + '\r\n' + (extractedChars = '');
			            sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace( /c=IN/g ,
			                'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline +
			                    'c=IN') : sdp;
			
			            return sdp;
			        }
			
			        function serializeSdp(sdp) {
			            if (moz) return sdp;
			            sdp = setBandwidth(sdp);
			            sdp = setFramerate(sdp);
			            sdp = setBitrate(sdp);
			            sdp = getInteropSDP(sdp);
			            return sdp;
			        }
			
			        var channel;
			
			        function openOffererChannel() {
			            if (!options.onmessage || (moz && !options.onOfferSDP))
			                return;
			
			            _openOffererChannel();
			
			            if (moz) {
			                navigator.mozGetUserMedia({
			                        audio: true,
			                        fake: true
			                    }, function(stream) {
			                        peer.addStream(stream);
			                        createOffer();
			                    }, useless);
			            }
			        }
			
			        function _openOffererChannel() {
			            channel = peer.createDataChannel(options.channel || 'RTCDataChannel', moz ? { } : {
			                reliable: false
			            });
			
			            if (moz) channel.binaryType = 'blob';
			
			            setChannelEvents();
			        }
			
			        function setChannelEvents() {
			            channel.onmessage = options.onmessage;
			            channel.onopen = function() {
			                options.onopen(channel);
			            };
			            channel.onclose = options.onclose;
			            channel.onerror = options.onerror;
			        }
			
			        if (options.onAnswerSDP && options.onmessage && moz)
			            openAnswererChannel();
			
			        function openAnswererChannel() {
			            peer.ondatachannel = function(event) {
			                channel = event.channel;
			                channel.binaryType = 'blob';
			                setChannelEvents();
			            };
			
			            navigator.mozGetUserMedia({
			                    audio: true,
			                    fake: true
			                }, function(stream) {
			                    peer.addStream(stream);
			                    createAnswer();
			                }, useless);
			        }
			
			        // fake:true is also available on chrome under a flag!
			        function useless() {
			            log('error in fake:true');
			        }
			
			        return {
			            connection: peer,
			            addAnswerSDP: function(sdp) {
			                peer.setRemoteDescription(new SessionDescription(sdp));
			            },
			            addICE: function(candidate) {
			                peer.addIceCandidate(new IceCandidate({
			                    sdpMLineIndex: candidate.sdpMLineIndex,
			                    candidate: candidate.candidate
			                }));
			            },
			            recreateAnswer: function(sdp, session, callback) {
			                options.renegotiate = true;
			
			                options.session = session;
			                setConstraints();
			
			                options.onAnswerSDP = callback;
			                options.offerSDP = sdp;
			                createAnswer();
			            },
			            recreateOffer: function(session, callback) {
			                options.renegotiate = true;
			
			                options.session = session;
			                setConstraints();
			
			                options.onOfferSDP = callback;
			                createOffer();
			            }
			        };
			    };
			    
			return RTCPeerConnection;
});