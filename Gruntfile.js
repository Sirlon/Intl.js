module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            cldr   : ['tmp/cldr**', 'data/cldr**', 'locale-data/'],
            test262: ['tmp/test262**', 'data/test262**', 'tests/test262/'],
            lib    : ['lib/', 'dist/'],
        },

        curl: {
            cldr: {
                src : 'http://www.unicode.org/Public/cldr/26/json-full.zip',
                dest: 'tmp/cldr.zip',
            },
            test262: {
                src : 'https://github.com/tc39/test262/archive/master.zip',
                dest: 'tmp/test262.zip',
            }
        },

        unzip: {
            cldr: {
                src : 'tmp/cldr.zip',
                dest: 'tmp/cldr/',
            },
            test262: {
                src : 'tmp/test262.zip',
                dest: 'tmp/',
            }
        },

        copy: {
            cldr: {
                expand: true,
                cwd   : 'tmp/cldr/',
                dest  : 'data/',
                src   : [
                    '*-license.*',
                    'supplemental/parentLocales.json',
                    'main/*/ca-*.json',
                    'main/*/currencies.json',
                    'main/*/numbers.json',
                ]
            },
            test262: {
                expand: true,
                cwd   : 'tmp/test262-master/',
                dest  : 'tests/test262',
                src   : [
                    'LICENSE',
                    'test/intl402/*.js',
                    'harness/*.js',
                ]
            },
            src: {
                expand : true,
                flatten: true,
                src    : ['src/*.js'],
                dest   : 'lib/'
            }
        },

        concat: {
            complete: {
                src : ['dist/Intl.min.js', 'locale-data/complete.js'],
                dest: 'dist/Intl.complete.js',
            },
        },

        jshint: {
            all: ['index.js', 'src/*.js', '*.json']
        },

        browserify: {
          dist: {
            files: {
              'dist/Intl.js': ['src/main.js'],
            }
          }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            build: {
                files: {
                    'dist/Intl.min.js': ['dist/Intl.js']
                }
            }
        },

    });

    grunt.loadTasks('./tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-extract-cldr-data');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('build', [
        'browserify', 'uglify', 'copy:src', 'concat:complete'
    ]);

    grunt.registerTask('cldr', ['extract-cldr-data', 'compile-data']);

    grunt.registerTask('default', ['jshint', 'clean:lib', 'build']);

    grunt.registerTask('update-cldr-data', [
        'clean:cldr',
        'curl:cldr',
        'unzip:cldr',
        'copy:cldr',
        'cldr',
    ]);

    grunt.registerTask('update-test262', [
        'clean:test262',
        'curl:test262',
        'unzip:test262',
        'copy:test262',
        'update-tests',
    ]);

};
