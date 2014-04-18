define([],function () {
	var Keen=Keen||{configure:function(e){this._cf=e},addEvent:function(e,t,n,i){this._eq=this._eq||[],this._eq.push([e,t,n,i])},setGlobalProperties:function(e){this._gp=e},onChartsReady:function(e){this._ocrq=this._ocrq||[],this._ocrq.push(e)}};(function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src=("https:"==document.location.protocol?"https://":"http://")+"dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();

    // Configure the Keen object with your Project ID and (optional) access keys.
Keen.configure({
    projectId: "534add50d97b85370300000f",
    writeKey: "9d303030e2564557612c76dde191920bf249628230f20ee9d8cb4b0d7bd46f7df1cec46bab127e723e59c0eedde64324601e8498a05f7c5e928e55c39c33c234c1cc66d407357fdf4e02def7a95f2ade3bbdcebf9dc772e7e5d569e7c024914373643d9e059568328155143005f2552f",
    readKey: "a2e3f92aa3f8a43037929bf6058980af15d01753351de0e51d471fe74f1766f8552ba2f8faa2280436af13e4e80000f95a5c0f88717d91a75352a3717afe1ca094317cd19346bdc240f2cf7b5975187bcba4e81cf845de812ff0ebfd4145c3cea64956a5aaa1392827fdff90aa08ef12"
});
	return Keen;
});



