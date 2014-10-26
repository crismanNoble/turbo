module.exports = function(grunt) {

	var _ = require('lodash');

	//normal stuff
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	//css
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-combine-media-queries');
	grunt.loadNpmTasks('grunt-autoprefixer');

	//html
	grunt.loadNpmTasks('grunt-compile-handlebars');
	grunt.loadNpmTasks('grunt-prettify');
	grunt.loadNpmTasks('grunt-html-minify');

	//js
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//images
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	var pageData = grunt.file.readJSON('./build/pages.json');
	var templatesToBuild = {};
	
	var templateTaskTpl = {
		'helpers': '<%= dirs.source %>/markup/helpers/*.js',
		'partials': '<%= dirs.source %>/markup/partials/*.handlebars'
	};

	_.each(pageData.pages,function(d,i){
		var taskObj = _.extend({
			'template': '<%= dirs.source %>/markup/pages/'+d.pageName+'.handlebars',
			'templateData' : d,
			'output' : '<%= dirs.temp %>/'+d.href,
		},templateTaskTpl);
		
		templatesToBuild[d.pageName] = taskObj;
	});

	//for prod it would be cool if..
	//js got linted, checked for console logs, then minified
	//upload to ftp if all looked good (https://www.npmjs.org/package/grunt-ftp-push)
	//some kind of git task? (https://www.npmjs.org/package/grunt-git-them-all)

	//for dev it would be cool to:
	//look at including a font folder and moving it to production

	grunt.initConfig({

		dirs : {
			'source':'src',
			'temp':'tmp',
			'temp2':'tmp2',
			target : {
				development : 'development',
				production : 'production',
			}
		},

		clean: {
			development: '<%= dirs.target.development %>',
			production: '<%= dirs.target.production %>',
			temp: ['<%= dirs.temp %>','<%= dirs.temp2 %>']
		},

		less : {
			development: {
				options: {
					//paths: ["assets/css"]
				},
				files: {
					"<%= dirs.temp %>/css/style.css": "<%= dirs.source %>/less/style.less"
				}
			},
			production: {
				options: {
					compress: true
				},
				files: {
					"<%= dirs.target.production %>/css/style.css": "<%= dirs.target.development %>/css/style.css"
				}
			}
		},

		cmq: {
	    development: {
	      // Target-specific file lists and/or options go here.
		    files: {
	        '<%= dirs.temp2 %>/css': ['<%= dirs.temp %>/css/style.css']
	      }
	    }
	  },

		'compile-handlebars': templatesToBuild,

		prettify: {
			development: {
				options: {
				// Task-specific options go here.
					indent: 1,
					indent_char: '	',
					indent_inner_html: false,
					brace_style: 'expand',
					max_preserve_newlines: 1
				},
				expand: true,
				cwd: '<%= dirs.temp %>/',
				ext: '.html',
				src: ['*.html'],
				dest: "<%= dirs.target.development %>/"

			}
			
		},

		autoprefixer: {
			development: {
				src: '<%= dirs.temp2 %>/css/style.css',
				dest: '<%= dirs.target.development %>/css/style.css'
			},
			production: {
				src: '<%= dirs.temp2 %>/css/style.css',
				dest: '<%= dirs.target.production %>/css/style.css'	
			}
		},

		html_minify: {
			production : {
				expand: true,
				cwd: '<%= dirs.target.development %>/',
				ext: '.html',
				src: ['**/*.html'],
				dest: "<%= dirs.target.production %>/"
			}
	  },

	  uglify: {
	  	'header-dev': {
	  		options: {
	  			compress: false,
	  			beautify: true,
	  			preserveComments: 'all'
	  		},
	      files: {
	        '<%= dirs.target.development %>/js/headScript.js': ['src/js/h1.js','src/js/h2.js']
	      }
	    },
	    'footer-dev': {
	  		options: {
	  			compress: false,
	  			beautify: true,
	  			preserveComments: 'all'
	  		},
	      files: {
	        '<%= dirs.target.development %>/js/footScript.js': ['src/js/f1.js','src/js/f2.js']
	      }
	    },
	    'header-dist': {
	  		options: {
	  			compress: {
	  				drop_console: true
	  			},
	  			mangle: true,
	  			preserveComments: false,
	  			
	  		},
	      files: {
	        '<%= dirs.target.production %>/js/headScript.js':  '<%= dirs.target.development %>/js/headScript.js'
	      }
	    },
	    'footer-dist': {
	  		options: {
	  			compress: {
	  				drop_console: true
	  			},
	  			mangle: true,
	  			preserveComments: false,
	  			drop_console: true
	  		},
	      files: {
	        '<%= dirs.target.production %>/js/footScript.js':  '<%= dirs.target.development %>/js/footScript.js'
	      }
	    }
	  },

	  imagemin: {
	  	development: {
	  		options: {
	  			optimizationLevel: 1,
	  			progressive: true
	  		},
	  		files: [{
	        expand: true,
	        cwd: '<%= dirs.source %>/',
	        src: ['**/*.{png,jpg,gif}'],
	        dest: '<%= dirs.target.development %>/'
	      }]
	  	}
	  },

	  copy: {
		  images: {
		  	files: [{
	        expand: true,
	        cwd: '<%= dirs.target.development %>/',
	        src: ['images/*'],
	        dest: '<%= dirs.target.production %>/'
	      }]
		  },
		}
		
	});

	// helper tasks
	grunt.registerTask('buildTemplates',['compile-handlebars']);
	grunt.registerTask('js-dev',['uglify:footer-dev','uglify:header-dev']);
	grunt.registerTask('js-dist',['uglify:footer-dist','uglify:header-dist']);
	grunt.registerTask('copy-dist',['copy:images']);

	//main tasks
	grunt.registerTask('development', ['clean:development','less:development','buildTemplates','prettify:development','cmq','autoprefixer:development','js-dev','imagemin:development','clean:temp']);
	grunt.registerTask('production', ['clean:production','development','less:production','js-dist','html_minify:production','copy-dist']);

	//defualt tasks
	grunt.registerTask('default', ['production']);

};