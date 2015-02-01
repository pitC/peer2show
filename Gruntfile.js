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
		    }
	  });
//    });
//    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-watch');
//    grunt.loadNpmTasks('grunt-contrib-cssmin');
//    grunt.loadNpmTasks('grunt-build-control');
//    grunt.loadNpmTasks('grunt-contrib-copy');
//    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:build',"copy:main" ]);
//    
//    grunt.registerTask('build', [ 'buildcontrol:development'
//                                 // Collection of tasks that build code to the 'dist' directory...
//                               ]);
////    grunt.registerTask('heroku:production', 'clean mincss uglify');
	grunt.registerTask('heroku:production', 'uglify');
    
};