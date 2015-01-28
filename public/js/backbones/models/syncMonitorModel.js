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
			console.log(this.getStatus());
			if (this.totalActionCount == 0){
				this.trigger('unsynced',this.getStatus());
			}
			else{
				this.trigger('syncProgress',this.getStatus(peerId));
			}
			this.totalActionCount++;
			peer.totalActionCount++;
		},

		decrCounter:function(peerId,actionId){
			var peer = this.getPeer(peerId);
			this.changeActionCount(peer,actionId,-1);
			console.log(">>> SYNC MONITOR: decrease for "+peerId+" action "+actionId);
			
			this.confirmedActionCount++;
			peer.confirmedActionCount++;
			this.trigger('syncProgress',this.getStatus(peerId));
			this.isFullySynced(true);
			console.log(this.getStatus());
		},
		
		getPeer : function(peerId){
			if (this.syncStatus[peerId] == null){
				this.syncStatus[peerId] = {totalActionCount:0,confirmedActionCount:0};
				
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
		
		getOpenActounCount : function(peerId){
			// 2 are the action counters
			return Object.keys(this.syncStatus[peerId]) -2;
		},
		
		isSynced:function(peerId){
			
			if (this.getOpenActounCount(peerId) == 0){
				var peer = this.getPeer(peerId);
				peer.confirmedActionCount = 0;
				peer.totalActionCount = 0;
				return true;
			}
			else{
				return false;
			}
		},
		
		removePeer : function(peerId){
			delete this.syncStatus[peerId];
			this.isFullySynced(true);
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
				this.trigger('synced',this.getStatus());
			}
			// otherwise all synced!
			console.log(">>> SYNC MONITOR: fully synced! ");
			this.confirmedActionCount = 0;
			this.totalActionCount = 0;
			return true;
		},
		
		_getProgress : function(total,confirmed){
			var progress = 100;
			if (total > 0){
				var ratio = (confirmed/total)*100;
				progress = parseInt(ratio);
			}
			return progress;
		},
		
		getTotalProgress : function(){
			return this._getProgress(this.totalActionCount,this.confirmedActionCount);
		},
		
		getPeerProgress : function(peerId){
			var peerProgress = 0;
			if(peerId != null){
				var peer = this.getPeer(peerId);
				peerProgress = this._getProgress(peer.totalActionCount, peer.confirmedActionCount);
			}
			return peerProgress;
		},
		
		getStatus : function(peerId){
			
			var status = {};
			if (peerId != null){
				var peerProgress = this.getPeerProgress(peerId);
				status.peer = {
						peerId:peerId,
						progress:peerProgress
				};
			}
			
			var totalProgress = this.getTotalProgress();
			
			status.progress = totalProgress;
			return status;
		}
		
	});
	
	
	
	return SyncMonitorModel;
});