module.exports = function(grunt) {
	grunt.initConfig({
		uglify: {
		     
			  files: { 
				   cwd:"public/js/",
	               src: '**/*.js',  // source files mask
	               dest: 'public/js/',    // destination folder
	               expand: true,    // allow dynamic building
	               //flatten: true,   // remove all unnecessary nesting
	           }
		    },
		    cssmin:{
		    	css:{
	                src: 'public/css/style.css',
	                dest: 'public/css/style.css'
	            }
	  		}
	  });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('heroku:production', ['uglify','cssmin:css']);
    
};