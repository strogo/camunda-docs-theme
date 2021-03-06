'use strict';
/*jshint node:true*/
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var setup = grunt.file.readJSON(__dirname + '/package.json').setup;

  setup.target = process.env.THEME_TARGET || setup.target;

  grunt.initConfig({
    setup: setup,

    copy: {
      themeInfo: {
        files: [{
          expand: true,
          src: ['theme.toml', 'LICENSE'],
          dest: '<%= setup.target %>/'
        }]
      },
      bootstrapFonts: {
        files: [{
          cwd: 'node_modules/camunda-commons-ui/node_modules/bootstrap/fonts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      bpmnFonts: {
        files: [{
          cwd: 'node_modules/camunda-commons-ui/node_modules/bpmn-font/dist/font/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      uiFonts: {
        files: [{
          cwd: 'node_modules/camunda-commons-ui/vendor/fonts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      docsFonts: {
        files: [{
          cwd: 'fonts/',
          expand: true,
          src: ['**/*', '!config.json'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      layouts: {
        files: [{
          cwd: 'layouts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/layouts/'
        }]
      },
      images: {
        files: [{
          cwd: 'node_modules/camunda-commons-ui/resources/img/',
          expand: true,
          src: ['favicon.ico'],
          dest: '<%= setup.target %>/static/img/'
        },
        {
          cwd: 'images/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/img/'
        }]
      }
    },

    less: {
      options: {
        dumpLineNumbers: 'comments',
        compress: false,
        sourceMap: false,
        paths: [
          'node_modules',
          'node_modules/camunda-commons-ui/resources/less',
          'node_modules/camunda-commons-ui/lib/widgets',
          'node_modules/camunda-commons-ui/node_modules/bootstrap/less'
        ]
      },
      styles: {
        files: [{
          src: ['styles/docs.less'],
          dest: '<%= setup.target %>/static/css/docs.css'
        }]
      }
    },

    browserify: {
      scripts: {
        files: [{
          src: ['scripts/index.js'],
          dest: '<%= setup.target %>/static/js/docs.js'
        }]
      }
    },

    watch: {
      layouts: {
        files: ['layouts/**/*'],
        tasks: ['copy:layouts']
      },
      styles: {
        files: [
          'node_modules/camunda-commons-ui/{resources/less,lib/widgets}/**/*.less',
          'styles/**/*.less'
        ],
        tasks: ['less:styles']
      },
      scripts: {
        files: ['scripts/**/*.js'],
        tasks: ['browserify:scripts']
      }
    },

    cssmin: {
      styles: {
        files: [{
          src: '<%= setup.target %>/static/css/docs.css',
          dest: '<%= setup.target %>/static/css/docs.css'
        }]
      }
    },

    uglify: {
      scripts: {
        files: [{
          src: '<%= setup.target %>/static/js/docs.js',
          dest: '<%= setup.target %>/static/js/docs.js'
        }]
      }
    },

    // -----------------------------------------------

    clean: ['.tmp'],

    gitclone: {
      dist: {
        options: {
          directory: '.tmp',
          repository: 'git@github.com:camunda/camunda-docs-theme.git',

        }
      }
    },

    gitcheckout: {
      dist: {
        options: {
          cwd: '.tmp',
          branch: 'dist'
        }
      }
    },

    gitadd: {
      dist: {
        options: {
          cwd: '.tmp',
          all: true
        }
      }
    },

    gitcommit: {
      dist: {
        options: {
          cwd: '.tmp',
          message: 'chore(update): publish new version of theme',
          noStatus: true,
          allowEmpty: true
        }
      }
    },

    gitpush: {
      dist: {
        options: {
          cwd: '.tmp',
          remote: 'origin',
          branch: 'dist'
        }
      }
    }
  });

  grunt.registerTask('build', ['copy', 'less:styles', 'browserify:scripts']);

  grunt.registerTask('optimize', [
    'uglify:scripts',
    'cssmin:styles'
  ]);

  grunt.registerTask('publish', function () {
    grunt.config.set('setup.target', '.tmp');
    grunt.config.set('setup.minify', true);

    grunt.task.run([
      'clean',
      'gitclone:dist',
      'gitcheckout:dist',
      'build',
      'optimize',
      'gitadd:dist',
      'gitcommit:dist',
      'gitpush:dist'
    ]);
  });

  grunt.registerTask('default', ['build', 'watch']);
};
