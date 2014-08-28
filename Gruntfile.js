module.exports = function(grunt) {
    grunt.initConfig({
//    	clean: {
//    	      tests: ['tmp'],
//    	    },
//    	concat: {
//            css: {
//               src: [
//                     'public/css/*'
//                    ],
//                dest: 'public/combined.css'
//            },
//            js : {
//            	
//            }
//        },
//        cssmin : {
//            css:{
//                src: 'public/combined.css',
//                dest: 'public/combined.min.css'
//            }
//        },
        uglify : {
        	build: {
                src: 'public/js/app.js',
                dest: 'public/js/app.js'
            }
        },
//        buildcontrol: {
//            options: {
//              dir: 'dist',
//              commit: true,
//              push: true,
//              message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
//            },
//            development: {
//              options: {
//                remote: 'staging',
//                branch: 'master'
//              }
//            },
//            
//        },
//        copy: {
//      	  main: {
//      	    src: '*',
//      	    dest: 'dist/',
//      	  },
//      	},
        pkg: grunt.file.readJSON('package.json')
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-build-control');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:build',"copy:main" ]);
    
    grunt.registerTask('build', [ 'buildcontrol:development'
                                 // Collection of tasks that build code to the 'dist' directory...
                               ]);
//    grunt.registerTask('heroku:production', 'clean mincss uglify');
    grunt.registerTask('heroku:production', 'uglify');
    
};