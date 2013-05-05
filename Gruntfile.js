/* global module */
'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // lint
        jshint: {
            all: [
                './*.js',
                'lib/**/*.js',
                'test/**/*.js'
            ],
            options: {
                jshintrc: './.jshintrc'
            }
        },

        // test
        buster: {
            test: {
            }
        },

        // Creates documentation using the yuidoc program.
        // This task is not run with the main watcher, if you want
        // your changes to be automatically written to the api docs
        // you can run the `grunt watch:docs` task
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: './lib/',
                    outdir: './docs/'
                }
            }
        },

        // Benchmark
        benchmark: {
            all: {
                src: ['benchmarks/**/*-benchmark.js'],
                dest: 'benchmarks/results.csv',
                options: {
                    times: 100
                }
            }
        },

        // A static file server that serves the api documentation on
        // port 8888 when the `grunt connect:docs` command are run.
        // This task will run forever, so don't use it as part of a
        // chain of tasks!
        connect: {
            docs: {
                port: 8888,
                base: 'docs/'
            }
        },

        // Automatically run tasks when files changes
        watch: {
            scripts: {
                files: '<%= jshint.all %>',
                tasks: ['clear', 'jshint', 'buster']
            },
            docs: {
                files: [
                    'lib/**/*.js'
                ],
                tasks: ['docs']
            }
        }
    });


    // load tasks from grunt plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-clear');
    grunt.loadNpmTasks('grunt-buster');
    grunt.loadNpmTasks('grunt-benchmark');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-connect');


    // Shortcuts to tasks
    grunt.registerTask('benchmarks', 'benchmark');
    grunt.registerTask('test', 'buster');
    grunt.registerTask('docs', 'yuidoc');

    grunt.registerTask('default', ['docs', 'jshint:all', 'buster']);

};