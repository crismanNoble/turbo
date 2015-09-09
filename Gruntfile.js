module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      all: {
        files: ['src/**/*'],
        tasks: ['setup'],
        options: {
          spawn: false,
        },
      },
    },

    less: {

      generate: {
        files: {
          "dist/css/style.css": "src/styles/style.less"
        }
      }

    },

    copy: {
      main: {
        files: [
          // jquery
          {expand: true, cwd: 'bower_components/jquery/dist/', src: ['jquery.min.js'], dest: 'dist/js'},

          // html files
          {expand: true, cwd: 'src/markup/', src: ['*.html'], dest: 'dist/'},

          // js files
          {expand: true, cwd: 'src/scripts/', src: ['*.js'], dest: 'dist/js'},

          // images
          {expand: true, cwd: 'src/images/', src: ['*'], dest: 'dist/img'},

        ],
      },
    },

  });

  grunt.registerTask('setup', ['less','copy']);
  grunt.registerTask('default', ['setup',]);
}