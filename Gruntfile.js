module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-compile-handlebars');
  grunt.loadNpmTasks('grunt-contrib-clean');

  var pageData = grunt.file.readJSON('./build/pages.json');

  grunt.initConfig({

    dirs : {
      'source':'src',
      target : {
        development : 'target_dev',
        release : 'target_dist',
      }
    },

    clean: {
      development: '<%= dirs.target.development %>',
      release: '<%= dirs.target.release %>'
    },

    less : {
      development: {
        options: {
          //paths: ["assets/css"]
        },
        files: {
          "<%= dirs.target.development %>/css/style.css": "<%= dirs.source %>/less/style.less"
        }
      }
    },

    'compile-handlebars': {
      index: {
        template: '<%= dirs.source %>/markup/pages/index.handlebars',
        output: '<%= dirs.target.development %>/'+pageData.index.href,
        templateData: pageData.index,
        helpers: '<%= dirs.source %>/markup/helpers/*.js',
        partials: '<%= dirs.source %>/markup/partials/*.handlebars',
      }
    }
    
  });


  // Default task(s).
  grunt.registerTask('buildTemplates',['compile-handlebars:index']);
  grunt.registerTask('development', ['clean:development','less:development','buildTemplates']);

  grunt.registerTask('default', ['development']);

};