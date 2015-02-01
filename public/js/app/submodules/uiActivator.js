define([
        'hammer',
        'zoomer'
        ],function (Hammer, SmartZoom) {

	var submodule = function(){
		this.init = function(app){
			app.zoomableArea = null;
			app.addDropArea = function(dropAreaId){
				var dropArea = document.getElementById(dropAreaId);
				var self = app;
				if (dropArea != null){
					dropArea.ondragover = function () {  return false; };
					dropArea.ondragend = function () {  return false; };
					dropArea.ondrop = function(event){
						event.preventDefault();
						// read files
						if(event.dataTransfer.files.length > 0){;
						
							setTimeout(self.readfiles(event.dataTransfer.files),0);
						}
						// try to read url
						else if (event.dataTransfer.items){
							event.dataTransfer.items[0].getAsString(function(url){
								if(url!=null){
									self.readurl(url);
								}
							});	
						}
						console.log("dropped");
					};
				};
			};
			
			app.addClickArea = function(clickAreaId){
				var clickArea = document.getElementById(clickAreaId);
				$(clickArea).attr("onclick","$('#file-input').click();");
				$(clickArea).addClass("click-area");
			};
			
			app.setZoomableArea = function(zoomableAreaId){
				var elemRect = $(zoomableAreaId);
				var self = app;
				if (elemRect.length > 0){
					$(elemRect).smartZoom();
					$(elemRect).off('SmartZoom_ZOOM_END SmartZoom_PAN_END').on('SmartZoom_ZOOM_END SmartZoom_PAN_END',function(event){
						self.rpcTransformImage(null,self.getTransform(elemRect),self.getDims(elemRect));
					});
				}
				app.zoomableArea = elemRect;
			};
			
			app.getTransform = function(object){
				// TODO: use other transform value
				var webkitTransform = object.css('-webkit-transform');
				var transform = object.css('transform');
				var finalTransform = webkitTransform || transform;
				return finalTransform;
			};
			
			app.getDims = function(object){
				var d = {
						w:object.width(),
						h:object.height()
				};
				return d;
			},
			
			app.isImageZoomed = function(){
				var transformString = app.getTransform(app.zoomableArea);
				// assumes the transform string has following format : (scaleX,0,0,scaleY,panX,panY)
				
				var values = transformString.split('(')[1];
			    values = values.split(')')[0];
			    values = values.split(',');
			    console.log(values);
			    var scaleX = values[0];
			    var scaleY = values[3];
			    if (scaleX == 1 && scaleY == 1){
			    	return false;
			    }
			    else{
			    	return true;
			    }
			};
			
			app.setSwipeArea = function(swipeAreaId){
				var elemRect =  document.getElementById(swipeAreaId);
				var self = app;
				if (elemRect != null){
					var hammertime = Hammer(elemRect).on('swipe, dragend', function(event){
						console.log("Hammer swipe!");
						console.log(event);
						if (!self.isImageZoomed()){						
							if (event.gesture.direction == 'left'){
								self.nextSlide();
							}
							else if (event.gesture.direction == 'right'){
								self.prevSlide();
							}
						}
					});
					console.log("Swipe area set!");
				}
				app.zoomableArea = elemRect;
			};
		};
	};
		
	return submodule;
});




