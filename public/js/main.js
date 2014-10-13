// Filename: main.js 

// Require.js allows us to configure shortcut alias 
// There usage will become more apparent further along in the tutorial. 

require.config({
	baseUrl: 'js',
//	config: {
//        i18n: {
//            locale: 'pl'
//        }
//    },
	paths: {
		
		jquery: ['http://code.jquery.com/jquery-1.10.1.min'
		         //, 'lib/fallback/jquery-1.10.1.min'
		         ],
		jqueryui: [
		           'http://code.jquery.com/ui/1.10.3/jquery-ui'
//		           ,'lib/fallback/jquery-ui'
		           ],
		underscore: [
		             'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min'
//		             ,'lib/fallback/underscore-min' 
		             ],
		backbone: ['http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min'
//		           ,'lib/fallback/backbone-min'
		           ],
		bootstrap: [
		            'http://netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min'
//		            ,'lib/fallback/bootstrap.min'
		            ],
		tiny_color : 'lib/tinycolor-0.9.15.min',
		jquery_pick_a_color: 'lib/pick-a-color-1.1.7.min',
		peerjs: 'webrtc/peer',
		keen:'lib/keen',
		zoomer : 'lib/e-smart-zoom-jquery',
		hammer : 'lib/hammer.min',
		carousel : 'lib/owl.carousel'
	},
	shim: {
		
	    'backbone': {
	        deps: ['underscore', 'jquery', 'jqueryui','bootstrap'],
	        exports: 'Backbone'
	    },
	    'underscore': {
	        exports: '_'
	    },
	    'jqueryui': {
	    	deps: ['jquery']
	    },
	    "jquery_pick_a_color" :{
	    	deps: ["jquery","tiny_color"]
	    },
	    'bootstrap' : {
	        deps: ['jquery','jqueryui'],
	        exports: 'Bootstrap'
	    },
	    'zoomer' : {
	        deps: ['jquery'],
	        exports: 'Zoomer'
	    },
	    'carousel' : {
	    	deps: ['jquery'],
	    	exports: 'Carousel'
	    }
	    
	}
}); 

require([ 
          
// Load our app module and pass it to our definition function

'app',
], 
function(App){ 
	console.log(navigator.language+"/"+navigator.languages);
	// The "app" dependency is passed in as "App" 
	App.initialize(); 
	
});
