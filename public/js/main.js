// Filename: main.js 

// Require.js allows us to configure shortcut alias 
// There usage will become more apparent further along in the tutorial. 

require.config({
	baseUrl: 'js',
	paths: {
		
		jquery: 'http://code.jquery.com/jquery-1.10.1.min', 
		underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min', 
		backbone:'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
		backbone_local_storage:'lib/backbone-localstorage',
		bootstrap: 'http://netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/js/bootstrap.min'
	},
	shim: {
    'backbone': {
        deps: ['underscore', 'jquery','bootstrap'],
        exports: 'Backbone'
    },
    'underscore': {
        exports: '_'
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
