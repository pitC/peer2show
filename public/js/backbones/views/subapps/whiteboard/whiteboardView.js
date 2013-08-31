define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/subapps/basicSubappView',
         'text!templates/whiteboardApp/canvas.html',
         'text!templates/whiteboardApp/toolbar.html',
         'tiny_color',
         'jquery_pick_a_color',
         'lib/bootstrap-slider',
         'app/whiteboard/whiteboardApp'
         
         
], function($, _, Backbone, BasicSubappView, CanvasTmpl, ToolbarTmpl,TinyColor,ColorPicker,bs,WhiteboardApp){

	ToolbarView = Backbone.View.extend({
		
			
		
    	initialize:function (app) {
            this.template = _.template(ToolbarTmpl);
            this.whiteboardApp = app;
        },
        		
        render : function(){
            this.$el.html(this.template());
            
            return this;
        },
        events : {
			"slide .slider": "slideEvent",
			"click button#canvas-clear": "clearBtEvent",
			"change .pick-a-color": "colorChangeEvent"
		},
		
		slideEvent : function(event){
			this.whiteboardApp.sketchpadLocal.setLineSize($(event.target).val());
		},
		
		clearBtEvent : function(event){
			this.whiteboardApp.clearLocal();
		},
		
		colorChangeEvent : function(event){
			console.log("Color pick! ");
			this.whiteboardApp.sketchpadLocal.setLineColor($(event.target).val());
		},
		
        onShow : function(){
        	       	
        	$(".pick-a-color").pickAColor({
            	showHexInput: false
            });
        	
        	$(".slider").slider({
        		min: 1,
        		max: 100,
        		step: 1,
        		value: 20
        	});
        }
    });
	
	CanvasView = Backbone.View.extend({
    	initialize:function (app) {
            this.template = _.template(CanvasTmpl);
            this.whiteboardApp = app;
            
        },
		
        render : function(){
            this.$el.html(this.template());
            return this;
        },
        
        onShow : function(){
        	this.whiteboardApp.initLocalSketpchad($('#layer1'));
        	this.addRemoteLayer();
        },
        
        addRemoteLayer : function(id){
        	this.whiteboardApp.initRemoteSketchpad($('#layer0'));
        },
        
        onNewPeer : function(e){
        	this.addRemoteLayer(e.userid);
        }
        
    });
	
	WhiteboardView = BasicSubappView.extend({
		/*
		renderSidebarExtension : function(el){
			
			return ;
		},*/
		initialize:function (webRTCClient) {
            this.whiteboardApp = new WhiteboardApp(webRTCClient);
            
            this.subviews = [];
            
        },
        
        addRemoteLayer: function(){
        	
        },
		
		render : function(){
            this.$el.html('');
            
            var toolbar= new ToolbarView(this.whiteboardApp);
			var canvas = new CanvasView(this.whiteboardApp);
            this.$el.append(toolbar.render().el);
            this.$el.append(canvas.render().el);
            
            this.subviews.push(toolbar);
            this.subviews.push(canvas);
            
            return this;
        },
        
        onNewPeer : function(e){
        	console.log("New peer! "+e);
        	for (var i = 0; i<this.subviews.length;i++){
				if(this.subviews[i].onNewPeer)
					this.subviews[i].onNewPeer(e);
			}
        }
	});
	
	return WhiteboardView;
});