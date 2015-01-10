define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/appStatus'
], function($, _, Backbone,AppStatus){
	SyncMonitorModel = Backbone.Model.extend({
		
		
		
		initialize:function (options) {	
			this.syncStatus = {};
			this.totalActionCount = 0;
			this.confirmedActionCount = 0;
		},
		
		
		/*
		updateTrigger : function(){
			this.trigger("change",this.getProgress());
		}
		*/
		
		produceActionId : function(){
			var LENGTH = 20;
    		var rand = function() {
    		    return Math.random().toString(36).substr(2, LENGTH); // remove `0.`
    		};
    		return rand();
		},
		
		incrCounter:function(peerId,actionId){
			// add peer object if not there yet
			var peer = this.getPeer(peerId);
			this.changeActionCount(peer,actionId,1);
			console.log(">>> SYNC MONITOR: increase for "+peerId+" action "+actionId);
			console.log(this.getStatusMsg());
			if (this.totalActionCount == 0){
				this.trigger('unsynced',this.getStatusMsg());
			}
			else{
				this.trigger('syncProgress',this.getStatusMsg());
			}
			this.totalActionCount++;
		},

		decrCounter:function(peerId,actionId){
			var peer = this.getPeer(peerId);
			this.changeActionCount(peer,actionId,-1);
			console.log(">>> SYNC MONITOR: decrease for "+peerId+" action "+actionId);
			
			this.confirmedActionCount++;
			this.trigger('syncProgress',this.getStatusMsg());
			this.isFullySynced(true);
			console.log(this.getStatusMsg());
		},
		
		getPeer : function(peerId){
			if (this.syncStatus[peerId] == null){
				this.syncStatus[peerId] = {};
			}
			return this.syncStatus[peerId];
		},
		
		changeActionCount : function(peer,actionId,cntDelta){
			var oldCnt;
			if (peer[actionId] != null){
				oldCnt = peer[actionId];
			}
			else{
				oldCnt = 0; 
			}
			peer[actionId] = oldCnt + cntDelta;
			if (peer[actionId] <= 0){
				delete peer[actionId];
			}
		},
		
		isSynced:function(peerId){
			if (Object.keys(this.syncStatus[peerId]) == 0){
				return true;
			}
			else{
				return false;
			}
		},
		
		removePeer : function(peerId){
			delete this.syncStatus[peerId];
		},
		
		isFullySynced:function(trigger){
			
			// iterate over all peers, if at least one not synced, return false
			for (var key in this.syncStatus){
				if (!this.isSynced(key)){
					console.log(">>> SYNC MONITOR: not yet fully synced! ");
					console.log(this.syncStatus);
					return false;
				}
			}
			if (trigger){
				this.trigger('synced',this.getStatusMsg());
			}
			// otherwise all synced!
			console.log(">>> SYNC MONITOR: fully synced! ");
			this.confirmedActionCount = 0;
			this.totalActionCount = 0;
			return true;
		},
		
		getStatusMsg : function(){
			var progress; 
			if (this.totalActionCount > 0){
				var ratio = (this.confirmedActionCount/this.totalActionCount)*100;
				progress = parseInt(ratio)+"%";
			}
			else{
				progress = "100%";
			}
			var msg = {progress:progress};
			return msg;
		}
		
	});
	
	
	
	return SyncMonitorModel;
});