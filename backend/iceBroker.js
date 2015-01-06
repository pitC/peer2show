
var XIRSYS_DATA = {
		ident: "peertoshow",
        secret: "1c43f593-b722-4993-b269-88d9a6328b9a",
        domain: "www.peer2show.com",
        application: "default",
        room: "default",
        secure: 1
}; 

var request = require('request');

var useXirsys = function(callback){
	var data = XIRSYS_DATA;
	console.log("Call for XIRSYS data");
	request.post(
			{ 	
				method: 'POST',
				uri: "https://api.xirsys.com/getIceServers",
				json:true,
				form: data
			}
			,
                function(error,response,body){
					console.log(error);
					console.log(response);
                	if (!error && response.statusCode == 200) {
                		
                	    console.log(body);
                	    var iceConfig = body.d;
                	    callback(iceConfig);
                	}
                	else{
                		useDefault(callback);
                	} 	                	
			});
};

var useDefault = function(callback){
	var iceConfig = {'iceServers': [
	    	                        { url: 'stun:stun.l.google.com:19302' },
	    	                        // for firefox do not use notation username@hostname! 
	    	                        // Use username as separate attribute instead
	    	                        { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo'  }
	    	                      ]};
	callback(iceConfig);
};

exports.getIceCandidates = function(req, res) {
	useXirsys(function(config){
		res.send(config);
	});
};
