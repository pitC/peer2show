define([
       
        ],function () {

	var submodule = function(){
		this.init = function(app){
			app.nextSlide = function(options){
				app.slideCollection.next();
				if (!options || !options.remote)
					app.rpcNext();
			};
			
			app.prevSlide = function(options){
				app.slideCollection.prev();
				if (!options || !options.remote)
					app.rpcPrev();
			};
			
			app.jumpToByURL = function (options){
				app.slideCollection.jumpToByURL(options.dataURL);
				if (!options || !options.remote){
					app.rpcJumpToURL(options.dataURL);
				}
			};
			
			app.getIndexFromURL = function(url){
				var index = -1;
				var slide = app.slideCollection.findWhere({dataURL:url});
				if (slide != null){
					index = app.slideCollection.indexOf(slide);
				}
				return index;
			};
			
			app.jumpToByIndex = function (options){
				app.slideCollection.jumpTo(options.index);
				console.log("Jump to by index "+options.index);
				if (!options || !options.remote){
					app.rpcJumpToIndex(options.index);
				}
			};
			
			app.removeImage = function(options){
				console.log("remove image at "+options.index);
				var slide = app.slideCollection.at(options.index);
				console.log(slide);
				app.slideCollection.remove(slide);
				if (!options || !options.remote){
					app.rpcRemoveImage(options.index);
				}
			};
			
			app.transformImage = function(options){
//				app.zoomableArea.css('-webkit-transform',options.transform);
				var originalTransform = options.transform;
				var originalW = options.dims.w;
				var originalH = options.dims.h;
				var selfW = app.zoomableArea.width();
				var selfH = app.zoomableArea.height();
				var ratioW = selfW/originalW;
				var ratioH = selfH/originalH;
				var array = matrixToArray(originalTransform);
				console.log("Self "+selfW+"/"+selfH);
				console.log("Ratio "+ratioW+"/"+ratioH);
				array[4] = array[4]*ratioW;
				array[5] = array[5]*ratioH;
				var transformedMatrix = arrayToMatrixTransform(array);
				console.log("Transformed matrix:"+transformedMatrix);
				app.zoomableArea.css('transform',transformedMatrix);
			};
			
			matrixToArray = function (str) {
				  return str.match(/(-?[0-9\.]+)/g);
			};
			
			arrayToMatrixTransform = function(array){
				var str = "matrix(";
				for (var i in array){
					var val = array[i];
					str += val+",";
				}
				// remove last comma
				str = str.substring(0, str.length-1);
				str+=")";
				return str;
			};
			
		};
	};
		
	return submodule;
});




