define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/components/showArea',
         'backbones/views/components/previewArea',
         'backbones/views/components/chatArea'
         
], function($, _, Backbone,  ShowArea, PreviewArea, ChatArea){

	
		var RoomSubviews = function(rootEl, app){

			this.rootEl = rootEl;
			this.app = app;
			
			this.subviewConfig = {
				"#show-area":ShowArea,
				"#preview-area":PreviewArea,
				"#chat-area":ChatArea
			};
			
			this.subviews = null;
			
            this.render = function(){
            	this.subviews = {};
            	
            	console.log("Room view rerender! "+this.app.status);
            	
            	for (var subviewId in this.subviewConfig){
            		var initFunc = this.subviewConfig[subviewId];
            		this._renderSubview(subviewId,initFunc);
            	};
            	
                return this;
            };
            
            this._renderSubview = function(htmlId,initFunc){
            	console.log("Render "+htmlId);
            	this.subviews[htmlId] = new initFunc(this.app);
            	this.rootEl.find(htmlId).append(this.subviews[htmlId].render().el);
            };
            
            this.isInitialized = function(){
            	console.log(this.subviews);
            	if (this.subviews !== null){
            		console.log("[Subviews]: initialized");
            		return true;
            	}
            	else{
            		console.log("[Subviews]: not initialized");
            		return false;
            	}
            };
            
            this.onShow = function(){
            	
            	for (var subviewId in this.subviews){
            		var subview = this.subviews[subviewId];
            		if (subview.onShow){
            			subview.onShow();
            		}
            	}
            };
           
        };
		return RoomSubviews;
});