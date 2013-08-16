$.fn.sketchpad = function(options) {

    // Canvas info
    var canvas = this;
    var ctx = $(this)[0].getContext('2d');

    // Default aspect ratio
    var aspectRatio = 1;

    // For storing strokes
    var strokes = [];

    // Whether or not currently drawing
    var sketching = false;

    // Default Context
    var lineColor = 'black';
    var lineSize = 20;
    var lineCap = 'round';
    var lineJoin = 'round';
    var lineMiterLimit = 10;

    // Array for storing strokes that were undone
    var undo = [];

    // Resize canvas with window
    $(window).resize(function(e) {
        var width = canvas.parent().width();
        var height = width / aspectRatio;

        setSize(width, height);
        redraw();
    });
    
    this.startEventCb;
    this.moveEventCb;
    this.endEventCb;
    var that = this;
    // Return the mouse/touch location
    function getCursor(element, event) {
        var cur = {x: 0, y: 0};
        if (event.type.indexOf('touch') !== -1) {
            cur.x = event.originalEvent.touches[0].pageX;
            cur.y = event.originalEvent.touches[0].pageY;
        } else {
            cur.x = event.pageX ;
            cur.y = event.pageY;
        }
        
        var retCur = {
                x: (cur.x - $(element).offset().left),
                y: (cur.y - $(element).offset().top)
            };
        
        return retCur;
    }
    
    function normalizeCursor(cur,width,height){
		var retCur = {
			x: normalize(cur.x,width),
			y: normalize(cur.y,height)
		};
		
		return retCur;
	}
    function normalize(value,dimension){
    	return value/dimension;
    }

    // Set the canvas size
    function setSize(w, h) {
        canvas.width(w);
        canvas.height(h);

        canvas[0].setAttribute('width', w);
        canvas[0].setAttribute('height', h);
    }

    // On mouse down, create new stroke, push start location
    var startEvent = 'mousedown touchstart ';
    canvas.on(startEvent, function(e) {
        if (e.type == 'touchstart') {
            e.preventDefault();
        } else {
            e.originalEvent.preventDefault();
        }

        sketching = true;
        undo = []; // Clear undo strokes
        
        
        strokes.push({
            stroke: [],
            c: lineColor,
            s: lineSize,
            cp: lineCap,
            j: lineJoin, 
            m: lineMiterLimit, //miter Limit
    	    w:  $(this).width(), // canvas width
    	    h:  $(this).height(), // canvas height
        });

        var canvas = getCursor(this, e);

        strokes[strokes.length - 1].stroke.push({
            x: canvas.x,
            y: canvas.y
        });

        redraw();
    });

    // On mouse move, record movements
    var moveEvent = 'mousemove touchmove ';
    canvas.on(moveEvent, function(e) {
        var canvas = getCursor(this, e);

        if (sketching) {
            strokes[strokes.length - 1].stroke.push({
                x: canvas.x,
                y: canvas.y
            });
            redraw();
        }
    });

    // On mouse up, end stroke
    var endEvent = 'mouseup mouseleave touchend ';
    canvas.on(endEvent, function(e) {
    	var wasSketching = sketching;
    	sketching = false;
    	if (that.endEventCb && wasSketching){
        	that.endEventCb();
        } 
    });
    
    

    function redraw() {
        var width = $(canvas).width();
        var height = $(canvas).height();

        ctx.clearRect(0, 0, width, height); // Clear Canvas

        for (var i = 0; i < strokes.length; i++) {
            var stroke = strokes[i].stroke;

            ctx.beginPath();
            for (var j = 0; j < stroke.length - 1; j++) {
            	var pointA = normalizeCursor(stroke[j], strokes[i].w, strokes[i].h);
        		var pointZ = normalizeCursor(stroke[j+1], strokes[i].w, strokes[i].h);
                ctx.moveTo(pointA.x * width, pointA.y * height);
                ctx.lineTo(pointZ.x * width, pointZ.y * height);
            }
            ctx.closePath();

            ctx.strokeStyle = strokes[i].c;
            ctx.lineWidth = normalize(strokes[i].s,strokes[i].w) * width;
            ctx.lineJoin = strokes[i].j;
            ctx.lineCap = strokes[i].cp;
            ctx.miterLimit = strokes[i].m;

            ctx.stroke();
        }
    }

    function init() {
        if (options.data) {
            aspectRatio = typeof options.data.aspectRatio !== 'undefined' ? options.data.aspectRatio : aspectRatio;
            strokes = typeof options.data.strokes !== 'undefined' ? options.data.strokes : [];
        } else {
            aspectRatio = typeof options.aspectRatio !== 'undefined' ? options.aspectRatio : aspectRatio;
        }

        var canvasColor = typeof options.canvasColor !== 'undefined' ? options.canvasColor : '#fff';
        canvas.css('background-color', canvasColor);

        var locked = typeof options.locked !== 'undefined' ? options.locked : false;
        if (locked) {
            canvas.unbind(startEvent + moveEvent + endEvent);
        } else {
            canvas.css('cursor', 'crosshair');
        }

        // Set canvas size
        var width = canvas.parent().width();
        var height = width / aspectRatio;

        setSize(width, height);
        redraw();
    }

    init();

    this.json = function() {
        return JSON.stringify({
            aspectRatio: aspectRatio,
            strokes: strokes
        });
    };
    
    this.getLastStrokeJson = function(){
    	return JSON.stringify({
            stroke: strokes[strokes.length - 1]
        });
    };

    this.jsonLoad = function(json) {
        var array = JSON.parse(json);
        aspectRatio = array.aspectRatio;
        strokes = array.strokes;
        redraw();
    };
    this.addStroke = function(json){
    	
    	var stroke = json.stroke;
    	strokes.push(stroke);
    	redraw();
    };

    this.getImage = function() {
        return '<img src="' + canvas[0].toDataURL("image/png") + '"/>';
    };

    this.getLineColor = function() {
        return lineColor;
    };

    this.setLineColor = function(color) {
        lineColor = color;
    };

    this.getLineSize = function() {
        return lineSize;
    };

    this.setLineSize = function(size) {
        lineSize = size;
    };

    this.undo = function() {
        if (strokes.length > 0) {
            undo.push(strokes.pop());
            redraw();
        }
    };

    this.redo = function() {
        if (undo.length > 0) {
            strokes.push(undo.pop());
            redraw();
        }
    };

    this.clear = function() {
        strokes = [];
        redraw();
    };
    
    
    
   

    return this;
};