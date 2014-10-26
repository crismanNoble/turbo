module.exports = function(grunt) {

	var _ = require('lodash');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-combine-media-queries');
	grunt.loadNpmTasks('grunt-autoprefixer');

	grunt.loadNpmTasks('grunt-compile-handlebars');
	grunt.loadNpmTasks('grunt-prettify');
	grunt.loadNpmTasks('grunt-html-minify');

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
	//images got optimized
	//js got linted, checked for console logs, then minified
	//upload to ftp if all looked good

	//for dev it would be cool to:
	//prettify all js

	grunt.initConfig({

		dirs : {
			'source':'src',
			'temp':'tmp',
			'temp2':'tmp2',
			target : {
				development : 'target_dev',
				production : 'target_dist',
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
	  }
		
	});


	// Default task(s).
	grunt.registerTask('buildTemplates',['compile-handlebars']);
	grunt.registerTask('development', ['clean:development','less:development','buildTemplates','prettify:development','cmq','autoprefixer:development','clean:temp']);
	grunt.registerTask('production', ['clean:production','development','less:production','html_minify:production']);

	grunt.registerTask('default', ['development']);

};