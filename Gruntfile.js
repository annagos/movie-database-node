'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        /*
         * Information can be loaded from the package.json and reused in the
         * Gruntfile. This is nice in order to avoid duplication of information.
         */
        pkg: '<json:package.json>',

        /*
         * Just a definition of all the sources files and their location. We
         * put them in a meta section so that we only need to declare them once.
         */
        meta: {
            all: ['client/**/*', 'server/**/*', 'test/**/*'],
            gruntfile: 'Gruntfile.js',
            server: {
                src: 'server/**/*.js',
                test: 'test/server/**/*.js'
            },
            client: {
                js: ['client/js/**/*.js', '!client/js/lib/**/*'],
                tests: {
                    ui: {
                        configLocal: 'test/client/ui-local.conf.js',
                        configSauce: 'test/client/ui-saucelabs.conf.js',
                        src: 'test/client/ui/**/*.js'
                    },
                    unit: {
                        config: 'test/client/unit.conf.js',
                        src: 'test/client/unit/**/*.js'
                    }
                }
            }
        },

        /*
         * Simplemocha is executing our Mocha tests (Mocha is our test runner
         * for the server-side tests).
         */
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: '<%= meta.server.test %>'
            }
        },

        /*
         * Statis source code analyses. JSHint verifies that we are adhering
         * to good coding styles, avoid pitfalls and much more.
         * http://jshint.com/docs/
         *
         * We are configuring different settings for the different parts of our
         * code, as browser environments are different to NodeJS environments.
         */
        jshint: {
            server: {
                files: { src: '<%= meta.server.src %>' },
                options: {
                    node: true,
                    globalstrict: true
                }
            },
            servertest: {
                files: { src: '<%= meta.server.test %>' },
                options: {
                    node: true,
                    globalstrict: true,
                    expr: true, // to allow the use of expet(val).to.be.empty
                    globals: {
                        describe: false,
                        beforeEach: false,
                        it: false
                    }
                }
            },
            gruntfile: {
                files: { src: '<%= meta.gruntfile %>' },
                options: {
                    node: true,
                    globalstrict: true
                }
            },
            client: {
                files: { src: '<%= meta.client.js %>' },
                options: {
                    browser: true,
                    devel: true,
                    unused: false,
                    globals: {
                        angular: false
                    }
                }
            },
            clientUi: {
                files: { src: '<%= meta.client.tests.ui.src %>' },
                options: {
                    node: true,
                    globalstrict: true,
                    globals: {
                        browser: false,
                        expect: false,
                        describe: false,
                        it: false,
                        beforeEach: false,
                        element: false,
                        by: false
                    }
                }
            },
            clientUnit: {
                files: { src: '<%= meta.client.tests.unit.src %>' },
                options: {
                    newcap: false,
                    undef: false,
                    immed: false,
                    unused: false,
                    sub: false,
                    noempty: false,
                    expr: true,
                    devel: true,
                    globals: {
                        describe: false,
                        it: false,
                        chai: false
                    }
                }
            },
            options: {
                bitwise: true,
                boss: true,
                curly: true,
                camelcase: true,
                eqeqeq: true,
                eqnull: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                maxcomplexity: 6,
                maxdepth: 3,
                maxparams: 4,
                maxstatements: 14,
                maxlen: 120,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                sub: true,
                strict: true,
                trailing: true,
                undef: true,
                unused: true
            }
        },

        /*
         * Karma is our super awesome test runner. It starts up a browser for
         * you and can even observe file changes. We have our own Grunt
         * plugin as we want the tests to be run asynchronously.
         */
        karma: {
            unit: {
                configFile: '<%= meta.client.tests.unit.config %>',
                browsers: ['PhantomJS'],
                singleRun: true
            }
        },

        /*
         * Protractor is the preferred AngularJS test runner. It is basically
         * a small wrapper around WebDriverJS and Selenium which enables
         * tests of AngularJS-based applications.
         */
        protractor: {
            local: {
                configFile: '<%= meta.client.tests.ui.configLocal %>'
            },
            travis: {
                configFile: '<%= meta.client.tests.ui.configSauce %>'
            }
        },

        /*
         * Watch is handy when you want to execute tasks upon file changes, e.g.
         * execute tests and static source code analysis.
         */
        watch: {
            files: '<%= meta.all %>',
            tasks: ['jshint', 'simplemocha', 'karma:unit']
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.loadTasks('./tasks');

    grunt.registerTask('travis', [
        'jshint',
        'simplemocha',
        'karma:unit',
        'server',
        'protractor:travis'
    ]);

    grunt.registerTask('test', [
        'jshint',
        'simplemocha',
        'karma:unit',
        'server',
        'protractor:local'
    ]);

    grunt.registerTask('dev', ['server', 'watch']);
};
