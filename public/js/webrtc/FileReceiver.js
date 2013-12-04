define(
		function(){
		   var  FileReceiver = function() {
		        var content = { },
		            packets = { },
		            numberOfPackets = { };

		        // "root" is RTCMultiConnection object
		        // "data" is object passed using WebRTC DataChannels

		        function receive(data, root) {
		            // uuid is used to uniquely identify sending instance
		            var uuid = data.uuid;

		            if (data.packets) numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);

		            if (root.onFileProgress)
		                root.onFileProgress({
		                    remaining: packets[uuid]--,
		                    length: numberOfPackets[uuid],
		                    received: numberOfPackets[uuid] - packets[uuid]
		                }, uuid);

		            if (!content[uuid]) content[uuid] = [];

		            content[uuid].push(data.message);

		            // if it is last packet
		            if (data.last) {
		                var dataURL = content[uuid].join('');
		                var blob = FileConverter.DataUrlToBlob(dataURL);
		                var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);

		                if (root.onFileReceived)
		                    root.onFileReceived(data.name, {
		                        blob: blob,
		                        dataURL: dataURL,
		                        url: virtualURL,
		                        uuid: uuid
		                    });

		                delete content[uuid];
		            }
		        }
		    };
	
	     return FileReceiver;
});