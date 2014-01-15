define([],function () {
	return {
		
		READY : "ready",
		UPLOADING_PHOTOS : "transferring photos...",
		OPENING_CHANNEL : "opening channel...",
		WAITING_FOR_USERS : "waiting for someone to join",
		JOINING_ROOM : "joining room...",
		LOADING_PHOTO : "loading photo",
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