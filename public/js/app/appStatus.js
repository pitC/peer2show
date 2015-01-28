define([],function () {
	return {
		
		READY : "ready",
		UPLOADING_PHOTOS : "upload",
		OPENING_CHANNEL : "channel_open",
		WAITING_FOR_USERS : "wait",
		JOINING_ROOM : "join",
		LOADING_PHOTO : "load",
		SESSION_ENDED : "end",
		FATAL_ERROR : "fatal",
		isValid : function(status){
			var keys = Object.keys(this);
			for (i in keys){
				var key = keys[i];
				var val = this[key];
				if (val == status)
					return true;
			};
			return false;
		}
	};
});