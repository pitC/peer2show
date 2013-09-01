define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'backbones/views/roomapps/basicSubappView',
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
        	console.log("Canvas on show!");
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
		
		initialize:function (webRTCClient) {
            this.whiteboardApp = new WhiteboardApp(webRTCClient);
            
            this.subviews = [];
            
            this.title = "Whiteboard";
            
            var toolbar= new ToolbarView(this.whiteboardApp);
			var canvas = new CanvasView(this.whiteboardApp);
			this.subviews.push(toolbar);
            this.subviews.push(canvas);
        },
        
        addRemoteLayer: function(){
        	
        },
		
		render : function(){
            this.$el.html('');
            
            // order must be kept in init part
            for (var index in this.subviews){
            	var subview = this.subviews[index];
            	this.$el.append(subview.render().el);
            }           
            
            
            return this;
        },
        
        onActivate : function(){
        	this.whiteboardApp.bindCommunicationEvents();
        	this.onShow();
        	
        	// rebind events
        	for (var index in this.subviews){
            	var subview = this.subviews[index];
            	subview.delegateEvents();
            }   
        	
        },
        
        onDeactivate : function(){
        	this.whiteboardApp.resetSketchpads();
        }
        
	});
	
	return WhiteboardView;
});