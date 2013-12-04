define(
		function(){

				var TextSender =  function(){
				        this.send = function(config) {
				            var channel = config.channel,
				                _channel = config._channel,
				                initialText = config.text,
				                packetSize = 800,
				                textToTransfer = '',
				                isobject = false;
				
				            if (typeof initialText !== 'string') {
				                isobject = true;
				                initialText = JSON.stringify(initialText);
				            }
				
				            // uuid is used to uniquely identify sending instance
				            var uuid = getRandomString();
				            var sendingTime = new Date().getTime();
				
				            sendText(initialText);
				
				            function sendText(textMessage, text) {
				                var data = {
				                    type: 'text',
				                    uuid: uuid,
				                    sendingTime: sendingTime
				                };
				
				                if (textMessage) {
				                    text = textMessage;
				                    data.packets = parseInt(text.length / packetSize);
				                }
				
				                if (text.length > packetSize)
				                    data.message = text.slice(0, packetSize);
				                else {
				                    data.message = text;
				                    data.last = true;
				                    data.isobject = isobject;
				                }
				
				                channel.send(data, _channel);
				
				                textToTransfer = text.slice(data.message.length);
				
				                if (textToTransfer.length)
				                    setTimeout(function() {
				                        sendText(null, textToTransfer);
				                    }, moz ? 1 : 500);
				            }
				        };
				    };
				return TextSender;
		}
);