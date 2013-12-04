define(
		function(){
			var TextReceiver = function() {
		        var content = { };
		
		        function receive(data, onmessage, userid, extra) {
		            // uuid is used to uniquely identify sending instance
		            var uuid = data.uuid;
		            if (!content[uuid]) content[uuid] = [];
		
		            content[uuid].push(data.message);
		            if (data.last) {
		                var message = content[uuid].join('');
		                if (data.isobject) message = JSON.parse(message);
		
		                // latency detection
		                var receivingTime = new Date().getTime();
		                var latency = receivingTime - data.sendingTime;
		
		                if (onmessage)
		                    onmessage({
		                        data: message,
		                        userid: userid,
		                        extra: extra,
		                        latency: latency
		                    });
		
		                delete content[uuid];
		            }
		        }	
		};
	
	     return TextReceiver;
});