// Filename: main.js 

// Require.js allows us to configure shortcut alias 
// There usage will become more apparent further along in the tutorial. 

require.config({
	baseUrl: 'js',
	paths: {
		
		jquery: 'http://code.jquery.com/jquery-1.10.1.min', 
		jqueryui: 'http://code.jquery.com/ui/1.10.3/jquery-ui',
		underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min', 
		backbone:'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
		bootstrap: 'http://netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/js/bootstrap.min',
		tiny_color : 'lib/tinycolor-0.9.15.min',
		jquery_pick_a_color: 'lib/pick-a-color-1.1.7.min',
		socketio: '/socket.io/socket.io',
		RTCMulticonnector: 'webrtc/RTCMultiConnection-v1.4_AMD'
		
	},
	shim: {
	    'backbone': {
	        deps: ['underscore', 'jquery','bootstrap'],
	        exports: 'Backbone'
	    },
	    'underscore': {
	        exports: '_'
	    },
	    'jqueryui': {
	    	deps: ['jquery']
	    },
	    "jquery_pick_a_color" : ["jquery","tiny_color"],
	    'RTCMulticonnector': {
	    	deps: ['socketio']
	    }
	}
}); 

require([ 
          
// Load our app module and pass it to our definition function

'app',
], 
function(App){ 
	// The "app" dependency is passed in as "App" 
	App.initialize(); 
});
