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
         'app/whiteboard/responsive-sketchpad'
         
], function($, _, Backbone, BasicSubappView, CanvasTmpl, ToolbarTmpl,TinyColor,ColorPicker,bs,Sketchpad){

	ToolbarView = Backbone.View.extend({
    	initialize:function () {
            this.template = _.template(ToolbarTmpl);
        },
        		
        render : function(){
            this.$el.html(this.template());
            
            return this;
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
    	initialize:function () {
            this.template = _.template(CanvasTmpl);
        },
		
        render : function(){
            this.$el.html(this.template());
            return this;
        },
        
        onShow : function(){
        	var sketchpadLocal = $('#layer1').sketchpad({
        	    aspectRatio: 1,
        	    canvasColor: 'rgba(255, 0, 0, 0)'
        	});

        	var sketchpadRemote = $('#layer0').sketchpad({
        	    aspectRatio: 1,
        	    canvasColor: '#FFF',
        	    locked: true
        	});
        }
    });
	
	WhiteboardView = BasicSubappView.extend({
		/*
		renderSidebarExtension : function(el){
			
			return ;
		},*/
		initialize:function (webRTCClient) {
            this.webRTCClient = webRTCClient;
            this.subviews = [];
        },
        
        addRemoteLayer: function(){
        	
        },
		
		render : function(){
            this.$el.html('');
            var toolbar= new ToolbarView();
			var canvas = new CanvasView();
            this.$el.append(toolbar.render().el);
            this.$el.append(canvas.render().el);
            
            this.subviews.push(toolbar);
            this.subviews.push(canvas);
            
            return this;
        }
	});
	
	return WhiteboardView;
});