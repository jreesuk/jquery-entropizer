module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			scripts: {
				files: ['src/**/*', 'test/**/*.js', '.jshintrc'],
				tasks: ['default']
			}
		},
		karma: {
			unit: {
				options: {
					runnerPort: 9876,
					browsers: ['Chrome', 'Firefox', 'IE'],
					frameworks: ['requirejs', 'jasmine'],
					files: [
						{ pattern: 'lib/**/*.js', included: false },
                        { pattern: 'src/**/*.js', included: false },
                        { pattern: 'test/jquery-entropizer-tests.js', included: false },
                        'test/test-main.js'
					],
					singleRun: true
				}
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['src/**/*.js', 'test/**/*.js']
		},
		jasmine: {
			src: ['src/**/*.js'],
			options: {
				specs: ['test/jquery-entropizer-tests.js'],
				template: require('grunt-template-jasmine-requirejs'),
				templateOptions: {
					requireConfig: {
						baseUrl: 'src/js',
						paths: {
							jquery: '../../lib/jquery',
							entropizer: '../../lib/entropizer'
						}
					}
				}
			}
		},
		clean: {
			dist: {
				src: ['dist/**/*']
			}
		},
		copy: {
			main: {
				src: 'src/js/jquery-entropizer.js',
				dest: 'dist/js/<%= pkg.name %>.js'
			},
			lib: {
				src: ['bower_components/entropizer/dist/entropizer.js', 'bower_components/jquery/dist/jquery.js'],
				dest: 'lib/',
				filter: 'isFile',
				expand: true,
				flatten: true
			}
		},
		usebanner: {
			main: {
				options: {
					position: 'top',
					banner: '/*!\n * jquery-entropizer - <%= pkg.version %>\n * Built: <%= grunt.template.today("yyyy-mm-dd HH:MM") %>\n * https://github.com/jreesuk/jquery-entropizer\n * \n * Copyright (c) 2014 Jonathan Rees\n * Licensed under the MIT License\n */',
					linebreak: true
				},
				files: {
					src: ['dist/js/<%= pkg.name %>.js', 'dist/css/<%= pkg.name %>.css']
				}
			}
		},
		uglify: {
			options: {
				preserveComments: 'some',
				sourceMap: 'dist/js/<%= pkg.name %>.min.map',
				sourceMapRoot: '../..',
				sourceMappingURL: '<%= pkg.name %>.min.map'
			},
			dist: {
				src: ['dist/js/<%= pkg.name %>.js'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},
		less: {
			main: {
				files: {
					'dist/css/<%= pkg.name %>.css': 'src/css/jquery-entropizer.less'
				}
			}
		},
		cssmin: {
			main: {
				files: {
					'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['jshint', 'copy:lib', 'jasmine', 'clean', 'copy:main', 'less', 'usebanner', 'uglify', 'cssmin']);
}