/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2018 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
module.exports = function (grunt) {
    /*  build core  */
    grunt.config.merge({
        newer: {
            "src-core": {
                src: [ "src/core/component.js", "src/core/component-*.js" ],
                dest: "bld/component.js",
                options: { tasks: [ "expand-include:src-core" ] }
            }
        },
        "expand-include": {
            "src-core": {
                src: "src/core/component.js",
                dest: "bld/component.js",
                options: {
                    directiveSyntax: "js",
                    globalDefines: {
                        major: "<%= version.major %>",
                        minor: "<%= version.minor %>",
                        micro: "<%= version.micro %>",
                        date:  "<%= version.date  %>"
                    }
                }
            }
        },
        clean: {
            "src-core": [
                "bld/component.js"
            ]
        }
    });

    /*  build plugins (debugger only)  */
    grunt.config.merge({
        newer: {
            "src-plugin-debugger": {
                src: [ "src/plugin/component.plugin.debugger.js", "src/plugin/component.plugin.debugger-*.js" ],
                dest: "bld/component.plugin.debugger.js",
                options: { tasks: [ "expand-include:src-plugin-debugger" ] }
            }
        },
        "expand-include": {
            "src-plugin-debugger": {
                src: "src/plugin/component.plugin.debugger.js",
                dest: "bld/component.plugin.debugger.js",
                options: {
                    directiveSyntax: "js"
                }
            }
        },
        clean: {
            "src-plugin-debugger": [
                "bld/component.plugin.debugger.js"
            ]
        }
    });

    /*  build plugins (testdrive only)  */
    grunt.config.merge({
        newer: {
            "src-plugin-testdrive": {
                src: [ "src/plugin/component.plugin.testdrive.js", "src/plugin/component.plugin.testdrive-*.js" ],
                dest: "bld/component.plugin.testdrive.js",
                options: { tasks: [ "expand-include:src-plugin-testdrive" ] }
            }
        },
        "expand-include": {
            "src-plugin-testdrive": {
                src: "src/plugin/component.plugin.testdrive.js",
                dest: "bld/component.plugin.testdrive.js",
                options: {
                    directiveSyntax: "js"
                }
            }
        },
        clean: {
            "src-plugin-testdrive": [
                "bld/component.plugin.testdrive.js"
            ]
        }
    });

    /*  build plugins (others)  */
    grunt.config.merge({
        newer: {
            "src-plugin-other": {
                src: [
                    "src/plugin/component.plugin.*.js",
                    "!src/plugin/component.plugin.debugger*.js",
                    "!src/plugin/component.plugin.testdrive*.js"
                ],
                dest: "bld/component.plugin.jquery.js",
                options: { tasks: [ "copy:src-plugin-other" ] }
            }
        },
        copy: {
            "src-plugin-other": {
                files: [{
                    expand: true,
                    src: [
                        "src/plugin/component.plugin.*.js",
                        "!src/plugin/component.plugin.debugger*.js",
                        "!src/plugin/component.plugin.testdrive*.js"
                    ],
                    dest: "bld",
                    flatten: true
                }]
            }
        },
        clean: {
            "src-plugin-other": [
                "bld/component.plugin.*.js"
            ]
        }
    });

    /*  linting (JSHint)  */
    grunt.config.merge({
        newer: {
            "src-jshint": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-jshint",
                options: { tasks: [ "jshint:src", "touch:src-jshint-done" ] }
            },
            "src-eslint": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-eslint",
                options: { tasks: [ "eslint:src", "touch:src-eslint-done" ] }
            }
        },
        jshint: {
            "src": [ "bld/*.js", "!bld/*.min.js" ]
        },
        eslint: {
            "src": {
                src: [ "bld/*.js", "!bld/*.min.js" ]
            }
        },
        touch: {
            "src-jshint-done": {
                src: [ "bld/.done-src-jshint" ]
            },
            "src-eslint-done": {
                src: [ "bld/.done-src-eslint" ]
            }
        },
        clean: {
            "src-jshint": [
                "bld/.done-src-jshint"
            ],
            "src-eslint": [
                "bld/.done-src-eslint"
            ]
        }
    });

    /*  minification (UglifyJS)  */
    grunt.config.merge({
        newer: {
            "src-min": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/component.min.js",
                options: { tasks: [ "uglify:src-min" ] }
            }
        },
        uglify: {
            "src-min": {
                files: [{
                    expand: true,
                    src: [ "bld/*.js", "!bld/*.min.js" ],
                    dest: "bld/",
                    rename: function (dest, src) { return dest + src.replace(/\.js$/, ".min.js"); },
                    flatten: true
                }]
            },
            options: {
                preserveComments: "some",
                report: "none"
            }
        },
        clean: {
            "src-min": [
                "bld/component*.min.js"
            ]
        }
    });

    /*  task aliasing  */
    grunt.registerTask("src-build", [
        "newer:src-core",
        "newer:src-plugin-debugger",
        "newer:src-plugin-testdrive",
        "newer:src-plugin-other",
        "newer:src-jshint",
        "newer:src-eslint",
        "newer:src-min"
    ]);
    grunt.registerTask("src-clean", [
        "clean:src-core",
        "clean:src-plugin-debugger",
        "clean:src-plugin-testdrive",
        "clean:src-plugin-other",
        "clean:src-jshint",
        "clean:src-eslint",
        "clean:src-min"
    ]);
};

